import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, KeyRound, Users, ShieldCheck, Zap, Share2 } from "lucide-react";

export const Route = createFileRoute("/smart-entry")({
  head: () => ({
    meta: [
      { title: "Smart Entry — Your phone is the key | Big Top Self Storage" },
      {
        name: "description",
        content:
          "Big Top's smart-entry app opens the gate, shutter, floor and your unit door with a single tap. No padlocks, no keys, no fobs.",
      },
      { property: "og:title", content: "Smart Entry at Big Top Self Storage" },
      { property: "og:url", content: "https://bigtop.lovable.app/smart-entry" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/smart-entry" }],
  }),
  component: SmartEntryPage,
});

function SmartEntryPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="pointer-events-none absolute -top-32 right-0 h-[400px] w-[400px] rounded-full bg-accent/30 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Smart entry</span>
            <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
              Your phone is the only key you need.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-primary-foreground/85">
              The Big Top app opens the front gate, the shutter, the floor access and your unit door. One tap
              each. No padlocks to lose, no codes to forget, no fobs to misplace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/get-a-quote">
                  Get a quote <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link to="/how-self-storage-works">How it works</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xs rotate-3 rounded-[40px] border-[10px] border-black/40 bg-black p-2 shadow-2xl">
            <div className="rounded-[28px] bg-gradient-to-br from-primary-glow to-accent/80 p-6 text-white">
              <div className="text-xs uppercase tracking-widest opacity-80">Big Top</div>
              <div className="mt-2 font-display text-xl font-bold">Unit 42 · Floor 1</div>
              <div className="mt-6 space-y-2.5">
                {["Front gate", "Shutter", "Floor access", "Unit door"].map((door) => (
                  <div key={door} className="flex items-center justify-between rounded-2xl bg-white/15 px-4 py-3 backdrop-blur-sm">
                    <span className="text-sm font-semibold">{door}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary">
                      <Zap className="h-4 w-4" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feat icon={<Smartphone className="h-5 w-5" />} title="One tap at every door">
            From the moment you arrive on site to opening your unit, every access point is a single tap away.
          </Feat>
          <Feat icon={<KeyRound className="h-5 w-5" />} title="No padlock to lose">
            No hardware to buy, no spare to misplace, no cut keys floating around in drawers.
          </Feat>
          <Feat icon={<Share2 className="h-5 w-5" />} title="Share access instantly">
            Need your partner or a removal company to pop in? Share access from your phone in seconds — and
            revoke it the same way.
          </Feat>
          <Feat icon={<ShieldCheck className="h-5 w-5" />} title="Audit trail">
            Every entry is logged. You can see exactly when your unit was last opened.
          </Feat>
          <Feat icon={<Users className="h-5 w-5" />} title="Multi-user friendly">
            Add household members or trusted helpers with their own access — no shared codes.
          </Feat>
          <Feat icon={<Zap className="h-5 w-5" />} title="Works offline-ish">
            Bluetooth-backed unlock means a flaky signal in the corridor won't stop you getting in.
          </Feat>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Feat({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
