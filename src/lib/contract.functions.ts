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

type AgreementShape = {
  html: string | null;
  text: string | null;
  url: string | null;
};

/** Walk an order object looking for an agreement-like field. */
function extractAgreement(order: Record<string, unknown>): AgreementShape {
  const candidates: Array<[string, "html" | "text" | "url"]> = [
    ["agreementHtml", "html"],
    ["agreement_html", "html"],
    ["contractHtml", "html"],
    ["agreementText", "text"],
    ["agreement_text", "text"],
    ["contractText", "text"],
    ["terms", "text"],
    ["termsAndConditions", "text"],
    ["agreementUrl", "url"],
    ["agreement_url", "url"],
    ["contractUrl", "url"],
    ["agreementPdfUrl", "url"],
  ];
  const out: AgreementShape = { html: null, text: null, url: null };
  for (const [key, kind] of candidates) {
    const v = order[key];
    if (typeof v === "string" && v.length > 0) {
      if (out[kind] == null) out[kind] = v;
    }
  }
  // Nested 'agreement' object
  const nested = order.agreement;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (typeof n.html === "string" && !out.html) out.html = n.html;
    if (typeof n.text === "string" && !out.text) out.text = n.text;
    if (typeof n.url === "string" && !out.url) out.url = n.url;
  }
  return out;
}

export const getContractForBooking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ bookingId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        "id,storeganise_order_id,signed_at,signer_name,signed_contract_path,unit_snapshot,move_in_date,total_pence",
      )
      .eq("id", data.bookingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!booking) throw new Error("Booking not found");

    if (!booking.storeganise_order_id) {
      return {
        booking,
        agreement: null,
        error:
          "No Storeganise order is linked to this booking yet. Complete payment first.",
      };
    }

    try {
      const order = await getStoreganiseOrder(booking.storeganise_order_id);
      const agreement = extractAgreement(order);
      return { booking, agreement, error: null as string | null };
    } catch (e) {
      return {
        booking,
        agreement: null,
        error: e instanceof Error ? e.message : "Failed to load agreement",
      };
    }
  });

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|h[1-6]|li|tr|br)>/gi, "\n")
    .replace(/<br\s*\/?>(?!$)/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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
    ["Storeganise order", params.orderId],
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
    const { supabase, userId } = context;

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
    if (!booking.storeganise_order_id) {
      throw new Error("Booking has no Storeganise order yet.");
    }

    // Fetch agreement text from Storeganise
    const order = await getStoreganiseOrder(booking.storeganise_order_id);
    const agreement = extractAgreement(order);
    let agreementText = agreement.text;
    if (!agreementText && agreement.html) {
      agreementText = htmlToPlainText(agreement.html);
    }
    if (!agreementText) {
      // Fall back to a minimal record so signing isn't blocked if Storeganise
      // doesn't expose text — still produces a PDF with signer + booking ref.
      agreementText =
        "Agreement text was not available from Storeganise at the time of signing. " +
        "The signer accepted the storage terms presented to them on the booking flow.";
    }

    const signedAt = new Date();
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
      orderId: booking.storeganise_order_id,
    });

    const fileName = `agreement-${booking.id}.pdf`;
    const objectPath = `${userId}/${fileName}`;

    // Upload to our bucket via admin client (RLS-safe path: user-scoped folder).
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

    // Best-effort upload back to Storeganise.
    const sgUpload = await uploadSignedContractToStoreganise({
      orderId: booking.storeganise_order_id,
      fileName,
      pdf: pdfBytes,
    });

    // Mark booking signed
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
