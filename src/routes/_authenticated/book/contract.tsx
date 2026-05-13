import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileSignature, ExternalLink, Mail, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Stepper } from "@/components/booking/Stepper";
import { Button } from "@/components/ui/button";

// Storeganise customer portal — where the e-sign agreement lives.
const STOREGANISE_PORTAL_URL = "https://bigtopselfstorage.storeganise.com/units";

export const Route = createFileRoute("/_authenticated/book/contract")({
  head: () => ({
    meta: [{ title: "Sign your storage agreement — Big Top Self Storage" }],
  }),
  component: ContractPage,
});

function ContractPage() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    setBookingId(sessionStorage.getItem("pending_booking_id"));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Stepper current="contract" />

      <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Step 4 of 5
          </span>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Sign your storage agreement
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your unit is reserved and payment is confirmed. The last bit before
            ID verification: e-sign your storage agreement.
          </p>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-primary to-primary-glow p-6 text-primary-foreground">
            <FileSignature className="h-8 w-8" />
            <h2 className="mt-3 font-display text-xl font-bold">
              Your contract is ready in the customer portal
            </h2>
            <p className="mt-1 text-sm text-primary-foreground/80">
              We've sent a copy to your email too. Sign in with the same email
              you used to book — your agreement will be waiting under{" "}
              <strong>My units</strong>.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <a
              href={STOREGANISE_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open the customer portal to sign
              </Button>
            </a>

            <div className="flex items-start gap-3 rounded-xl border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>
                Can't see the email? Check your spam folder, or contact us and
                we'll resend the agreement link.
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate({ to: "/book/verify" })}
            size="lg"
            className="mt-8 w-full"
            disabled={!bookingId}
          >
            I've signed — continue to ID verification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
