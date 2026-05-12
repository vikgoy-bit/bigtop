import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getPayment } from "@/lib/mollie.server";
import {
  ensureStoreganiseUser,
  createStoreganiseUnitOrder,
} from "@/lib/storeganise.server";

export const Route = createFileRoute("/api/public/mollie-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Mollie sends application/x-www-form-urlencoded with `id=tr_xxx`
        const form = await request.formData().catch(() => null);
        const paymentId = form?.get("id")?.toString();
        if (!paymentId) {
          return new Response("Missing id", { status: 400 });
        }

        let payment;
        try {
          payment = await getPayment(paymentId);
        } catch (e) {
          console.error("Mollie getPayment failed", e);
          return new Response("ok");
        }

        const metaBookingId =
          (payment.metadata as { booking_id?: string } | undefined)
            ?.booking_id || null;

        const query = supabaseAdmin
          .from("bookings")
          .select(
            "id,user_id,unit_id,total_pence,move_in_date,storeganise_user_id,storeganise_order_id",
          )
          .limit(1);
        const { data: rows } = metaBookingId
          ? await query.eq("id", metaBookingId)
          : await query.eq("mollie_payment_id", paymentId);
        const booking = rows?.[0];
        if (!booking) {
          console.warn("Mollie webhook: booking not found", paymentId);
          return new Response("ok");
        }

        const updates: {
          mollie_status?: string;
          mollie_customer_id?: string;
          mollie_mandate_id?: string;
          storeganise_user_id?: string;
          storeganise_order_id?: string;
          status?:
            | "pending_payment"
            | "pending_verification"
            | "active"
            | "cancelled";
        } = { mollie_status: payment.status };

        if (payment.status === "paid") {
          updates.status = "pending_verification";
          if (payment.customerId)
            updates.mollie_customer_id = payment.customerId;
          if (payment.mandateId) updates.mollie_mandate_id = payment.mandateId;

          // Hand off to Storeganise. Storeganise owns recurring billing from
          // here on — we do NOT create a Mollie subscription.
          if (!booking.storeganise_order_id) {
            try {
              // Look up the customer's email + profile details
              const { data: userInfo } =
                await supabaseAdmin.auth.admin.getUserById(booking.user_id);
              const email = userInfo?.user?.email;
              if (!email) throw new Error("No email on booking user");

              const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("full_name,phone")
                .eq("id", booking.user_id)
                .maybeSingle();

              let sgUserId = booking.storeganise_user_id;
              if (!sgUserId) {
                const sgUser = await ensureStoreganiseUser({
                  email,
                  name: profile?.full_name || undefined,
                  phone: profile?.phone || undefined,
                });
                sgUserId = sgUser.id;
                updates.storeganise_user_id = sgUserId;
              }

              // Compute promo end date (move-in + 6 weeks = 42 days) and the
              // start of the next calendar month after that, so Storeganise
              // staff can apply the prorated bill correctly.
              const moveIn = new Date(booking.move_in_date as string);
              const promoEnd = new Date(moveIn);
              promoEnd.setDate(promoEnd.getDate() + 42);
              const nextMonthStart = new Date(
                promoEnd.getFullYear(),
                promoEnd.getMonth() + 1,
                1,
              );
              const fmt = (d: Date) => d.toISOString().slice(0, 10);
              const proratedDays = Math.max(
                0,
                Math.round(
                  (nextMonthStart.getTime() - promoEnd.getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              );

              const order = await createStoreganiseUnitOrder({
                userId: sgUserId,
                unitTypeId: booking.unit_id,
                startDate: booking.move_in_date as string,
                notes: [
                  `Booking ${booking.id}`,
                  `First payment taken via Mollie (${payment.id}) — £${(booking.total_pence / 100).toFixed(2)} (£1 promo + BIGProtect).`,
                  `Mandate: ${payment.mandateId ?? "n/a"} (Mollie customer ${payment.customerId ?? "n/a"}).`,
                  `PROMO: 6 weeks for £1. Move-in ${fmt(moveIn)} → promo ends ${fmt(promoEnd)}.`,
                  `NEXT BILL: prorate ${proratedDays} days (${fmt(promoEnd)} → ${fmt(nextMonthStart)}), then full monthly cycle from ${fmt(nextMonthStart)}.`,
                ].join("\n"),
              });
              updates.storeganise_order_id = order.id;
            } catch (e) {
              console.error("Storeganise handoff failed", e);
              // Don't block the booking; staff can reconcile manually.
            }
          }
        } else if (
          payment.status === "failed" ||
          payment.status === "canceled" ||
          payment.status === "expired"
        ) {
          updates.status = "pending_payment";
        }

        await supabaseAdmin
          .from("bookings")
          .update(updates)
          .eq("id", booking.id);

        return new Response("ok");
      },
    },
  },
});
