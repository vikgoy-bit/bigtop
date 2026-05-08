import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { Stepper } from "@/components/booking/Stepper";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/book/verify")({
  head: () => ({ meta: [{ title: "Verify your ID — Big Top Self Storage" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setBookingId(sessionStorage.getItem("pending_booking_id"));
  }, []);

  const handleVerify = async () => {
    if (!bookingId) return;
    setSubmitting(true);
    // TODO: Stripe Identity verification session. For now, mark as active and continue.
    const { error } = await supabase
      .from("bookings")
      .update({ status: "active" })
      .eq("id", bookingId);
    setSubmitting(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/book/success" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Stepper current="verify" />

      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Step 4 of 4
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Verify your identity
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A quick photo ID check keeps our facility safe for everyone. It usually takes
            under 60 seconds.
          </p>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <ShieldCheck className="h-8 w-8" />
            <h2 className="mt-3 font-display text-xl font-bold">Powered by Stripe Identity</h2>
            <p className="mt-1 text-sm text-primary-foreground/80">
              You'll snap a photo of your ID and a quick selfie. Your details are never
              stored on our servers.
            </p>
          </div>

          <ul className="mt-6 space-y-3 text-sm">
            <Bullet>Have your driving licence or passport ready</Bullet>
            <Bullet>Use a phone or webcam in good lighting</Bullet>
            <Bullet>You'll be back here once Stripe confirms verification</Bullet>
          </ul>

          <Button onClick={handleVerify} size="lg" className="mt-8 w-full" disabled={submitting || !bookingId}>
            {submitting ? "Starting…" : "Start ID verification"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
      <span>{children}</span>
    </li>
  );
}
