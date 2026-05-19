import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// TEMP: test-only 100% off promo. Remove before going live.
const PROMO_CODES: Record<string, number> = {
  VIKAS: 100,
};

export const applyPromoCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        bookingId: z.string().uuid(),
        code: z.string().min(1).max(32),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const normalized = data.code.trim().toUpperCase();
    const percentOff = PROMO_CODES[normalized];
    if (!percentOff) {
      return { ok: false as const, error: "Invalid promo code" };
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id,user_id,total_pence,status")
      .eq("id", data.bookingId)
      .single();
    if (error || !booking) return { ok: false as const, error: "Booking not found" };
    if (booking.user_id !== userId) return { ok: false as const, error: "Not your booking" };

    if (percentOff >= 100) {
      // Skip payment provider entirely — mark booking as paid.
      const { error: updErr } = await supabaseAdmin
        .from("bookings")
        .update({
          total_pence: 0,
          mollie_status: "paid",
          status: "pending_verification",
        })
        .eq("id", booking.id);
      if (updErr) return { ok: false as const, error: updErr.message };
      return { ok: true as const, fullyDiscounted: true };
    }

    const newTotal = Math.max(
      0,
      Math.round((booking.total_pence ?? 0) * (1 - percentOff / 100)),
    );
    const { error: updErr } = await supabaseAdmin
      .from("bookings")
      .update({ total_pence: newTotal })
      .eq("id", booking.id);
    if (updErr) return { ok: false as const, error: updErr.message };
    return { ok: true as const, fullyDiscounted: false, newTotalPence: newTotal };
  });
