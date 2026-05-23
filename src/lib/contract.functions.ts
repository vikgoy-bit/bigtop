import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getStoreganiseOrder,
  submitStoreganiseUnitOrder,
  uploadSignedContractToStoreganise,
  ensureStoreganiseOrderForBooking,
} from "./storeganise.server";

import {
  renderAgreementHtml,
  renderAgreementText,
  type AgreementTokens,
} from "./agreement-template";
import { sendTransactionalEmailServer } from "./email/send.server";
import { formatUKDateTimeWithZone } from "./format";

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

function splitName(full: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const t = (full ?? "").trim();
  if (!t) return { firstName: "", lastName: "" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

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

function formatAddress(p: {
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
}): string {
  return [p.address_line1, p.address_line2, p.city, p.postcode]
    .map((x) => (x ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

function buildSignatureDataUrl(name: string, signedAt: Date): string {
  const safeName = name
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="200" viewBox="0 0 560 200"><rect width="560" height="200" fill="white"/><text x="36" y="108" font-family="Georgia, 'Times New Roman', serif" font-size="42" fill="#111827">${safeName}</text><line x1="32" y1="142" x2="528" y2="142" stroke="#111827" stroke-width="2"/><text x="36" y="168" font-family="Arial, sans-serif" font-size="14" fill="#4b5563">Signed electronically ${signedAt.toISOString()}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Storeganise allocates a specific unit after the deferred order is submitted.
 * Re-fetch the order and merge any assigned unit details into the booking
 * snapshot so downstream views can show the real unit number/type.
 */
async function refreshUnitSnapshot(
  orderId: string | null | undefined,
  current: UnitSnapshot | null,
): Promise<UnitSnapshot | null> {
  if (!orderId) return current;
  try {
    let order = (await getStoreganiseOrder(orderId)) as Record<string, any>;
    let unit =
      (order.unit as Record<string, any> | undefined) ??
      (order.result?.unit as Record<string, any> | undefined) ??
      undefined;
    let unitType =
      (order.unitType as Record<string, any> | undefined) ??
      (order.result?.unitType as Record<string, any> | undefined) ??
      undefined;
    const unitId =
      unit?.id ??
      (typeof order.result?.unitId === "string" ? order.result.unitId : undefined);
    if (!unit && unitId) {
      unit = await fetchStoreganiseUnit(unitId).catch(() => undefined);
    }

    if (!unit && !unitType) return current;
    return {
      ...(current ?? {}),
      id: unit?.id ?? unitId ?? current?.id,
      name: normalizeUnitName(unit?.name ?? unit?.code ?? current?.name),
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

function normalizeUnitName(name: string | undefined): string | undefined {
  return name ? name.toUpperCase() : undefined;
}

async function fetchStoreganiseUnit(unitId: string): Promise<Record<string, any>> {
  const key = process.env.STOREGANISE_API_KEY;
  if (!key) throw new Error("STOREGANISE_API_KEY is not set");
  const res = await fetch(
    `https://bigtopselfstorage.storeganise.com/api/v1/admin/units/${unitId}`,
    { headers: { Authorization: `ApiKey ${key}`, Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`Storeganise unit lookup failed: ${res.status}`);
  return res.json() as Promise<Record<string, any>>;
}

async function buildAgreementTokens(args: {
  supabase: ReturnType<typeof supabaseAdmin.from> extends never
    ? never
    : typeof supabaseAdmin;
  userId: string;
  email: string;
  unitSnapshot: UnitSnapshot | null;
  moveInDate: string;
  monthlyPence: number | null;
  signedAt?: Date;
}): Promise<AgreementTokens> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name,phone,address_line1,address_line2,city,postcode")
    .eq("id", args.userId)
    .maybeSingle();

  const { firstName, lastName } = splitName(profile?.full_name ?? null);
  const startDate = formatDate(new Date(`${args.moveInDate}T00:00:00`));
  const monthly =
    args.monthlyPence ?? args.unitSnapshot?.monthly_price_pence ?? 0;

  return {
    user: {
      firstName,
      lastName,
      email: args.email,
      address: profile
        ? formatAddress({
            address_line1: profile.address_line1,
            address_line2: profile.address_line2,
            city: profile.city,
            postcode: profile.postcode,
          })
        : "",
      phone: profile?.phone ?? "",
    },
    unit: {
      name: args.unitSnapshot?.name ?? "To be assigned at move-in",
      type:
        args.unitSnapshot?.title ||
        [args.unitSnapshot?.groupTitle, args.unitSnapshot?.size_group]
          .filter(Boolean)
          .join(" ") ||
        "",
    },
    startDate,
    rental: {
      price: `${formatGBP(monthly)} per month`,
    },
    signatureDate: formatDate(args.signedAt ?? new Date()),
  };
}

export const getContractForBooking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ bookingId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id,user_id,unit_id,total_pence,protect_tier_id,storeganise_user_id,storeganise_order_id,signed_at,signer_name,signed_contract_path,unit_snapshot,move_in_date,cover_document_path",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");

    // Make sure a Storeganise order exists before showing the contract so the
    // platform can allocate a unit number. This is idempotent.
    let storeganiseOrderId = booking.storeganise_order_id;
    if (!storeganiseOrderId) {
      try {
        const sgUpdates = await ensureStoreganiseOrderForBooking({
          supabaseAdmin,
          booking: {
            id: booking.id,
            user_id: booking.user_id,
            unit_id: booking.unit_id,
            total_pence: booking.total_pence,
            move_in_date: booking.move_in_date,
            protect_tier_id: booking.protect_tier_id ?? null,
            storeganise_user_id: booking.storeganise_user_id ?? null,
            storeganise_order_id: null,
            unit_snapshot: booking.unit_snapshot as UnitSnapshot | null,
          },
        });
        if (sgUpdates.storeganise_order_id || sgUpdates.storeganise_user_id) {
          await supabaseAdmin
            .from("bookings")
            .update(sgUpdates)
            .eq("id", booking.id);
          storeganiseOrderId = sgUpdates.storeganise_order_id ?? storeganiseOrderId;
        }
      } catch (e) {
        console.error("Storeganise pre-contract ensure failed:", e instanceof Error ? e.message : e);
      }
    }

    const baseSnapshot = booking.unit_snapshot as UnitSnapshot | null;
    let refreshedSnapshot = await refreshUnitSnapshot(
      storeganiseOrderId,
      baseSnapshot,
    );

    // Don't block the response polling here — the client polls this server
    // function on a short interval until `unitAllocated` flips true. Keeping
    // this handler fast means the customer sees the contract almost
    // instantly, and the unit number appears as soon as Storeganise assigns
    // it (usually within 1-2 seconds).

    // Persist the enriched snapshot so the signed PDF and downstream views all
    // see the assigned unit without another round-trip.
    if (refreshedSnapshot && refreshedSnapshot !== baseSnapshot) {
      await supabaseAdmin
        .from("bookings")
        .update({ unit_snapshot: refreshedSnapshot })
        .eq("id", booking.id);
    }

    const tokens = await buildAgreementTokens({
      supabase: supabaseAdmin,
      userId,
      email: (claims.email as string | undefined) ?? "",
      unitSnapshot: refreshedSnapshot,
      moveInDate: booking.move_in_date,
      monthlyPence:
        refreshedSnapshot?.monthly_price_pence ?? null,
    });

    return {
      booking: { ...booking, storeganise_order_id: storeganiseOrderId },
      agreement: {
        html: renderAgreementHtml(tokens),
        text: null as string | null,
        url: null as string | null,
      },
      unitAllocated: !!refreshedSnapshot?.name,
      error: refreshedSnapshot?.name
        ? null
        : ("Allocating your unit number…" as string | null),
    };
  });

/**
 * Fire-and-forget warm-up: creates the Storeganise order for a booking so
 * the unit number is allocated by the time the customer reaches the
 * contract page. Idempotent — safe to call multiple times.
 */
export const prepareStoreganiseOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ bookingId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id,user_id,unit_id,total_pence,protect_tier_id,storeganise_user_id,storeganise_order_id,unit_snapshot,move_in_date",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error || !booking) return { ok: false as const };
    if (booking.storeganise_order_id) return { ok: true as const, alreadyExists: true };

    try {
      const sgUpdates = await ensureStoreganiseOrderForBooking({
        supabaseAdmin,
        booking: {
          id: booking.id,
          user_id: booking.user_id,
          unit_id: booking.unit_id,
          total_pence: booking.total_pence,
          move_in_date: booking.move_in_date,
          protect_tier_id: booking.protect_tier_id ?? null,
          storeganise_user_id: booking.storeganise_user_id ?? null,
          storeganise_order_id: null,
          unit_snapshot: booking.unit_snapshot as UnitSnapshot | null,
        },
      });
      if (sgUpdates.storeganise_order_id || sgUpdates.storeganise_user_id) {
        await supabaseAdmin
          .from("bookings")
          .update(sgUpdates)
          .eq("id", booking.id);
      }
      return { ok: true as const };
    } catch (e) {
      console.error("prepareStoreganiseOrder failed:", e instanceof Error ? e.message : e);
      return { ok: false as const };
    }
  });


async function buildSignedPdf(params: {
  agreementText: string;
  signerName: string;
  signedAt: Date;
  ip: string;
  bookingId: string;
  orderId: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 13;
  const fontSize = 10;
  const maxWidth = pageWidth - margin * 2;

  function wrap(text: string, f: typeof font, size: number): string[] {
    const out: string[] = [];
    for (const para of text.split("\n")) {
      if (para.length === 0) {
        out.push("");
        continue;
      }
      const words = para.split(/\s+/);
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (f.widthOfTextAtSize(test, size) > maxWidth) {
          if (line) out.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) out.push(line);
    }
    return out;
  }

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  page.drawText("Storage Agreement", { x: margin, y, size: 16, font: bold });
  y -= 24;

  const lines = wrap(params.agreementText, font, fontSize);
  for (const line of lines) {
    if (y < margin + 80) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    page.drawText(line, { x: margin, y, size: fontSize, font });
    y -= lineHeight;
  }

  // Signature block
  if (y < margin + 120) {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }
  y -= 20;
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });
  y -= 20;
  page.drawText("Signed electronically", { x: margin, y, size: 11, font: bold });
  y -= 18;
  const meta = [
    ["Signer", params.signerName],
    ["Signed at", params.signedAt.toISOString()],
    ["IP address", params.ip],
    ["Booking ref", params.bookingId],
    ["Storeganise order", params.orderId || "(pending)"],
  ];
  for (const [k, v] of meta) {
    page.drawText(`${k}: `, { x: margin, y, size: 10, font: bold });
    page.drawText(v, {
      x: margin + bold.widthOfTextAtSize(`${k}: `, 10),
      y,
      size: 10,
      font,
    });
    y -= 14;
  }

  return pdf.save();
}

export const signContract = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        bookingId: z.string().uuid(),
        fullName: z.string().trim().min(2).max(120).optional(),
        agreed: z.literal(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id,user_id,unit_id,total_pence,protect_tier_id,storeganise_user_id,storeganise_order_id,signed_at,unit_snapshot,move_in_date,cover_document_path",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");
    if (booking.signed_at) {
      return { ok: true, alreadySigned: true };
    }

    // Fallback: if the Mollie webhook didn't (or hasn't) created the
    // Storeganise order yet, create it now so we can submit + attach the
    // signed contract. Idempotent — no-op when the order already exists.
    let storeganiseOrderId = booking.storeganise_order_id;
    let sgFallbackError: string | null = null;
    if (!storeganiseOrderId) {
      try {
        const sgUpdates = await ensureStoreganiseOrderForBooking({
          supabaseAdmin,
          booking: {
            id: booking.id,
            user_id: booking.user_id,
            unit_id: booking.unit_id,
            total_pence: booking.total_pence,
            move_in_date: booking.move_in_date,
            protect_tier_id: booking.protect_tier_id ?? null,
            storeganise_user_id: booking.storeganise_user_id ?? null,
            storeganise_order_id: null,
            unit_snapshot: booking.unit_snapshot as UnitSnapshot | null,
          },
        });
        if (sgUpdates.storeganise_order_id || sgUpdates.storeganise_user_id) {
          await supabaseAdmin
            .from("bookings")
            .update(sgUpdates)
            .eq("id", booking.id);
        }
        storeganiseOrderId = sgUpdates.storeganise_order_id ?? null;
      } catch (e) {
        sgFallbackError = e instanceof Error ? e.message : String(e);
        console.error("Storeganise fallback create failed:", sgFallbackError);
      }
    }
    booking.storeganise_order_id = storeganiseOrderId;

    const signedAt = new Date();

    const baseSnapshot = booking.unit_snapshot as UnitSnapshot | null;
    let refreshedSnapshot = await refreshUnitSnapshot(
      booking.storeganise_order_id,
      baseSnapshot,
    );

    // Build tokens early so we can derive the signer's name from the profile
    // (the contract page no longer asks for it).
    const tokens = await buildAgreementTokens({
      supabase: supabaseAdmin,
      userId,
      email: (claims.email as string | undefined) ?? "",
      unitSnapshot: refreshedSnapshot,
      moveInDate: booking.move_in_date,
      monthlyPence: refreshedSnapshot?.monthly_price_pence ?? null,
      signedAt,
    });

    const profileFullName = `${tokens.user.firstName ?? ""} ${tokens.user.lastName ?? ""}`.trim();
    const signerName = (data.fullName?.trim() || profileFullName || (claims.email as string | undefined) || "Signed electronically").trim();
    const { firstName, lastName } = splitName(signerName);
    tokens.user.firstName = firstName;
    tokens.user.lastName = lastName;

    const signatureUrl = buildSignatureDataUrl(signerName, signedAt);

    let sgSubmit: Awaited<ReturnType<typeof submitStoreganiseUnitOrder>> = {
      submitted: false,
      via: null,
      error: "Skipped: no Storeganise order linked",
    };
    if (booking.storeganise_order_id) {
      sgSubmit = await submitStoreganiseUnitOrder(booking.storeganise_order_id, {
        signatureUrl,
      });
      if (sgSubmit.submitted) {
        // Allocate the exact Storeganise unit before rendering the signed PDF.
        for (let attempt = 0; attempt < 8; attempt++) {
          refreshedSnapshot = await refreshUnitSnapshot(
            booking.storeganise_order_id,
            refreshedSnapshot,
          );
          if (refreshedSnapshot?.name) break;
          await new Promise((r) => setTimeout(r, 750));
        }
      }
    }

    const agreementText = renderAgreementText(tokens);

    const ip =
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      getRequestHeader("x-real-ip") ||
      "unknown";

    const pdfBytes = await buildSignedPdf({
      agreementText,
      signerName,
      signedAt,
      ip,
      bookingId: booking.id,
      orderId: booking.storeganise_order_id ?? "",
    });

    const fileName = `agreement-${booking.id}.pdf`;
    const objectPath = `${userId}/${fileName}`;

    const buf = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength,
    ) as ArrayBuffer;
    const { error: upErr } = await supabaseAdmin.storage
      .from("signed-contracts")
      .upload(objectPath, new Blob([buf], { type: "application/pdf" }), {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`);

    let sgUpload: Awaited<ReturnType<typeof uploadSignedContractToStoreganise>> = {
      uploaded: false,
      via: null,
      error: "Skipped: no Storeganise order linked",
    };
    if (booking.storeganise_order_id) {
      sgUpload = await uploadSignedContractToStoreganise({
        orderId: booking.storeganise_order_id,
        fileName,
        pdf: pdfBytes,
      });
    }

    if (booking.storeganise_order_id && !sgSubmit.submitted) {
      sgSubmit = await submitStoreganiseUnitOrder(booking.storeganise_order_id, {
        signatureUrl,
      });
      if (sgSubmit.submitted) {
        for (let attempt = 0; attempt < 8; attempt++) {
          refreshedSnapshot = await refreshUnitSnapshot(
            booking.storeganise_order_id,
            refreshedSnapshot,
          );
          if (refreshedSnapshot?.name) break;
          await new Promise((r) => setTimeout(r, 750));
        }
      }
    }

    const { error: updErr } = await supabase
      .from("bookings")
      .update({
        signed_at: signedAt.toISOString(),
        signer_name: signerName,
        signed_contract_path: objectPath,
        ...(refreshedSnapshot && refreshedSnapshot !== baseSnapshot
          ? { unit_snapshot: refreshedSnapshot }
          : {}),
      })
      .eq("id", booking.id);
    if (updErr) throw new Error(updErr.message);

    // NOTE: booking confirmation email is intentionally NOT sent here.
    // It is sent from the Stripe webhook once identity verification succeeds,
    // so customers don't get a confirmation before their ID check is complete.

    // Internal copy of the signed contract — emailed to ops so a record exists
    // outside the app/storage. Best-effort: failures here do NOT block signing.
    try {
      const { data: signedLink } = await supabaseAdmin.storage
        .from("signed-contracts")
        .createSignedUrl(objectPath, 60 * 60 * 24 * 30);
      const customerName =
        `${tokens.user.firstName ?? ""} ${tokens.user.lastName ?? ""}`.trim() ||
        signerName;
      const internalRes = await sendTransactionalEmailServer({
        templateName: "internal-contract-copy",
        idempotencyKey: `internal-contract-${booking.id}`,
        templateData: {
          customerName,
          customerEmail: (claims.email as string | undefined) ?? "",
          unitName: refreshedSnapshot?.name,
          unitTitle:
            refreshedSnapshot?.title ||
            [refreshedSnapshot?.groupTitle, refreshedSnapshot?.size_group]
              .filter(Boolean)
              .join(" "),
          moveInDate: tokens.startDate,
          signedAt: formatUKDateTimeWithZone(signedAt),
          bookingRef: booking.id.slice(0, 8),
          contractUrl: signedLink?.signedUrl,
        },
      });
      if (!internalRes.ok) {
        console.error("Internal contract copy email failed:", internalRes.error);
      }
    } catch (e) {
      console.error("Internal contract copy email threw:", e);
    }

    return {
      ok: true,
      alreadySigned: false,
      storeganiseSubmit: sgSubmit,
      storeganiseUpload: sgUpload,
    };
  });
