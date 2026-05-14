import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, MapPin, Calendar as CalendarIcon, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { formatGBPRound } from "@/lib/format";
import { finalizeBookingIfVerified } from "@/lib/stripe.functions";

export const Route = createFileRoute("/_authenticated/book/success")({
  head: () => ({ meta: [{ title: "Booking confirmed — Big Top Self Storage" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const finalize = useServerFn(finalizeBookingIfVerified);

  useEffect(() => {
    const id = sessionStorage.getItem("pending_booking_id");
    setBookingId(id);
    if (id) {
      // Best-effort fallback in case the Stripe webhook is delayed.
      // Poll a few times since identity verification can take a moment.
      let cancelled = false;
      (async () => {
        for (let i = 0; i < 6 && !cancelled; i++) {
          try {
            const res = await finalize({ data: { bookingId: id } });
            if (res.status === "active") return;
          } catch (e) {
            console.warn("finalize attempt failed", e);
          }
          await new Promise((r) => setTimeout(r, 2500));
        }
      })();
      return () => {
        cancelled = true;
      };
    }
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="bg-gradient-to-br from-accent to-accent/70 p-8 text-accent-foreground">
            <CheckCircle2 className="h-12 w-12" />
            <h1 className="mt-4 font-display text-3xl font-extrabold">You're all set!</h1>
            <p className="mt-2 text-accent-foreground/90">
              Your unit is reserved. We've sent a confirmation to your email.
            </p>
          </div>

          {booking && (
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
