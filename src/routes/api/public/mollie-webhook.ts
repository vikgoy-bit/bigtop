import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getPayment,
  createSubscription,
  penceToDecimalString,
} from "@/lib/mollie.server";

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
          // Return 200 so Mollie doesn't retry forever on a bad ID
          return new Response("ok");
        }

        // Find the booking. Prefer metadata.booking_id, fallback to stored mollie_payment_id.
        const metaBookingId =
          (payment.metadata as { booking_id?: string } | undefined)
            ?.booking_id || null;

        const query = supabaseAdmin
          .from("bookings")
          .select(
            "id,total_pence,move_in_date,mollie_customer_id,mollie_subscription_id",
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
          mollie_subscription_id?: string;
          status?: "pending_payment" | "pending_verification" | "active" | "canceled";
        } = { mollie_status: payment.status };

        if (payment.status === "paid") {
          updates.status = "pending_verification";
          if (payment.customerId)
            updates.mollie_customer_id = payment.customerId;
          if (payment.mandateId) updates.mollie_mandate_id = payment.mandateId;

          // Set up monthly subscription using the new mandate
          if (
            payment.customerId &&
            payment.mandateId &&
            !booking.mollie_subscription_id
          ) {
            try {
              const origin = new URL(request.url).origin;
              const startDate = new Date(booking.move_in_date as string);
              startDate.setMonth(startDate.getMonth() + 1);
              const sub = await createSubscription({
                customerId: payment.customerId,
                amountValue: penceToDecimalString(booking.total_pence),
                currency: "GBP",
                description: `Big Top Storage monthly — ${booking.id.slice(0, 8)}`,
                webhookUrl: `${origin}/api/public/mollie-webhook`,
                startDate: startDate.toISOString().slice(0, 10),
                metadata: { booking_id: booking.id },
              });
              updates.mollie_subscription_id = sub.id;
            } catch (e) {
              console.error("Mollie subscription create failed", e);
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
