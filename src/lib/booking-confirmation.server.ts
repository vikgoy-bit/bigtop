import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailServer } from "./email/send.server";
import { getStoreganiseOrder } from "./storeganise.server";

type UnitSnapshot = {
  id?: string;
  name?: string;
  title?: string;
  size_group?: string;
  groupTitle?: string;
  groupCode?: string;
  size_sqft?: number;
  monthly_price_pence?: number;
};

function formatGBP(pence: number | null | undefined): string {
  const n = typeof pence === "number" ? pence : 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n / 100);
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function refreshUnitSnapshot(
  orderId: string | null | undefined,
  current: UnitSnapshot | null,
): Promise<UnitSnapshot | null> {
  if (!orderId) return current;
  try {
    const order = (await getStoreganiseOrder(orderId)) as Record<string, any>;
    const unit =
      (order.unit as Record<string, any> | undefined) ??
      (order.result?.unit as Record<string, any> | undefined) ??
      undefined;
    const unitType =
      (order.unitType as Record<string, any> | undefined) ??
      (order.result?.unitType as Record<string, any> | undefined) ??
      undefined;
    if (!unit && !unitType) return current;
    return {
      ...(current ?? {}),
      id: unit?.id ?? current?.id,
      name: unit?.name ?? unit?.code ?? current?.name,
      title: unit?.title ?? unitType?.title ?? current?.title,
      groupTitle:
        unit?.groupTitle ?? unitType?.groupTitle ?? current?.groupTitle,
      groupCode: unit?.groupCode ?? unitType?.groupCode ?? current?.groupCode,
      size_group:
        unit?.sizeGroup ?? unitType?.sizeGroup ?? current?.size_group,
      size_sqft: unit?.sizeSqft ?? unitType?.sizeSqft ?? current?.size_sqft,
    };
  } catch {
    return current;
  }
}

/**
 * Send the booking confirmation email. Called only AFTER Stripe Identity
 * verification has succeeded so customers don't receive a confirmation
 * before their ID check is complete.
 *
 * Idempotent via the email send log idempotency key.
 */
export async function sendBookingConfirmationEmail(bookingId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { data: booking, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id,user_id,storeganise_order_id,unit_snapshot,move_in_date,signed_contract_path,cover_document_path,signer_name",
    )
    .eq("id", bookingId)
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  if (!booking) return { ok: false, error: "Booking not found" };

  // Resolve recipient email from auth.users
  const { data: userRes, error: userErr } =
    await supabaseAdmin.auth.admin.getUserById(booking.user_id);
  if (userErr || !userRes?.user?.email) {
    return { ok: false, error: userErr?.message ?? "No recipient email" };
  }
  const recipient = userRes.user.email;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", booking.user_id)
    .maybeSingle();
  const firstName =
    (booking.signer_name ?? profile?.full_name ?? "").trim().split(/\s+/)[0] ??
    "";

  // Make sure we've got the assigned unit number before sending.
  let snapshot = booking.unit_snapshot as UnitSnapshot | null;
  for (let attempt = 0; attempt < 4; attempt++) {
    snapshot = await refreshUnitSnapshot(
      booking.storeganise_order_id,
      snapshot,
    );
    if (snapshot?.name) break;
    await new Promise((r) => setTimeout(r, 750));
  }
  if (snapshot && snapshot !== (booking.unit_snapshot as UnitSnapshot | null)) {
    await supabaseAdmin
      .from("bookings")
      .update({ unit_snapshot: snapshot })
      .eq("id", booking.id);
  }

  let contractUrl: string | undefined;
  if (booking.signed_contract_path) {
    const { data: signed } = await supabaseAdmin.storage
      .from("signed-contracts")
      .createSignedUrl(booking.signed_contract_path, 60 * 60 * 24 * 30);
    contractUrl = signed?.signedUrl;
  }
  let coverDocumentUrl: string | undefined;
  if (booking.cover_document_path) {
    const { data: coverSigned } = await supabaseAdmin.storage
      .from("cover-documents")
      .createSignedUrl(booking.cover_document_path, 60 * 60 * 24 * 30);
    coverDocumentUrl = coverSigned?.signedUrl;
  }

  const monthly = snapshot?.monthly_price_pence ?? 0;

  try {
    return await sendTransactionalEmailServer({
      templateName: "booking-confirmation",
      recipientEmail: recipient,
      idempotencyKey: `booking-confirm-${booking.id}`,
      templateData: {
        customerName: firstName,
        unitName: snapshot?.name,
        unitTitle:
          snapshot?.title ||
          [snapshot?.groupTitle, snapshot?.size_group]
            .filter(Boolean)
            .join(" "),
        moveInDate: formatDate(new Date(`${booking.move_in_date}T00:00:00`)),
        monthlyPrice: `${formatGBP(monthly)} per month`,
        contractUrl,
        coverDocumentUrl,
        bookingRef: booking.id.slice(0, 8),
      },
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
