import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, PoundSterling, CalendarClock, Smartphone, BadgePercent } from "lucide-react";
import { getStoreganiseUnits } from "@/lib/storeganise.functions";

const unitsQueryOptions = queryOptions({
  queryKey: ["storeganise-units"],
  queryFn: () => getStoreganiseUnits(),
});

export const Route = createFileRoute("/student-storage")({
  head: () => ({
    meta: [
      { title: "Student storage in Basildon — Big Top Self Storage" },
      { name: "description", content: "Affordable summer storage for students in Basildon. Short-term contracts, smart-entry access and 10% off with a valid student ID." },
      { property: "og:title", content: "Student storage in Basildon" },
      { property: "og:description", content: "Short-term summer storage for students in Basildon. Flexible, secure and 10% off with a valid student ID." },
      { property: "og:url", content: "https://bigtop.lovable.app/student-storage" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/student-storage" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(unitsQueryOptions),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-muted-foreground">Couldn't load live prices: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => <div className="p-8">Not found</div>,
  component: StudentStoragePage,
});

function formatPounds(pence: number): string {
  const pounds = pence / 100;
  return `£${Number.isInteger(pounds) ? pounds : pounds.toFixed(2)}`;
}

function StudentStoragePage() {
  const { data } = useSuspenseQuery(unitsQueryOptions);
  const cheapest = data.units
    .filter((u) => u.monthly_price_pence > 0)
    .reduce<null | { monthly_price_pence: number }>(
      (best, u) => (!best || u.monthly_price_pence < best.monthly_price_pence ? u : best),
      null
    );
  const fromLabel = cheapest ? `From ${formatPounds(cheapest.monthly_price_pence)}/month` : "Student-friendly pricing";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Student storage</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Don't drag it home for the summer.</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Keep your kit safe in Basildon between terms. Short contracts, student-friendly prices and a unit
            you can let yourself into 24/7 with your phone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/get-a-quote">Get a student quote <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border-2 border-accent bg-accent/5 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <BadgePercent className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">10% student discount</h2>
              <p className="mt-2 text-muted-foreground">
                Got a valid student ID? You get 10% off your monthly rate. Book your unit online as normal, then send
                a photo of your student ID to our team and we'll apply the adjustment to your account.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/get-a-quote">Book your unit <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact-us">Send us your ID</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold sm:text-3xl">Made for the summer-out crowd</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Perk icon={<PoundSterling className="h-5 w-5" />} title={fromLabel} body="Small units sized for one student's gear — bedding, books, kettle, the lot. Live price from our booking system." />
          <Perk icon={<CalendarClock className="h-5 w-5" />} title="Monthly rolling" body="Take it for one month or four. Cancel anytime with two weeks' notice." />
          <Perk icon={<GraduationCap className="h-5 w-5" />} title="Bring a friend" body="Share a bigger unit with your housemates and split the bill." />
          <Perk icon={<Smartphone className="h-5 w-5" />} title="Phone as key" body="No queueing for reception, no codes to forget. Tap in, drop, leave." />
        </div>
        <div className="mt-10">
          <Button asChild size="lg">
            <Link to="/get-a-quote">Get a quote <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
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
