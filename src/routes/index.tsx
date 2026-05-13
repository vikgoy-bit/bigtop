import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Phone, Mail, MapPin, Clock, ShieldCheck, KeyRound, Camera } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getStoreganiseUnits, type StoreganiseUnit } from "@/lib/storeganise.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGBPRound } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Reserve a unit — Big Top Self Storage Basildon" },
      {
        name: "description",
        content:
          "Pick from 25–150 sq ft self storage units in Basildon. £1 for 6 weeks opening offer. 24/7 CCTV, smart entry, open 7 days a week.",
      },
    ],
  }),
  component: SelectUnitPage,
});

type Unit = StoreganiseUnit;

const FILTERS = [
  { key: "all", label: "All" },
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
] as const;

function SelectUnitPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [vatMode, setVatMode] = useState<"inc" | "ex">("inc");
  const { user } = useAuth();
  const navigate = useNavigate();
  const fetchUnits = useServerFn(getStoreganiseUnits);

  const { data, isLoading } = useQuery({
    queryKey: ["storeganise-units"],
    queryFn: () => fetchUnits(),
    staleTime: 60_000,
  });
  const units = data?.units;

  const filtered = useMemo(
    () =>
      (units ?? []).filter(
        (u) => (filter === "all" || u.groupCode === filter) && u.available > 0
      ),
    [units, filter]
  );

  const handleSelect = (unit: Unit) => {
    sessionStorage.setItem("pending_unit_id", unit.id);
    sessionStorage.setItem("pending_unit", JSON.stringify(unit));
    navigate({ to: "/book/details" });
  };

  return (
    <TooltipProvider delayDuration={100}>
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Site info strip */}
      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <InfoTile icon={<MapPin className="h-3.5 w-3.5" />} title="Address">
              Harvey Road, Basildon, Essex, SS13 1ET
            </InfoTile>
            <InfoTile icon={<Clock className="h-3.5 w-3.5" />} title="Opening hours">
              Mon–Sun · 08:00–20:00
            </InfoTile>
          </div>
        </div>
      </section>

      {/* Unit selection */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Step 1 of 5 · Choose your unit
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Select your <span className="text-accent">unit</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Every unit includes 24/7 CCTV, smart entry and modern interiors. Cancel anytime
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="cursor-help align-baseline text-accent underline decoration-dotted underline-offset-2"
                  aria-label="One month's notice required"
                >
                  *
                </button>
              </TooltipTrigger>
              <TooltipContent>One month's notice required.</TooltipContent>
            </Tooltip>
            .
          </p>
        </div>

        {/* Filter pills + VAT toggle */}
        <div className="sticky top-16 z-30 -mx-4 mt-6 border-b bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition",
                    filter === f.key
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="inline-flex shrink-0 rounded-full border bg-muted p-0.5 text-xs font-semibold">
              <button
                onClick={() => setVatMode("inc")}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  vatMode === "inc" ? "bg-background text-foreground shadow" : "text-muted-foreground"
                )}
              >
                Inc VAT
              </button>
              <button
                onClick={() => setVatMode("ex")}
                className={cn(
                  "rounded-full px-3 py-1 transition",
                  vatMode === "ex" ? "bg-background text-foreground shadow" : "text-muted-foreground"
                )}
              >
                Ex VAT
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          {filtered.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onSelect={() => handleSelect(unit)} vatMode={vatMode} />
          ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            No units in this size right now. Try another filter.
          </div>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Need help choosing?{" "}
          <a href="tel:01268230230" className="font-semibold text-foreground underline-offset-2 hover:underline">
            Call 01268 230 230
          </a>{" "}
          and we'll find the right size.
        </p>
      </section>
    </div>
    </TooltipProvider>
  );
}

function InfoTile({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/10 px-3 py-2 ring-1 ring-primary-foreground/15">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70">
        {icon}
        {title}
      </div>
      <div className="text-xs font-medium text-primary-foreground">{children}</div>
    </div>
  );
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "24/7 CCTV Monitoring": <Camera className="h-3.5 w-3.5" />,
  "Smart Entry": <KeyRound className="h-3.5 w-3.5" />,
  Modern: <ShieldCheck className="h-3.5 w-3.5" />,
  "Drive-up access": <ShieldCheck className="h-3.5 w-3.5" />,
};

function UnitCard({
  unit,
  onSelect,
  vatMode,
}: {
  unit: Unit;
  onSelect: () => void;
  vatMode: "inc" | "ex";
}) {
  const factor = vatMode === "inc" ? 1 : 0.8;
  const monthly = Math.round(unit.monthly_price_pence * factor);
  const weekly = Math.round(unit.weekly_price_pence * factor);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-border/50 transition hover:-translate-y-0.5 hover:shadow-lg">
      {unit.offer_label && (
        <div className="absolute right-3 top-3 z-10">
          <Badge className="bg-offer text-offer-foreground hover:bg-offer">{unit.offer_label}</Badge>
        </div>
      )}
      <div className="relative flex aspect-[16/10] items-end justify-start overflow-hidden bg-gradient-to-br from-primary/10 via-secondary to-accent/15 p-5">
        {unit.image && (
          <img
            src={unit.image}
            alt={`${unit.groupTitle || unit.groupCode} ${unit.size_sqft} sq ft storage unit`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {unit.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        )}
        <div className="relative z-[1]">
          <div className={`text-xs font-semibold uppercase tracking-wider ${unit.image ? "text-white/80" : "text-muted-foreground"}`}>
            {unit.groupTitle || unit.groupCode} unit
          </div>
          <div className={`mt-1 font-display text-4xl font-extrabold leading-none ${unit.image ? "text-white" : ""}`}>
            {unit.size_sqft}
            <span className={`ml-1 text-base font-bold ${unit.image ? "text-white/80" : "text-muted-foreground"}`}>sq ft</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <ul className="flex flex-wrap gap-1.5">
          {unit.features
            .filter((f) => f.toLowerCase() !== "modern")
            .map((f) => (
              <li
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
              >
                {FEATURE_ICONS[f]}
                {f}
              </li>
            ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <div className="font-display text-3xl font-extrabold leading-none">
              {formatGBPRound(monthly)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
            </div>
            <div className="mt-1 text-xs font-semibold text-accent">
              {formatGBPRound(weekly)}/week {vatMode === "inc" ? "inc" : "ex"} VAT
              <span className="ml-1 font-normal text-muted-foreground">· billed monthly</span>
            </div>
          </div>
          <Button onClick={onSelect} size="sm" className="shrink-0">
            Select
          </Button>
        </div>
      </div>
    </article>
  );
}
