import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Sofa, Package, Snowflake, CalendarClock, ShieldCheck } from "lucide-react";
import { getStoreganiseUnits, type StoreganiseUnit } from "@/lib/storeganise.functions";

const unitsQueryOptions = queryOptions({
  queryKey: ["storeganise-units"],
  queryFn: () => getStoreganiseUnits(),
});

export const Route = createFileRoute("/personal-storage")({
  head: () => ({
    meta: [
      { title: "Personal storage in Basildon — Big Top Self Storage" },
      { name: "description", content: "Personal self storage for moving home, decluttering, or storing seasonal kit. Units from 25 to 300 sq ft with smart-entry access." },
      { property: "og:title", content: "Personal storage in Basildon" },
      { property: "og:description", content: "Flexible personal self storage in Basildon. Smart-entry access, no padlocks, no fuss." },
      { property: "og:url", content: "https://bigtop.lovable.app/personal-storage" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/personal-storage" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(unitsQueryOptions),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-muted-foreground">Couldn't load live prices: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
  component: PersonalStoragePage,
});

const USES = [
  { icon: Home, title: "Moving home", body: "Bridge the gap between completion dates without cramming the new place." },
  { icon: Sofa, title: "Decluttering", body: "Park the spare sofa, kids' toys, or hobby kit somewhere safe — and reclaim a room." },
  { icon: Snowflake, title: "Seasonal kit", body: "Bikes, ski gear, Christmas decorations and garden furniture, out of sight until you need them." },
  { icon: Package, title: "Renovations", body: "Protect your stuff from dust and decorators while the builders are in." },
];

const SIZE_TARGETS: Array<{ sqft: number; desc: string }> = [
  { sqft: 25, desc: "Cupboard-sized. Boxes, suitcases, a few bits of small furniture." },
  { sqft: 50, desc: "A small bedroom's worth — sofa, bed, boxes, household clutter." },
  { sqft: 100, desc: "A one-bed flat. Beds, sofas, table, white goods and boxes." },
  { sqft: 150, desc: "A two-bed home. Most of the furniture from a small family house." },
  { sqft: 300, desc: "A four-bed home or large project store. Plenty of room to walk in." },
];

function pickClosest(units: StoreganiseUnit[], target: number): StoreganiseUnit | null {
  if (!units.length) return null;
  return units.reduce((best, u) =>
    Math.abs(u.size_sqft - target) < Math.abs(best.size_sqft - target) ? u : best
  );
}

function formatFromPrice(pence: number): string {
  const pounds = pence / 100;
  return `£${Number.isInteger(pounds) ? pounds : pounds.toFixed(2)}`;
}

function PersonalStoragePage() {
  const { data } = useSuspenseQuery(unitsQueryOptions);
  const units = data.units;
  const sizes = SIZE_TARGETS.map((t) => {
    const unit = pickClosest(units, t.sqft);
    return {
      size: `${t.sqft} sq ft`,
      desc: t.desc,
      from: unit && unit.monthly_price_pence > 0 ? formatFromPrice(unit.monthly_price_pence) : null,
    };
  });
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Personal storage</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Room to breathe, when life gets in the way.</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Moving, decluttering, renovating or just out of space at home? Big Top has clean, dry, alarmed units in
            Basildon — and you let yourself in with your phone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/get-a-quote">Get a quote <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10">
              <Link to="/how-self-storage-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">What people use us for</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {USES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Pick a size that fits</h2>
          <p className="mt-2 text-muted-foreground">Prices from, per month. Bigger units available upon request.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sizes.map((s) => (
              <div key={s.size} className="rounded-2xl border bg-card p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl font-bold">{s.size}</h3>
                  {s.from && <span className="text-sm font-semibold text-accent">from {s.from}</span>}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/get-a-quote">Check live prices <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Why Big Top</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Perk icon={<ShieldCheck className="h-5 w-5" />} title="Secure as standard" body="24/7 CCTV, motion alarms and smart-entry on every door — no padlocks to worry about." />
          <Perk icon={<CalendarClock className="h-5 w-5" />} title="Flexible terms" body="Stay a month or stay a year. No long contracts, no exit fees." />
          <Perk icon={<Home className="h-5 w-5" />} title="Built for Basildon" body="Local team, local site, easy parking right outside your unit." />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Perk({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</div>
      <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
