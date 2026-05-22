import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgePercent, Gift, Users } from "lucide-react";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & deals — Big Top Self Storage" },
      { name: "description", content: "Current self storage offers in Basildon: 50% off your first 8 weeks, refer-a-friend rewards and student summer deals." },
      { property: "og:title", content: "Offers & deals at Big Top" },
      { property: "og:url", content: "https://bigtop.lovable.app/offers" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/offers" }],
  }),
  component: OffersPage,
});

const OFFERS = [
  {
    icon: BadgePercent,
    badge: "Most popular",
    title: "50% off your first 8 weeks",
    body: "New customers on any unit size. Pay half rent for the first two months, then standard pricing from week 9.",
    cta: "Claim this offer",
  },
  {
    icon: Users,
    badge: "Refer a friend",
    title: "£50 off, both of you",
    body: "Send a mate our way. When they move in, you both get £50 credited to your next month's rent.",
    cta: "Get your referral link",
  },
  {
    icon: Gift,
    badge: "Students",
    title: "Free padlock & first box",
    body: "Student summer storage from £35/month — plus a free moving box and padlock when you book online.",
    cta: "See student deals",
  },
];

function OffersPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Offers</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Storage that's already a deal — now with a better one.</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            We keep prices honest year-round, but every now and then we sweeten things up. Here's what's on at the moment.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {OFFERS.map(({ icon: Icon, badge, title, body, cta }) => (
            <div key={title} className="flex flex-col rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-2 text-accent">
                <Icon className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-widest">{badge}</span>
              </div>
              <h2 className="mt-3 font-display text-xl font-bold">{title}</h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{body}</p>
              <Button asChild className="mt-6 w-full">
                <Link to="/get-a-quote">{cta} <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          Offers are for new customers unless stated, can't be combined, and may be withdrawn at any time. Full T&amp;Cs
          available on request.
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
