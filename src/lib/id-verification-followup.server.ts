import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendBookingConfirmationEmail } from "./booking-confirmation.server";
import { sendTransactionalEmailServer } from "./email/send.server";
import { setStoreganiseUserIdentitySession } from "./storeganise.server";

type FailureInfo = {
  status: string;
  code?: string | null;
  reason?: string | null;
};

/**
 * Stripe ID verification has failed (requires_input / canceled) OR succeeded.
 * Either way we want to push the booking through:
 *   1. Send the Stripe verification session id to Storeganise so its
 *      `await_verifyIdentity` step is satisfied and the move-in is not
 *      delayed.
 *   2. Fire the customer's booking confirmation email.
 *   3. If the verification *failed*, also send an admin alert to
 *      hi@bigtopselfstorage.com so the team can follow up manually.
 *
 * Idempotent — safe to call repeatedly from the webhook, the success
 * page, and the retry-verification cron.
 */
export async function completeBookingDespiteIdResult(args: {
  bookingId: string;
  stripeSessionId: string;
  failure?: FailureInfo | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { bookingId, stripeSessionId, failure } = args;

  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,user_id,storeganise_user_id,storeganise_order_id,unit_snapshot,move_in_date",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!booking) return { ok: false, error: "Booking not found" };

  // 1. Push session id to Storeganise (best-effort).
  if (booking.storeganise_user_id) {
    const sgRes = await setStoreganiseUserIdentitySession(
      booking.storeganise_user_id,
      stripeSessionId,
    );
    if (!sgRes.ok) {
      console.error(
        "Storeganise identity_session update failed:",
        sgRes.error,
      );
    }
  }

  // 2. Customer booking confirmation (idempotent).
  const confirm = await sendBookingConfirmationEmail(bookingId);
  if (!confirm.ok) {
    console.error("Booking confirmation email failed:", confirm.error);
  }

  // 3. Admin alert when ID check failed.
  if (failure && failure.status !== "verified") {
    try {
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(
        booking.user_id,
      );
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name,phone,address_line_1,address_line_2,city,postcode")
        .eq("id", booking.user_id)
        .maybeSingle();

      const snapshot = booking.unit_snapshot as
        | { name?: string; title?: string }
        | null;

      await sendTransactionalEmailServer({
        templateName: "id-verification-failed",
        recipientEmail: "hi@bigtopselfstorage.com",
        idempotencyKey: `id-failed-${booking.id}`,
        templateData: {
          customerName: profile?.full_name ?? userRes?.user?.email ?? "",
          customerEmail: userRes?.user?.email ?? "",
          customerPhone: profile?.phone ?? "",
          bookingId: booking.id,
          bookingRef: booking.id.slice(0, 8).toUpperCase(),
          unitName: snapshot?.name ?? snapshot?.title ?? "",
          moveInDate: booking.move_in_date ?? "",
          stripeSessionId,
          stripeStatus: failure.status,
          failureCode: failure.code ?? "",
          failureReason: failure.reason ?? "",
        },
      });
    } catch (e) {
      console.error("ID-failed admin email failed:", e);
    }
  }

  return { ok: true };
}
