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

              const order = await createStoreganiseUnitOrder({
                userId: sgUserId,
                unitTypeId: booking.unit_id,
                startDate: booking.move_in_date as string,
                notes: [
                  `Booking ${booking.id}`,
                  `First payment taken via Mollie (${payment.id}) — £${(booking.total_pence / 100).toFixed(2)} (£1 first-month promo + BIGProtect).`,
                  `Mandate: ${payment.mandateId ?? "n/a"} (Mollie customer ${payment.customerId ?? "n/a"}).`,
                  `PROMO: First month £1. Apply a manual prorata credit to next month's bill — staff to configure in Storeganise.`,
                  `BILLING: Monthly cycle anchored to signup/move-in date (${booking.move_in_date}). Bill full months — do NOT sync to 1st-of-month or any fixed date.`,
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
