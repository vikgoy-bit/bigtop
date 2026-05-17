import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { reportClientError } from "@/lib/error-alert.functions";
import { supabase } from "@/integrations/supabase/client";

function extractMessageStack(reason: unknown): { message: string; stack?: string } {
  if (reason instanceof Error) {
    return { message: reason.message || reason.name, stack: reason.stack };
  }
  if (typeof reason === "string") return { message: reason };
  try {
    return { message: JSON.stringify(reason).slice(0, 1000) };
  } catch {
    return { message: String(reason) };
  }
}

/**
 * Reports uncaught browser errors to the server, which emails an alert.
 * Throttled in-memory to one report per (message+source) per 10 minutes
 * to avoid flooding when the same error fires repeatedly.
 */
export function ClientErrorReporter() {
  const send = useServerFn(reportClientError);
  const recent = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const report = async (source: string, reason: unknown, filename?: string) => {
      const { message, stack } = extractMessageStack(reason);
      if (!message) return;
      const key = `${source}:${message}`;
      const now = Date.now();
      const last = recent.current.get(key);
      if (last && now - last < 10 * 60 * 1000) return;
      recent.current.set(key, now);

      let userId: string | undefined;
      try {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id;
      } catch {
        /* ignore */
      }

      try {
        await send({
          data: {
            source,
            message: message.slice(0, 2000),
            stack: stack?.slice(0, 8000),
            url: window.location.href,
            userAgent: navigator.userAgent,
            userId,
            extra: filename,
          },
        });
      } catch {
        /* swallow — we don't want the reporter itself to throw */
      }
    };

    const onError = (event: ErrorEvent) => {
      void report("window.error", event.error ?? event.message, event.filename);
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      void report("unhandledrejection", event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [send]);

  return null;
}
