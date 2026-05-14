import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripe } from "@/lib/stripe.server";
import { sendBookingConfirmationEmail } from "@/lib/booking-confirmation.server";
import { setStoreganiseUserIdentitySession } from "@/lib/storeganise.server";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature");
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!sig || !secret) {
          return new Response("Missing signature/secret", { status: 400 });
        }

        const body = await request.text();
        const stripe = getStripe();

        let event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, secret);
        } catch (err) {
          console.error("Stripe webhook signature verification failed:", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          if (
            event.type === "identity.verification_session.verified" ||
            event.type === "identity.verification_session.requires_input" ||
            event.type === "identity.verification_session.canceled" ||
            event.type === "identity.verification_session.processing"
          ) {
            const session = event.data.object as {
              id: string;
              status: string;
              metadata?: Record<string, string>;
            };
            const bookingId = session.metadata?.booking_id;
            if (bookingId && event.type === "identity.verification_session.verified") {
              const { data: booking } = await supabaseAdmin
                .from("bookings")
                .select("id,storeganise_user_id")
                .eq("id", bookingId)
                .eq("stripe_verification_session_id", session.id)
                .maybeSingle();

              if (booking) {
                if (booking.storeganise_user_id) {
                  const sgRes = await setStoreganiseUserIdentitySession(
                    booking.storeganise_user_id,
                    session.id,
                  );
                  if (!sgRes.ok) {
                    console.error(
                      "Storeganise identity_session update failed:",
                      sgRes.error,
                    );
                  }
                }
                const result = await sendBookingConfirmationEmail(bookingId);
                if (!result.ok) {
                  console.error("Booking confirmation email failed:", result.error);
                }
              }
            }
          }
        } catch (err) {
          console.error("Stripe webhook handler error:", err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});
