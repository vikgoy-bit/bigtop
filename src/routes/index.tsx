import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, MapPin, Clock, ShieldCheck, KeyRound, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGBPRound } from "@/lib/format";
import { cn } from "@/lib/utils";

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

type Unit = {
  id: string;
  name: string;
  size_sqft: number;
  size_group: "small" | "medium" | "large";
  monthly_price_pence: number;
  weekly_price_pence: number;
  features: string[];
  offer_label: string | null;
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "small", label: "Small" },
  { key: "medium", label: "Medium" },
  { key: "large", label: "Large" },
] as const;

function SelectUnitPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: units, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("id,name,size_sqft,size_group,monthly_price_pence,weekly_price_pence,features,offer_label")
        .eq("available", true)
        .order("sort_order");
      if (error) throw error;
      return data as Unit[];
    },
  });

  const filtered = useMemo(
    () => (units ?? []).filter((u) => filter === "all" || u.size_group === filter),
    [units, filter]
  );

  // Stash chosen unit then route to login or details
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unitId = params.get("unit");
    if (unitId) sessionStorage.setItem("pending_unit_id", unitId);
  }, []);

  const handleSelect = (unitId: string) => {
    sessionStorage.setItem("pending_unit_id", unitId);
    if (user) {
      navigate({ to: "/book/details" });
    } else {
      navigate({ to: "/login", search: { redirect: "/book/details" } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Site info strip */}
      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/70">
            Selected location
          </div>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Big Top Self Storage
            <span className="block text-accent">Basildon</span>
          </h1>
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <InfoTile icon={<MapPin className="h-4 w-4" />} title="Address">
              Harvey Road, Basildon, Essex, SS13 1ET
            </InfoTile>
            <InfoTile icon={<Clock className="h-4 w-4" />} title="Opening hours">
              Mon–Sun · 08:00–20:00
            </InfoTile>
            <InfoTile icon={<Phone className="h-4 w-4" />} title="Call us">
              <a href="tel:01268230230" className="underline-offset-2 hover:underline">
                01268 230 230
              </a>
            </InfoTile>
            <InfoTile icon={<Mail className="h-4 w-4" />} title="Email">
              <a href="mailto:hi@bigtopselfstorage.com" className="underline-offset-2 hover:underline">
                hi@bigtopselfstorage.com
              </a>
            </InfoTile>
          </div>
        </div>
      </section>

      {/* Unit selection */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent">
            Step 1 of 4 · Choose your unit
          </span>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Select your <span className="text-accent">unit</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Every unit includes 24/7 CCTV, smart entry and modern interiors. Cancel anytime.
          </p>
        </div>

        {/* Filter pills */}
        <div className="sticky top-16 z-30 -mx-4 mt-6 border-b bg-background/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border sm:px-3">
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
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          {filtered.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onSelect={() => handleSelect(unit.id)} />
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
    <div className="rounded-xl bg-primary-foreground/10 p-4 ring-1 ring-primary-foreground/15">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
        {icon}
        {title}
      </div>
      <div className="mt-1.5 text-sm font-medium text-primary-foreground">{children}</div>
    </div>
  );
}

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "24/7 CCTV Monitoring": <Camera className="h-3.5 w-3.5" />,
  "Smart Entry": <KeyRound className="h-3.5 w-3.5" />,
  Modern: <ShieldCheck className="h-3.5 w-3.5" />,
  "Drive-up access": <ShieldCheck className="h-3.5 w-3.5" />,
};

function UnitCard({ unit, onSelect }: { unit: Unit; onSelect: () => void }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm ring-1 ring-border/50 transition hover:-translate-y-0.5 hover:shadow-lg">
      {unit.offer_label && (
        <div className="absolute right-3 top-3 z-10">
          <Badge className="bg-offer text-offer-foreground hover:bg-offer">{unit.offer_label}</Badge>
        </div>
      )}
      <div className="flex aspect-[16/10] items-end justify-start bg-gradient-to-br from-primary/10 via-secondary to-accent/15 p-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {unit.size_group} unit
          </div>
          <div className="mt-1 font-display text-4xl font-extrabold leading-none">
            {unit.size_sqft}
            <span className="ml-1 text-base font-bold text-muted-foreground">sq ft</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <ul className="flex flex-wrap gap-1.5">
          {unit.features.map((f) => (
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
              {formatGBPRound(unit.monthly_price_pence)}
              <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatGBPRound(unit.weekly_price_pence)}/week · incl. 20% VAT
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
