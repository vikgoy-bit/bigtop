import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  getStoreganiseOrder,
  uploadSignedContractToStoreganise,
} from "./storeganise.server";
import {
  renderAgreementHtml,
  renderAgreementText,
  type AgreementTokens,
} from "./agreement-template";

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

/**
 * Storeganise allocates a specific unit to the order some time after creation
 * (often immediately, sometimes on move-in). Re-fetch the order and merge any
 * assigned unit details into the booking snapshot so the contract shows the
 * real unit number/type instead of "to be assigned".
 */
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
        "id,storeganise_order_id,signed_at,signer_name,signed_contract_path,unit_snapshot,move_in_date,total_pence",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");

    const baseSnapshot = booking.unit_snapshot as UnitSnapshot | null;
    const refreshedSnapshot = await refreshUnitSnapshot(
      booking.storeganise_order_id,
      baseSnapshot,
    );

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
      booking,
      agreement: {
        html: renderAgreementHtml(tokens),
        text: null as string | null,
        url: null as string | null,
      },
      error: null as string | null,
    };
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
        fullName: z.string().trim().min(2).max(120),
        agreed: z.literal(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id,user_id,storeganise_order_id,signed_at,unit_snapshot,move_in_date,total_pence",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");
    if (booking.signed_at) {
      return { ok: true, alreadySigned: true };
    }

    const signedAt = new Date();

    const tokens = await buildAgreementTokens({
      supabase: supabaseAdmin,
      userId,
      email: (claims.email as string | undefined) ?? "",
      unitSnapshot: booking.unit_snapshot as UnitSnapshot | null,
      moveInDate: booking.move_in_date,
      monthlyPence:
        (booking.unit_snapshot as UnitSnapshot | null)?.monthly_price_pence ??
        null,
      signedAt,
    });

    // Use the typed-name on the agreement so the document records what the
    // signer actually entered, not whatever was on the profile.
    const { firstName, lastName } = splitName(data.fullName);
    tokens.user.firstName = firstName;
    tokens.user.lastName = lastName;

    const agreementText = renderAgreementText(tokens);

    const ip =
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      getRequestHeader("x-real-ip") ||
      "unknown";

    const pdfBytes = await buildSignedPdf({
      agreementText,
      signerName: data.fullName,
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

    const { error: updErr } = await supabase
      .from("bookings")
      .update({
        signed_at: signedAt.toISOString(),
        signer_name: data.fullName,
        signed_contract_path: objectPath,
      })
      .eq("id", booking.id);
    if (updErr) throw new Error(updErr.message);

    return {
      ok: true,
      alreadySigned: false,
      storeganiseUpload: sgUpload,
    };
  });
