import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Stepper } from "@/components/booking/Stepper";
import { Button } from "@/components/ui/button";
import { formatGBPRound } from "@/lib/format";
import { startMolliePayment } from "@/lib/mollie.functions";

export const Route = createFileRoute("/_authenticated/book/payment")({
  head: () => ({ meta: [{ title: "Payment — Big Top Self Storage" }] }),
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setBookingId(sessionStorage.getItem("pending_booking_id"));
  }, []);

  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id,total_pence,move_in_date,unit:units(name,size_sqft),tier:protect_tiers(label,monthly_fee_pence)"
        )
        .eq("id", bookingId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const startPayment = useServerFn(startMolliePayment);

  const handleContinue = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    try {
      const { checkoutUrl } = await startPayment({
        data: { bookingId },
      });
      window.location.href = checkoutUrl;
    } catch (e) {
      setSubmitting(false);
      toast.error(e instanceof Error ? e.message : "Could not start payment");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Stepper current="payment" />

      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Step 3 of 4
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Add a payment method
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pay just <strong>£1</strong> for your first month of storage, plus your BIGProtect cover.
            We'll set up your monthly mandate at the same time so billing carries on automatically.
          </p>

          {booking && (
            <div className="mt-6 rounded-xl bg-secondary p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium">{(booking as any).unit?.size_sqft} sq ft</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Move-in</span>
                <span className="font-medium">{(booking as any).move_in_date}</span>
              </div>
              <div className="mt-3 space-y-1 border-t pt-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Unit (first month)</span>
                  <span className="font-medium">£1.00</span>
                </div>
                {(booking as any).tier?.monthly_fee_pence > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      BIGProtect ({(booking as any).tier.label})
                    </span>
                    <span className="font-medium">
                      +{formatGBPRound((booking as any).tier.monthly_fee_pence)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between border-t pt-3">
                <span className="font-medium">Pay today</span>
                <span className="font-display text-2xl font-extrabold">
                  {formatGBPRound((booking as any).total_pence)}
                </span>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Standard monthly billing begins from month two onwards.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl border-2 border-dashed border-border p-6 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Secure checkout by Mollie</p>
            <p className="mt-1 text-xs text-muted-foreground">
              You'll be redirected to Mollie to choose iDEAL, card, Apple Pay or another
              method. We'll set up your monthly mandate at the same time.
            </p>
          </div>

          <Button
            onClick={handleContinue}
            size="lg"
            className="mt-6 w-full"
            disabled={submitting || !bookingId}
          >
            <Lock className="mr-2 h-4 w-4" />
            {submitting ? "Redirecting…" : "Continue to secure payment"}
          </Button>
        </div>
      </div>
    </div>
  );
}
