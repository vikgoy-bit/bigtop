import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Boxes, Truck, Receipt, Briefcase, PackageCheck, Clock, Mailbox, Users, Coffee } from "lucide-react";

export const Route = createFileRoute("/business-storage")({
  head: () => ({
    meta: [
      { title: "Business storage in Basildon — Big Top Self Storage" },
      { name: "description", content: "Flexible business storage for stock, archive, tools and ecommerce. 24/7 smart-entry access, VAT invoices and goods-in support." },
      { property: "og:title", content: "Business storage in Basildon" },
      { property: "og:description", content: "Stock, archive and ecommerce storage in Basildon. 24/7 access, VAT invoices, parcel handling." },
      { property: "og:url", content: "https://bigtop.lovable.app/business-storage" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/business-storage" }],
  }),
  component: BusinessStoragePage,
});

const USES = [
  { icon: Boxes, title: "Stock & inventory", body: "Hold seasonal lines, overflow, or test stock without leasing a warehouse." },
  { icon: Receipt, title: "Archive & records", body: "GDPR-friendly document storage with audit-trail entry logs." },
  { icon: Briefcase, title: "Tools & equipment", body: "Tradespeople and contractors — park kit close to your jobs in Basildon." },
  { icon: PackageCheck, title: "Ecommerce fulfilment", body: "Pick, pack and ship from your unit. Parcel deliveries accepted on your behalf." },
];

function BusinessStoragePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Business storage</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Warehouse flexibility, without the lease.</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Whether you're an Etsy seller running out of spare-room space or a contractor with a van full of kit,
            Big Top gives you a secure base in Basildon you can scale up or down month-to-month.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/get-a-quote">Get a business quote <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10">
              <Link to="/contact-us">Talk to us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Built around how businesses actually work</h2>
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
          <h2 className="font-display text-2xl font-bold sm:text-3xl">What's included</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Perk icon={<Clock className="h-5 w-5" />} title="24/7 smart-entry" body="Your team, your hours. Manage who gets access from the app." />
            <Perk icon={<Truck className="h-5 w-5" />} title="Loading & parking" body="Drive right up to your unit. Pallet trucks and trolleys on site." />
            <Perk icon={<Receipt className="h-5 w-5" />} title="VAT invoicing" body="Monthly VAT receipts, paid by Direct Debit. Simple bookkeeping." />
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link to="/get-a-quote">See unit sizes & pricing <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
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
