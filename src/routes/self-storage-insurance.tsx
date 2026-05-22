import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, FileText, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/self-storage-insurance")({
  head: () => ({
    meta: [
      { title: "Self storage insurance — Big Top Self Storage" },
      { name: "description", content: "Affordable storage insurance covering fire, flood, theft and accidental damage. Add it to your unit in seconds." },
      { property: "og:title", content: "Self storage insurance" },
      { property: "og:url", content: "https://bigtop.lovable.app/self-storage-insurance" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/self-storage-insurance" }],
  }),
  component: InsurancePage,
});

const TIERS = [
  { cover: "£1,000", price: "£3.50", desc: "Boxes, clothes, a small bedroom's worth of stuff." },
  { cover: "£3,000", price: "£7.50", desc: "Furniture from a one-bed flat, household items." },
  { cover: "£5,000", price: "£11.50", desc: "Most family-home contents, white goods included." },
  { cover: "£10,000", price: "£19.50", desc: "Large homes, electronics, valuable equipment." },
];

function InsurancePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Insurance</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Peace of mind, from a couple of quid a week.</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Storage insurance is a condition of your contract — you can either show us proof of your existing
            cover, or add ours when you book.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">What's covered</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Perk icon={<ShieldCheck className="h-5 w-5" />} title="Fire, flood & theft" body="The big three. Full new-for-old replacement on covered items." />
          <Perk icon={<FileText className="h-5 w-5" />} title="Accidental damage" body="Bumps and breakages while moving stuff in and out of your unit." />
          <Perk icon={<AlertTriangle className="h-5 w-5" />} title="Storm & impact" body="Damage caused by extreme weather or vehicle impact to the building." />
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Pick a level</h2>
          <p className="mt-2 text-muted-foreground">Monthly premium, added to your storage bill.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((t) => (
              <div key={t.cover} className="rounded-2xl border bg-card p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Up to</div>
                <div className="mt-1 font-display text-2xl font-bold">{t.cover}</div>
                <div className="mt-2 text-sm font-semibold text-accent">{t.price} / month</div>
                <p className="mt-3 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Indicative pricing. Full policy wording, exclusions and excesses provided before you commit at checkout.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/get-a-quote">Add cover to my quote <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
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
