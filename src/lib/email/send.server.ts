import * as React from "react";
import { render } from "@react-email/components";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "bigtop";
const SENDER_DOMAIN = "notify.bigtopselfstorage.com";
const FROM_DOMAIN = "notify.bigtopselfstorage.com";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Server-only helper to enqueue a transactional email from inside a server
 * function (e.g. after signing a contract). Mirrors the logic of the
 * `/lovable/email/transactional/send` route but skips the user-JWT check
 * because the caller is already authenticated/trusted server code.
 */
export async function sendTransactionalEmailServer(params: {
  templateName: string;
  recipientEmail?: string;
  idempotencyKey?: string;
  templateData?: Record<string, any>;
}): Promise<{ ok: boolean; reason?: string; error?: string }> {
  const template = TEMPLATES[params.templateName];
  if (!template) {
    return { ok: false, error: `Template '${params.templateName}' not found` };
  }
  const recipient = template.to || params.recipientEmail;
  if (!recipient) {
    return { ok: false, error: "recipientEmail required" };
  }
  const messageId = crypto.randomUUID();
  const idempotencyKey = params.idempotencyKey ?? messageId;

  if (params.idempotencyKey) {
    const { data: existingSend } = await supabaseAdmin
      .from("email_send_log")
      .select("status")
      .eq("template_name", params.templateName)
      .filter("metadata->>idempotency_key", "eq", idempotencyKey)
      .in("status", ["pending", "sent"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existingSend) {
      return { ok: true, reason: `already_${existingSend.status}` };
    }
  }

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from("suppressed_emails")
    .select("id")
    .eq("email", recipient.toLowerCase())
    .maybeSingle();
  if (suppressed) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: params.templateName,
      recipient_email: recipient,
      status: "suppressed",
    });
    return { ok: false, reason: "suppressed" };
  }

  // Unsubscribe token (one per email)
  const normalized = recipient.toLowerCase();
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token,used_at")
    .eq("email", normalized)
    .maybeSingle();
  let unsubscribeToken: string;
  if (existing && !existing.used_at) {
    unsubscribeToken = existing.token;
  } else {
    unsubscribeToken = generateToken();
    await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: unsubscribeToken, email: normalized },
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: stored } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    if (stored?.token) unsubscribeToken = stored.token;
  }

  const data = params.templateData ?? {};
  const element = React.createElement(template.component, data);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(data)
      : template.subject;

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: params.templateName,
    recipient_email: recipient,
    status: "pending",
    metadata: { idempotency_key: idempotencyKey },
  });

  const { error: enqErr } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: recipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text: plainText,
      purpose: "transactional",
      label: params.templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });
  if (enqErr) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: params.templateName,
      recipient_email: recipient,
      status: "failed",
      error_message: enqErr.message,
      metadata: { idempotency_key: idempotencyKey },
    });
    return { ok: false, error: enqErr.message };
  }
  return { ok: true };
}
