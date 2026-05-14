import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, MapPin, Calendar as CalendarIcon, Mail, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { formatGBPRound } from "@/lib/format";
import { finalizeBookingIfVerified, startIdentityVerification } from "@/lib/stripe.functions";

export const Route = createFileRoute("/_authenticated/book/success")({
  head: () => ({ meta: [{ title: "Booking confirmed — Big Top Self Storage" }] }),
  component: SuccessPage,
});

type VerifyState =
  | { kind: "pending" }
  | { kind: "active" }
  | { kind: "needs_retry"; reason: string | null }
  | { kind: "processing" };

function SuccessPage() {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>({ kind: "pending" });
  const [retrying, setRetrying] = useState(false);
  const finalize = useServerFn(finalizeBookingIfVerified);
  const startVerification = useServerFn(startIdentityVerification);

  useEffect(() => {
    const id = sessionStorage.getItem("pending_booking_id");
    setBookingId(id);
    if (!id) return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < 6 && !cancelled; i++) {
        try {
          const res: any = await finalize({ data: { bookingId: id } });
          if (cancelled) return;
          if (res.status === "active" || res.status === "verified") {
            setVerifyState({ kind: "active" });
            return;
          }
          if (res.status === "requires_input" || res.status === "canceled") {
            setVerifyState({
              kind: "needs_retry",
              reason: res.lastError?.reason ?? null,
            });
            return;
          }
          if (res.status === "processing") {
            setVerifyState({ kind: "processing" });
          }
        } catch (e) {
          console.warn("finalize attempt failed", e);
        }
        await new Promise((r) => setTimeout(r, 2500));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [finalize]);

  const { data: booking } = useQuery({
    queryKey: ["booking-success", bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("id,total_pence,move_in_date,unit:units(size_sqft)")
        .eq("id", bookingId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleRetry = async () => {
    if (!bookingId) return;
    setRetrying(true);
    try {
      const res = await startVerification({ data: { bookingId } });
      window.location.href = res.url;
    } catch (e) {
      console.error("retry verification failed", e);
      setRetrying(false);
    }
  };

  const isActive = verifyState.kind === "active";
  const needsRetry = verifyState.kind === "needs_retry";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {needsRetry ? (
            <div className="bg-gradient-to-br from-destructive to-destructive/80 p-8 text-destructive-foreground">
              <AlertTriangle className="h-12 w-12" />
              <h1 className="mt-4 font-display text-3xl font-extrabold">ID verification needs another try</h1>
              <p className="mt-2 text-destructive-foreground/90">
                Stripe couldn't verify your document. Your unit is held — please retry to finish your booking.
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-accent to-accent/70 p-8 text-accent-foreground">
              <CheckCircle2 className="h-12 w-12" />
              <h1 className="mt-4 font-display text-3xl font-extrabold">
                {isActive ? "You're all set!" : "Almost there…"}
              </h1>
              <p className="mt-2 text-accent-foreground/90">
                {isActive
                  ? "Your unit is reserved. We've sent a confirmation to your email."
                  : "We're confirming your ID verification with Stripe. This usually takes a few seconds."}
              </p>
            </div>
          )}

          {needsRetry && (
            <div className="space-y-4 p-6 sm:p-8">
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <div className="font-medium text-destructive">Why it failed</div>
                <p className="mt-1 text-muted-foreground">
                  {(verifyState as any).reason ||
                    "Stripe rejected the document. Please try again with a clear, well-lit photo of a valid driver's license, passport, or ID card."}
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Use a valid driver's license, passport, or ID card</li>
                  <li>Both sides, fully visible — no cropping or glare</li>
                  <li>Make sure your selfie matches the document photo</li>
                </ul>
              </div>
              <Button onClick={handleRetry} disabled={retrying} className="w-full">
                {retrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Opening Stripe…
                  </>
                ) : (
                  "Retry ID verification"
                )}
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          )}

          {!needsRetry && booking && (
            <div className="space-y-4 p-6 sm:p-8">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Booking reference
              </div>
              <div className="font-display text-lg font-bold">
                #{(booking as any).id.slice(0, 8).toUpperCase()}
              </div>

              <dl className="mt-4 space-y-3 rounded-xl bg-secondary p-4 text-sm">
                <Row icon={<MapPin className="h-4 w-4" />} label="Location">
                  Big Top Self Storage Basildon
                </Row>
                <Row icon={<CalendarIcon className="h-4 w-4" />} label="Move-in date">
                  {(booking as any).move_in_date}
                </Row>
                <Row icon={<MapPin className="h-4 w-4" />} label="Unit">
                  {(booking as any).unit?.size_sqft} sq ft
                </Row>
                <div className="flex items-baseline justify-between border-t pt-3">
                  <span className="font-medium">Charged today</span>
                  <span className="font-display text-2xl font-extrabold">
                    {formatGBPRound((booking as any).total_pence)}
                  </span>
                </div>
              </dl>

              {!isActive && (
                <div className="flex items-center gap-2 rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  Waiting on Stripe to confirm your ID. You can leave this page — we'll email you as soon as it's done.
                </div>
              )}

              <div className="rounded-xl border bg-background p-4 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <Mail className="h-4 w-4 text-accent" /> What happens next?
                </div>
                <p className="mt-2 text-muted-foreground">
                  On your move-in date, head to <strong>Harvey Road, Basildon, SS13 1ET</strong>{" "}
                  between 08:00 and 20:00. Use the smart entry code we'll text you.
                </p>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}
