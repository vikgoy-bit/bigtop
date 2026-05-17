import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeader } from "@tanstack/react-start/server";
import { sendErrorAlertServer } from "./error-alert.server";

const schema = z.object({
  source: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  url: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
  userId: z.string().max(200).optional(),
  extra: z.string().max(4000).optional(),
});

/**
 * Public-ish endpoint for the browser to report uncaught errors.
 * No auth required (errors happen before/without sessions); idempotency
 * key + 10-minute bucket in the server helper prevents spam.
 */
export const reportClientError = createServerFn({ method: "POST" })
  .inputValidator((input) => schema.parse(input))
  .handler(async ({ data }) => {
    const ua = data.userAgent ?? getRequestHeader("user-agent") ?? undefined;
    await sendErrorAlertServer({
      source: `client:${data.source}`,
      message: data.message,
      stack: data.stack,
      url: data.url,
      userAgent: ua,
      userId: data.userId,
      extra: data.extra,
    });
    return { ok: true };
  });
