import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe.server";
import { completeBookingDespiteIdResult } from "@/lib/id-verification-followup.server";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature");
        const secret = getStripeWebhookSecret();
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
              last_error?: { code?: string; reason?: string } | null;
              metadata?: Record<string, string>;
            };
            const bookingId = session.metadata?.booking_id;
            const isTerminal =
              event.type === "identity.verification_session.verified" ||
              event.type === "identity.verification_session.requires_input" ||
              event.type === "identity.verification_session.canceled";

            if (bookingId && isTerminal) {
              const { data: booking } = await supabaseAdmin
                .from("bookings")
                .select("id")
                .eq("id", bookingId)
                .eq("stripe_verification_session_id", session.id)
                .maybeSingle();

              if (booking) {
                await completeBookingDespiteIdResult({
                  bookingId: booking.id,
                  stripeSessionId: session.id,
                  failure:
                    session.status === "verified"
                      ? null
                      : {
                          status: session.status,
                          code: session.last_error?.code ?? null,
                          reason: session.last_error?.reason ?? null,
                        },
                });
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
