import { createServerFn } from "@tanstack/react-start";
import { getRequestHost, getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  createCustomer,
  createFirstPayment,
  penceToDecimalString,
} from "./mollie.server";

function getOrigin(): string {
  // Prefer explicit public base URL when set (useful for local dev with a tunnel)
  const explicit = process.env.PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const host = getRequestHost();
  // Mollie cannot reach localhost — fall back to the stable preview URL
  if (host.includes("localhost") || host.startsWith("127.")) {
    return "https://project--8238eee0-8806-4c3f-87d4-28569a4c2d00-dev.lovable.app";
  }
  const proto = getRequestHeader("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export const startMolliePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ bookingId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    // Load booking (RLS-scoped to the user)
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id,user_id,total_pence,move_in_date,mollie_customer_id,unit_id",
      )
      .eq("id", data.bookingId)
      .single();
    if (error || !booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Not your booking");
    if (!booking.total_pence || booking.total_pence <= 0)
      throw new Error("Booking total is zero");

    // Ensure Mollie customer exists
    let customerId = booking.mollie_customer_id as string | null;
    if (!customerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      const email =
        (claims.email as string | undefined) ||
        (claims["email" as keyof typeof claims] as string | undefined) ||
        "";
      const customer = await createCustomer({
        email,
        name: profile?.full_name || undefined,
        metadata: { user_id: userId },
      });
      customerId = customer.id;
      await supabaseAdmin
        .from("bookings")
        .update({ mollie_customer_id: customerId })
        .eq("id", booking.id);
    }

    const origin = getOrigin();
    const payment = await createFirstPayment({
      customerId,
      amountValue: penceToDecimalString(booking.total_pence),
      currency: "GBP",
      description: `Big Top Storage — booking ${booking.id.slice(0, 8)}`,
      redirectUrl: `${origin}/book/payment-return?booking=${booking.id}`,
      webhookUrl: `${origin}/api/public/mollie-webhook`,
      metadata: { booking_id: booking.id, user_id: userId },
    });

    await supabaseAdmin
      .from("bookings")
      .update({
        mollie_payment_id: payment.id,
        mollie_status: payment.status,
      })
      .eq("id", booking.id);

    const checkoutUrl = payment._links?.checkout?.href;
    if (!checkoutUrl) throw new Error("Mollie did not return a checkout URL");
    return { checkoutUrl, paymentId: payment.id };
  });

export const checkMolliePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ bookingId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id,user_id,status,mollie_status,mollie_payment_id")
      .eq("id", data.bookingId)
      .single();
    if (error || !booking) throw new Error("Booking not found");
    if (booking.user_id !== userId) throw new Error("Not your booking");
    return {
      status: booking.status,
      mollieStatus: booking.mollie_status,
      paymentId: booking.mollie_payment_id,
    };
  });
