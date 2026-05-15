import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripe } from "@/lib/stripe.server";
import { completeBookingDespiteIdResult } from "@/lib/id-verification-followup.server";

// Look back up to 7 days; ignore very recent rows that the user/webhook
// is still actively handling.
const MIN_AGE_MIN = 2;
const MAX_AGE_DAYS = 7;

async function processPendingVerification() {
  const now = Date.now();
  const newerThan = new Date(now - MAX_AGE_DAYS * 86_400_000).toISOString();
  const olderThan = new Date(now - MIN_AGE_MIN * 60_000).toISOString();

  const { data: bookings, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, storeganise_user_id, stripe_verification_session_id, status, created_at",
    )
    .eq("status", "pending_verification")
    .not("stripe_verification_session_id", "is", null)
    .gt("created_at", newerThan)
    .lt("created_at", olderThan)
    .limit(50);

  if (error) throw new Error(error.message);
  if (!bookings || bookings.length === 0) return { processed: 0, finalized: 0 };

  const stripe = getStripe();
  let finalized = 0;

  for (const b of bookings) {
    try {
      const session = await stripe.identity.verificationSessions.retrieve(
        b.stripe_verification_session_id!,
      );
      // Only act on terminal Stripe states. `processing` keeps polling next run.
      const isTerminal =
        session.status === "verified" ||
        session.status === "requires_input" ||
        session.status === "canceled";
      if (!isTerminal) continue;

      const res = await completeBookingDespiteIdResult({
        bookingId: b.id,
        stripeSessionId: b.stripe_verification_session_id!,
        failure:
          session.status === "verified"
            ? null
            : {
                status: session.status,
                code: session.last_error?.code ?? null,
                reason: session.last_error?.reason ?? null,
              },
      });
      if (!res.ok) {
        console.error("retry-verification followup fail", b.id, res.error);
        continue;
      }
      finalized++;
    } catch (e) {
      console.error("retry-verification loop error", b.id, e);
    }
  }

  return { processed: bookings.length, finalized };
}

export const Route = createFileRoute("/api/public/hooks/retry-verification")({
  server: {
    handlers: {
      GET: async () => {
        const result = await processPendingVerification();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async () => {
        const result = await processPendingVerification();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
