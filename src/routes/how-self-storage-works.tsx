import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, CreditCard, Smartphone, ShieldCheck, KeyRound, Camera } from "lucide-react";

export const Route = createFileRoute("/how-self-storage-works")({
  head: () => ({
    meta: [
      { title: "How self storage works — Big Top Self Storage" },
      {
        name: "description",
        content:
          "A simple, contactless self storage experience: pick your unit online, book in minutes, then use your phone as the key. Here's exactly how it works.",
      },
      { property: "og:title", content: "How self storage works at Big Top" },
      { property: "og:url", content: "https://bigtop.lovable.app/how-self-storage-works" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/how-self-storage-works" }],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">How it works</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
            From clicking "book" to walking in — three steps.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Big Top is built around a simple idea: storage should feel as easy as a hotel check-in.
            No keys handed over, no codes to remember, no opening-hours roulette.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ol className="space-y-12">
          <BigStep
            n={1}
            icon={<Search className="h-5 w-5" />}
            title="Pick the right unit"
          >
            <p>
              Units range from 25 sq ft (a cupboard's worth) up to 150 sq ft (a small house). Each listing
              shows what fits inside, so you don't pay for space you won't use. If you're unsure, our AI
              assistant Lex or the team on 01268 230 230 will size you up in 2 minutes.
            </p>
            <Link to="/get-a-quote" className="mt-3 inline-flex items-center font-semibold text-accent hover:underline">
              Browse units <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </BigStep>

          <BigStep
            n={2}
            icon={<CreditCard className="h-5 w-5" />}
            title="Book and pay online"
          >
            <p>
              The booking flow takes about 3 minutes. You'll fill out your details, ID-verify (we have to —
              insurance), sign the agreement and set up your Direct Debit. We'll send confirmation by email
              the moment you're done.
            </p>
          </BigStep>

          <BigStep
            n={3}
            icon={<Smartphone className="h-5 w-5" />}
            title="Use your phone as the key"
          >
            <p>
              The same day you book, you'll get an invite to the Big Top app. Tap once to open the gate, tap
              again at the shutter, again at the floor, and one more time at your unit door. No padlock, no
              spare key, no extra hardware to buy.
            </p>
          </BigStep>
        </ol>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Inside every unit</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Tile icon={<ShieldCheck className="h-5 w-5" />} label="Modern, dry interiors" />
            <Tile icon={<KeyRound className="h-5 w-5" />} label="No padlock required" />
            <Tile icon={<Camera className="h-5 w-5" />} label="24/7 CCTV coverage" />
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link to="/get-a-quote">
                Find my unit <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function BigStep({
  n,
  icon,
  title,
  children,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-8">
      <div className="flex sm:flex-col sm:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
          {n}
        </div>
        <div className="ml-4 hidden h-full w-px bg-border sm:ml-0 sm:mt-3 sm:block" aria-hidden />
      </div>
      <div>
        <div className="flex items-center gap-2 text-accent">
          {icon}
          <span className="text-xs font-bold uppercase tracking-widest">Step {n}</span>
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold">{title}</h2>
        <div className="mt-3 space-y-3 text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}

function Tile({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</div>
      <span className="font-semibold">{label}</span>
    </div>
  );
}
