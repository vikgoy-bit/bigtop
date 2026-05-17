import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequestUrl, getRequestHeader } from "@tanstack/react-start/server";

import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { renderErrorPage } from "./lib/error-page";
import { sendErrorAlertServer } from "./lib/error-alert.server";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    try {
      const url = getRequestUrl()?.toString();
      const ua = getRequestHeader("user-agent") ?? undefined;
      const err = error as any;
      void sendErrorAlertServer({
        source: "server:request",
        message: err?.message ? String(err.message) : String(error),
        stack: err?.stack ? String(err.stack) : undefined,
        url,
        userAgent: ua,
      });
    } catch (alertErr) {
      console.error("[error-alert] middleware send failed", alertErr);
    }
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));

