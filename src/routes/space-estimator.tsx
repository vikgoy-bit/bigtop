import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const canonical = "https://bigtop.lovable.app/space-estimator";

// Approximate cubic-feet contributions per item (industry standard estimates)
const ITEMS = [
  { key: "smallBoxes", label: "Small boxes", cuft: 1.5 },
  { key: "mediumBoxes", label: "Medium boxes", cuft: 3 },
  { key: "largeBoxes", label: "Large boxes", cuft: 4.5 },
  { key: "suitcases", label: "Suitcases", cuft: 6 },
  { key: "bicycles", label: "Bicycles", cuft: 12 },
  { key: "chairs", label: "Chairs / armchairs", cuft: 15 },
  { key: "smallSofa", label: "2-seater sofa", cuft: 35 },
  { key: "largeSofa", label: "3-seater sofa", cuft: 55 },
  { key: "diningTable", label: "Dining table", cuft: 30 },
  { key: "wardrobe", label: "Wardrobe", cuft: 70 },
  { key: "chestOfDrawers", label: "Chest of drawers", cuft: 25 },
  { key: "singleBed", label: "Single bed", cuft: 40 },
  { key: "doubleBed", label: "Double bed", cuft: 60 },
  { key: "fridge", label: "Fridge / freezer", cuft: 30 },
  { key: "washingMachine", label: "Washing machine", cuft: 15 },
  { key: "tv", label: "TV", cuft: 8 },
  { key: "desk", label: "Desk", cuft: 20 },
  { key: "filingCabinet", label: "Filing cabinet", cuft: 15 },
] as const;

// Unit catalogue — sqft, recommended cuft capacity (assume ~8ft ceiling, 80% pack efficiency)
const UNITS = [
  { size: "15 sq ft", sqft: 15, cuft: 96, blurb: "A small cupboard — a few boxes and small items." },
  { size: "25 sq ft", sqft: 25, cuft: 160, blurb: "Around 25 medium boxes or contents of a small room." },
  { size: "35 sq ft", sqft: 35, cuft: 224, blurb: "Studio flat contents or a small office archive." },
  { size: "50 sq ft", sqft: 50, cuft: 320, blurb: "Contents of a 1-bedroom flat." },
  { size: "75 sq ft", sqft: 75, cuft: 480, blurb: "Contents of a small 2-bedroom flat." },
  { size: "100 sq ft", sqft: 100, cuft: 640, blurb: "Contents of a 2–3 bedroom house." },
  { size: "150 sq ft", sqft: 150, cuft: 960, blurb: "Contents of a 3–4 bedroom house." },
  { size: "200 sq ft", sqft: 200, cuft: 1280, blurb: "Contents of a large 4–5 bedroom house." },
];

export const Route = createFileRoute("/space-estimator")({
  head: () => ({
    meta: [
      { title: "Space Estimator — Big Top Self Storage" },
      {
        name: "description",
        content:
          "Not sure what size storage unit you need? Use our space estimator to find the right unit in seconds.",
      },
      { property: "og:title", content: "Space Estimator — Big Top Self Storage" },
      {
        property: "og:description",
        content: "Find the right storage unit size in seconds with our free interactive estimator.",
      },
      { property: "og:url", content: canonical },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }),
  component: SpaceEstimatorPage,
});

function SpaceEstimatorPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  const totalCuft = useMemo(
    () => ITEMS.reduce((sum, i) => sum + (counts[i.key] || 0) * i.cuft, 0),
    [counts],
  );

  const recommended = useMemo(
    () => UNITS.find((u) => u.cuft >= totalCuft) || UNITS[UNITS.length - 1],
    [totalCuft],
  );

  const set = (key: string, value: number) =>
    setCounts((c) => ({ ...c, [key]: Math.max(0, value) }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Free tool
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-5xl">
            Space estimator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Tell us roughly what you're storing and we'll suggest the smallest unit that'll fit.
            Not sure? Round up — our team is happy to swap your unit if you need more (or less)
            space.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Inputs */}
          <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-xl font-bold">What are you storing?</h2>
            <div className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {ITEMS.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3">
                  <Label htmlFor={item.key} className="flex-1 text-sm font-medium">
                    {item.label}
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => set(item.key, (counts[item.key] || 0) - 1)}
                      aria-label={`Remove one ${item.label}`}
                    >
                      −
                    </Button>
                    <Input
                      id={item.key}
                      type="number"
                      min={0}
                      value={counts[item.key] || 0}
                      onChange={(e) => set(item.key, parseInt(e.target.value) || 0)}
                      className="h-8 w-14 text-center"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => set(item.key, (counts[item.key] || 0) + 1)}
                      aria-label={`Add one ${item.label}`}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalCuft > 0 && (
              <button
                type="button"
                onClick={() => setCounts({})}
                className="mt-6 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
              >
                Reset
              </button>
            )}
          </section>

          {/* Recommendation */}
          <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border bg-primary p-6 text-primary-foreground shadow-lg sm:p-8">
            <div className="text-xs font-bold uppercase tracking-widest text-primary-foreground/70">
              Recommended unit
            </div>
            <div className="mt-3 font-display text-4xl font-extrabold">
              {totalCuft === 0 ? "—" : recommended.size}
            </div>
            <p className="mt-3 text-sm text-primary-foreground/80">
              {totalCuft === 0
                ? "Add a few items to see a recommendation."
                : recommended.blurb}
            </p>

            <dl className="mt-6 space-y-2 border-t border-white/15 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-primary-foreground/70">Estimated volume</dt>
                <dd className="font-semibold">{Math.round(totalCuft)} cu ft</dd>
              </div>
              {totalCuft > 0 && (
                <div className="flex justify-between">
                  <dt className="text-primary-foreground/70">Approx. floor area</dt>
                  <dd className="font-semibold">{recommended.sqft} sq ft</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-col gap-2">
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link to="/get-a-quote">Get a quote</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              >
                <Link to="/storage-size">View all unit sizes</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-primary-foreground/60">
              Estimate only. Unsure? Call us on{" "}
              <a href="tel:01268230230" className="underline">
                01268 230 230
              </a>{" "}
              and we'll talk it through.
            </p>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
