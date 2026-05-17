import { sendTransactionalEmailServer } from "@/lib/email/send.server";

export interface ErrorAlertPayload {
  source: string;
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  extra?: unknown;
}

/**
 * Fire-and-forget error alert email. De-duplicates the same error within a
 * 10-minute window via idempotency key so a flapping bug doesn't spam the inbox.
 */
export function sendErrorAlertServer(payload: ErrorAlertPayload): Promise<void> {
  const stackHead = (payload.stack ?? "").split("\n").slice(0, 3).join("|");
  const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
  const idempotencyKey = `err:${payload.source}:${payload.message.slice(0, 120)}:${stackHead}:${bucket}`;

  const templateData = {
    source: payload.source,
    message: payload.message,
    stack: payload.stack,
    url: payload.url,
    userAgent: payload.userAgent,
    userId: payload.userId,
    occurredAt: new Date().toISOString(),
    extra: payload.extra
      ? typeof payload.extra === "string"
        ? payload.extra
        : (() => {
            try {
              return JSON.stringify(payload.extra, null, 2);
            } catch {
              return String(payload.extra);
            }
          })()
      : undefined,
  };

  return sendTransactionalEmailServer({
    templateName: "error-alert",
    idempotencyKey,
    templateData,
  })
    .then(() => undefined)
    .catch((err) => {
      console.error("[error-alert] failed to enqueue", err);
    });
}
