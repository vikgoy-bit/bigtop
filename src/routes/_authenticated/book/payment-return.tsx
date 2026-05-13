import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Stepper } from "@/components/booking/Stepper";
import { Button } from "@/components/ui/button";
import { checkMolliePayment } from "@/lib/mollie.functions";

export const Route = createFileRoute("/_authenticated/book/payment-return")({
  head: () => ({ meta: [{ title: "Confirming payment — Big Top Self Storage" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    booking: typeof s.booking === "string" ? s.booking : "",
  }),
  component: PaymentReturnPage,
});

function PaymentReturnPage() {
  const { booking: bookingId } = useSearch({ from: Route.id });
  const navigate = useNavigate();
  const check = useServerFn(checkMolliePayment);
  const [state, setState] = useState<"checking" | "paid" | "pending" | "failed">(
    "checking",
  );
  const tries = useRef(0);

  useEffect(() => {
    if (!bookingId) {
      setState("failed");
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await check({ data: { bookingId } });
        if (cancelled) return;
        if (res.status === "pending_verification" || res.mollieStatus === "paid") {
          setState("paid");
          setTimeout(() => navigate({ to: "/book/contract" }), 800);
          return;
        }
        if (
          res.mollieStatus === "failed" ||
          res.mollieStatus === "canceled" ||
          res.mollieStatus === "expired"
        ) {
          setState("failed");
          return;
        }
        tries.current += 1;
        if (tries.current > 20) {
          setState("pending");
          return;
        }
        setTimeout(poll, 1500);
      } catch {
        if (!cancelled) setState("failed");
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [bookingId, check, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Stepper current="payment" />
      <div className="mx-auto max-w-xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border bg-card p-8 text-center">
          {state === "checking" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
              <h1 className="mt-4 font-display text-2xl font-bold">
                Confirming your payment…
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Mollie is letting us know the result. This usually takes a few seconds.
              </p>
            </>
          )}
          {state === "paid" && (
            <>
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <h1 className="mt-4 font-display text-2xl font-bold">Payment received</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Taking you to your contract…
              </p>
            </>
          )}
          {state === "pending" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <h1 className="mt-4 font-display text-2xl font-bold">
                Still processing
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Some payment methods can take a little longer to confirm. We'll email you
                as soon as it clears — you can safely close this page.
              </p>
              <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
                Back to home
              </Button>
            </>
          )}
          {state === "failed" && (
            <>
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <h1 className="mt-4 font-display text-2xl font-bold">Payment failed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The payment was not completed. You can try again — your booking is held.
              </p>
              <Button
                className="mt-6"
                onClick={() => navigate({ to: "/book/payment" as any })}
              >
                Try again
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
