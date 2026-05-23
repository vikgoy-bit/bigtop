import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getPayment } from "@/lib/mollie.server";
import { ensureStoreganiseOrderForBooking } from "@/lib/storeganise.server";

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
            "id,user_id,unit_id,total_pence,move_in_date,protect_tier_id,storeganise_user_id,storeganise_order_id",
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
          unit_snapshot?: Record<string, unknown>;
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
              Object.assign(
                updates,
                await ensureStoreganiseOrderForBooking({
                  supabaseAdmin,
                  booking,
                  payment: {
                    id: payment.id,
                    customerId: payment.customerId,
                    mandateId: payment.mandateId,
                  },
                }),
              );
            } catch (e) {
              console.error(
                "Storeganise handoff failed",
                e instanceof Error ? e.message : String(e),
                e instanceof Error ? e.stack : undefined,
              );
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
