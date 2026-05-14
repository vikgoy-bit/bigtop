import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripe } from "./stripe.server";
import { getRequestHost } from "@tanstack/react-start/server";
import { sendBookingConfirmationEmail } from "./booking-confirmation.server";
import { setStoreganiseUserIdentitySession } from "./storeganise.server";

export const startIdentityVerification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ bookingId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Confirm booking belongs to user
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("id,user_id,stripe_verification_session_id")
      .eq("id", data.bookingId)
      .single();
    if (error || !booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Forbidden");

    const stripe = getStripe();
    const host = getRequestHost();
    const proto = host.includes("localhost") ? "http" : "https";
    const returnUrl = `${proto}://${host}/book/success?booking_id=${booking.id}`;

    const session = await stripe.identity.verificationSessions.create({
      type: "document",
      metadata: { booking_id: booking.id, user_id: userId },
      return_url: returnUrl,
      options: {
        document: {
          require_matching_selfie: true,
          require_live_capture: true,
          allowed_types: ["driving_license", "passport", "id_card"],
        },
      },
    });

    await supabaseAdmin
      .from("bookings")
      .update({ stripe_verification_session_id: session.id })
      .eq("id", booking.id);

    return { url: session.url!, sessionId: session.id };
  });

export const finalizeBookingIfVerified = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ bookingId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("id,user_id,status,stripe_verification_session_id,storeganise_user_id")
      .eq("id", data.bookingId)
      .single();
    if (error || !booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Forbidden");
    if (!booking.stripe_verification_session_id) {
      return { status: booking.status as string };
    }

    const stripe = getStripe();
    const session = await stripe.identity.verificationSessions.retrieve(
      booking.stripe_verification_session_id,
    );

    if (session.status !== "verified") {
      return {
        status: session.status,
        lastError: session.last_error
          ? { code: session.last_error.code, reason: session.last_error.reason }
          : null,
      };
    }

    // Push the verified Stripe session id to Storeganise so its move-in job
    // can progress past `await_verifyIdentity`. Best-effort — failures here
    // shouldn't block the confirmation email.
    if (booking.storeganise_user_id) {
      const res = await setStoreganiseUserIdentitySession(
        booking.storeganise_user_id,
        booking.stripe_verification_session_id,
      );
      if (!res.ok) {
        console.error("Storeganise identity_session update failed:", res.error);
      }
    }

    const { data: existingSend } = await supabaseAdmin
      .from("email_send_log")
      .select("id")
      .eq("template_name", "booking-confirmation")
      .filter("metadata->>idempotency_key", "eq", `booking-confirm-${booking.id}`)
      .in("status", ["pending", "sent"])
      .limit(1)
      .maybeSingle();

    if (!existingSend) {
      const result = await sendBookingConfirmationEmail(booking.id);
      if (!result.ok) {
        console.error("Booking confirmation email failed:", result.error);
      }
    }
    return { status: "active" as const };
  });
