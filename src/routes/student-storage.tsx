import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, PoundSterling, CalendarClock, Smartphone } from "lucide-react";

export const Route = createFileRoute("/student-storage")({
  head: () => ({
    meta: [
      { title: "Student storage in Basildon — Big Top Self Storage" },
      { name: "description", content: "Affordable summer storage for students. Short-term contracts, smart-entry access and prices from £35/month." },
      { property: "og:title", content: "Student storage in Basildon" },
      { property: "og:description", content: "Short-term summer storage for students in Basildon. Flexible, secure and easy on the budget." },
      { property: "og:url", content: "https://bigtop.lovable.app/student-storage" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/student-storage" }],
  }),
  component: StudentStoragePage,
});

function StudentStoragePage() {
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
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Made for the summer-out crowd</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Perk icon={<PoundSterling className="h-5 w-5" />} title="From £35/month" body="Small units sized for one student's gear — bedding, books, kettle, the lot." />
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
