import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  KeyRound,
  Camera,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  PoundSterling,
  Smartphone,
  Headphones,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Big Top Self Storage — Modern self storage in Basildon" },
      {
        name: "description",
        content:
          "Book a self storage unit in Basildon in minutes. Smart-entry access, 24/7 CCTV, open 7 days a week. £1 for your first 6 weeks.",
      },
      { property: "og:title", content: "Big Top Self Storage — Modern self storage in Basildon" },
      { property: "og:description", content: "Smart-entry self storage in Basildon. £1 for 6 weeks opening offer." },
      { property: "og:url", content: "https://bigtop.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SelfStorage",
          name: "Big Top Self Storage",
          url: "https://www.bigtopselfstorage.com",
          telephone: "+441268230230",
          email: "hi@bigtopselfstorage.com",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Harvey Road",
            addressLocality: "Basildon",
            postalCode: "SS13 1ET",
            addressCountry: "GB",
          },
          openingHours: "Mo-Su 08:00-20:00",
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-glow text-primary-foreground">
        <div className="pointer-events-none absolute -top-32 right-0 h-[480px] w-[480px] rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[420px] w-[420px] rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest ring-1 ring-white/20">
              <Sparkles className="h-3 w-3 text-accent" /> The greatest space on earth
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Self storage in Basildon, <span className="text-accent">made easy</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
              Book your unit online in minutes, then walk in with your smartphone — no keys, no padlocks, no fuss.
              Open 8am–8pm every day, with 24/7 CCTV monitoring.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Book your unit in under 3 minutes",
                "Smart-entry access — your phone is the key",
                "24/7 CCTV, modern interiors, all-weather indoor loading",
                "£1 for your first 6 weeks of rental",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/get-a-quote">
                  Get a quote <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link to="/how-self-storage-works">How it works</Link>
              </Button>
            </div>
          </div>

          {/* Stat card */}
          <div className="relative">
            <div className="rounded-3xl bg-white/10 p-6 ring-1 ring-white/15 backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-4">
                <Stat value="25–300" unit="sq ft" label="Unit sizes" note="*Bigger sizes upon request" />
                <Stat value="8–8" unit="every day" label="Opening hours" />
                <Stat value="24/7" unit="" label="CCTV monitoring" />
                <Stat value="£1" unit="" label="First 6 weeks" />
              </div>
              <div className="mt-5 rounded-2xl bg-accent/95 p-5 text-accent-foreground">
                <div className="text-xs font-bold uppercase tracking-widest opacity-80">Opening offer</div>
                <div className="mt-1 font-display text-2xl font-extrabold">£1 for the first 6 weeks</div>
                <p className="mt-1 text-sm opacity-90">No deposit, cancel anytime with one month's notice.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Why Big Top</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Storage built for how you actually live</h2>
          <p className="mt-3 text-muted-foreground">
            No padlocks to lose, no awkward opening hours, no surprise fees. Just a clean unit and a phone in your pocket.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon={<Smartphone className="h-5 w-5" />} title="Smart entry">
            Open the gate, shutter, floor and your unit door with one tap. Share access with family in seconds.
          </Feature>
          <Feature icon={<Camera className="h-5 w-5" />} title="24/7 CCTV">
            Continuous monitoring of every corridor, every entry point. Your stuff stays your stuff.
          </Feature>
          <Feature icon={<KeyRound className="h-5 w-5" />} title="No padlock needed">
            Your phone is the only key. Lost padlock keys are someone else's problem.
          </Feature>
          <Feature icon={<Clock className="h-5 w-5" />} title="Open 8am – 8pm">
            The longest opening hours in the area, every single day of the year.
          </Feature>
          <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Protect your goods">
            Add Big Protect cover at checkout — no faff, no separate paperwork.
          </Feature>
          <Feature icon={<Headphones className="h-5 w-5" />} title="Real humans">
            Local team on the phone whenever you need a hand picking a size.
          </Feature>
        </div>
      </section>

      {/* How it works strip */}
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">How it works</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">From browser to unit in three steps</h2>
            <ol className="mt-8 space-y-6">
              <Step n={1} title="Pick the right size online">
                Browse units from 25 to 300 sq ft. Not sure? Our team will size you up over the phone in 2 minutes.
              </Step>
              <Step n={2} title="Book in minutes, pay by Direct Debit">
                Fill out your details, ID-verify, sign the agreement and pay. The whole thing takes about 3 minutes.
              </Step>
              <Step n={3} title="Walk in with your phone">
                You'll get an invitation to the app the same day. Tap to open every door from the gate to your unit.
              </Step>
            </ol>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link to="/get-a-quote">
                  Find my unit <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <PriceTile sqft="25" use="Boxes, suitcases, a few bits of furniture" />
            <PriceTile sqft="50" use="Contents of a one-bed flat" highlighted />
            <PriceTile sqft="100" use="Three-bed house, garage clear-out" />
            <PriceTile sqft="150" use="Family home in transit, business stock" />
          </div>
        </div>
      </section>

      {/* Offers strip */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-accent to-accent/80 p-8 text-accent-foreground sm:p-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                <PoundSterling className="h-3 w-3" /> Opening offer
              </span>
              <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
                £1 for your first 6 weeks of storage
              </h2>
              <p className="mt-2 text-sm text-white/90">
                Plus 10% off for Blue Light card holders and students. Refer a friend and we'll knock 50% off your next bill.
              </p>
            </div>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/offers">See all offers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Find us</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Harvey Road, Basildon</h2>
          <p className="mt-3 text-muted-foreground">
            Easy in and out from the A127 and A13. Free customer parking right outside, with sheltered indoor loading.
          </p>
          <dl className="mt-6 grid gap-3 text-sm">
            <Row label="Address">Harvey Road, Basildon, Essex, SS13 1ET</Row>
            <Row label="Open">Every day · 08:00 – 20:00</Row>
            <Row label="Call">01268 230 230</Row>
            <Row label="Email">hi@bigtopselfstorage.com</Row>
          </dl>
        </div>
        <div className="overflow-hidden rounded-3xl border bg-muted">
          <iframe
            title="Big Top Self Storage location"
            src="https://www.google.com/maps?q=Harvey+Road,+Basildon,+SS13+1ET&output=embed"
            loading="lazy"
            className="aspect-[4/3] w-full"
          />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ value, unit, label, note }: { value: string; unit: string; label: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
      <div className="font-display text-3xl font-extrabold">
        {value}
        {unit && <span className="ml-1 text-sm font-semibold text-primary-foreground/70">{unit}</span>}
      </div>
      <div className="mt-1 text-xs text-primary-foreground/70">{label}</div>
      {note && <div className="mt-0.5 text-[10px] text-primary-foreground/50">{note}</div>}
    </div>
  );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-base font-bold text-primary-foreground">
        {n}
      </div>
      <div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}

function PriceTile({ sqft, use, highlighted }: { sqft: string; use: string; highlighted?: boolean }) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        highlighted ? "border-accent bg-accent/5 ring-1 ring-accent/30" : "bg-card hover:shadow-sm"
      }`}
    >
      <div className="font-display text-3xl font-extrabold">
        {sqft}
        <span className="ml-1 text-sm font-semibold text-muted-foreground">sq ft</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{use}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="w-20 shrink-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
