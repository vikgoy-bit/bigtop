import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripe } from "./stripe.server";
import { getRequestHost } from "@tanstack/react-start/server";

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
          require_matching_selfie: false,
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
