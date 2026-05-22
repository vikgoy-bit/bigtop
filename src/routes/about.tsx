import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Big Top Self Storage Basildon" },
      {
        name: "description",
      content:
        "Big Top Self Storage is an automated Basildon facility with smart-entry units, 24/7 CCTV and the longest opening hours in the local area.",
      },
      { property: "og:title", content: "About Big Top Self Storage" },
      { property: "og:url", content: "https://bigtop.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">About us</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
            Storage, the way we always wanted it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            We built Big Top because every storage place we used was either fiddly, miserable, or both.
            Padlocks lost, gates jammed, an office that closes at 5pm. Our promise: a clean unit, your phone
            as the key, and a real person on the phone when you need one.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="prose prose-slate max-w-none">
          <h2 className="font-display text-2xl font-bold">Built locally, for Basildon</h2>
          <p className="text-muted-foreground">
            We're based on Harvey Road, a couple of minutes from the A127. The site is purpose-built — not a
            converted warehouse with leaky corners — so units are dry, level, and easy to access. Drive-up
            options are available if you've got a van full of furniture.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">Smart-entry from day one</h2>
          <p className="text-muted-foreground">
            Every customer gets an app the same day they book. It opens the gate, the shutter, the floor
            access and your unit door. No padlocks to lose, no awkward fobs, no ten-digit codes to remember.
            And if your partner needs to swing by, you can share access in a tap.
          </p>

          <h2 className="mt-10 font-display text-2xl font-bold">A few numbers we're proud of</h2>
          <ul className="mt-3 grid gap-3 not-prose sm:grid-cols-2">
            {[
              ["8am – 8pm", "Open every day"],
              ["24/7", "CCTV monitoring"],
              ["3 min", "Average booking time"],
              ["£1", "First 6 weeks rental"],
            ].map(([v, l]) => (
              <li key={l} className="rounded-2xl border bg-card p-5">
                <div className="font-display text-3xl font-extrabold text-primary">{v}</div>
                <div className="mt-1 text-sm text-muted-foreground">{l}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Button asChild size="lg">
            <Link to="/get-a-quote">
              Get a quote <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact-us">Contact us</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
