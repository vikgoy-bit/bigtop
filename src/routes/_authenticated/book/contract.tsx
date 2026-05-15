import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileSignature, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Stepper } from "@/components/booking/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getContractForBooking, signContract } from "@/lib/contract.functions";

export const Route = createFileRoute("/_authenticated/book/contract")({
  head: () => ({
    meta: [{ title: "Sign your storage agreement — Big Top Self Storage" }],
  }),
  component: ContractPage,
});

function ContractPage() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setBookingId(sessionStorage.getItem("pending_booking_id"));
  }, []);

  const fetchContract = useServerFn(getContractForBooking);
  const signFn = useServerFn(signContract);

  const contractQ = useQuery({
    queryKey: ["contract", bookingId],
    queryFn: () => fetchContract({ data: { bookingId: bookingId! } }),
    enabled: !!bookingId,
  });

  const signMut = useMutation({
    mutationFn: () =>
      signFn({
        data: { bookingId: bookingId!, agreed: true },
      }),
    onSuccess: (res) => {
      if (res.storeganiseUpload && !res.storeganiseUpload.uploaded) {
        // Non-fatal: the PDF is in our bucket, Storeganise upload will be retried.
        console.warn("Storeganise upload failed:", res.storeganiseUpload.error);
      }
      toast.success("Agreement signed");
      navigate({ to: "/book/verify" });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : "Failed to sign");
    },
  });

  const alreadySigned = !!contractQ.data?.booking?.signed_at;
  const agreement = contractQ.data?.agreement;

  const agreementBody = useMemo(() => {
    if (!agreement) return null;
    if (agreement.html) {
      return (
        <div
          className="agreement-doc"
          dangerouslySetInnerHTML={{ __html: agreement.html }}
        />
      );
    }
    if (agreement.text) {
      return (
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {agreement.text}
        </pre>
      );
    }
    if (agreement.url) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Read the full storage terms and conditions below, or{" "}
            <a
              href={agreement.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline underline-offset-2"
            >
              open in a new tab
            </a>
            .
          </p>
          <iframe
            src={agreement.url}
            title="Storage agreement"
            className="h-[480px] w-full rounded-lg border bg-background"
          />
        </div>
      );
    }
    return null;
  }, [agreement]);

  const canSign =
    !!bookingId &&
    agreed &&
    !signMut.isPending &&
    !alreadySigned;

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
            Read the agreement, tick the box to confirm, and tap sign. We'll
            store a signed copy and send it to our system automatically.
          </p>

          {!bookingId && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>No booking in progress. Please start your booking again.</p>
            </div>
          )}

          {contractQ.isLoading && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your agreement…
            </div>
          )}

          {contractQ.data?.error && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>{contractQ.data.error}</p>
            </div>
          )}

          {alreadySigned && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p>
                You've already signed this agreement
                {contractQ.data?.booking?.signer_name
                  ? ` as ${contractQ.data.booking.signer_name}`
                  : ""}
                .
              </p>
            </div>
          )}

          {agreementBody && (
            <div
              className={`mt-6 rounded-xl border bg-secondary/30 p-4 text-sm ${
                agreement?.url ? "" : "max-h-[420px] overflow-y-auto"
              }`}
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <FileSignature className="h-3.5 w-3.5" />
                Storage agreement
              </div>
              {agreementBody}
            </div>
          )}

          {!agreementBody && !contractQ.isLoading && !contractQ.data?.error && (
            <div className="mt-6 rounded-xl border bg-secondary/30 p-4 text-sm text-muted-foreground">
              The agreement isn't available to preview yet — but you can still
              sign below. We'll attach your signature to your unit order.
            </div>
          )}

          {!alreadySigned && (
            <div className="mt-6 space-y-4">
              <label className="flex items-start gap-3 rounded-xl border bg-secondary/30 p-4 text-sm">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                  className="mt-0.5"
                  required
                />
                <span>
                  I have read and agree to the Big Top Self Storage Agreement.
                </span>
              </label>
            </div>
          )}

          <Button
            onClick={() =>
              alreadySigned ? navigate({ to: "/book/verify" }) : signMut.mutate()
            }
            size="lg"
            className="mt-8 w-full"
            disabled={!alreadySigned && !canSign}
          >
            {signMut.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing…
              </>
            ) : alreadySigned ? (
              <>
                Continue to ID verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Sign and continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
