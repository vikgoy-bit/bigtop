import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";

export const Route = createFileRoute("/boxes-and-packaging")({
  head: () => ({
    meta: [
      { title: "Boxes & packaging — Big Top Self Storage" },
      { name: "description", content: "Sturdy moving boxes, tape, bubble wrap and mattress covers — available on site at our Basildon store." },
      { property: "og:title", content: "Boxes & packaging at Big Top" },
      { property: "og:url", content: "https://bigtop.lovable.app/boxes-and-packaging" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/boxes-and-packaging" }],
  }),
  component: BoxesPage,
});

const ITEMS = [
  { name: "Small box", desc: "Books, files, kitchen bits. Easy one-hand carry.", price: "£2.50" },
  { name: "Medium box", desc: "The everyday moving box. Clothes, kids' stuff, decor.", price: "£3.50" },
  { name: "Large box", desc: "Bedding, pillows, lampshades — bulky but light.", price: "£4.50" },
  { name: "Wardrobe box", desc: "Hanging rail inside. Move shirts and suits without folding.", price: "£12.00" },
  { name: "Packing tape", desc: "50m roll of sticks-first-time brown tape.", price: "£3.00" },
  { name: "Bubble wrap", desc: "10m roll. Glasses, picture frames, ornaments.", price: "£8.00" },
  { name: "Mattress cover", desc: "Heavy-duty plastic. Single, double, king available.", price: "£5.00" },
  { name: "Sofa cover", desc: "Keeps the dust off while you're in storage.", price: "£8.00" },
];

function BoxesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Boxes & packaging</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Pack it once. Pack it right.</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Sturdy boxes, sticky tape and proper covers — all stocked on site in Basildon. Pop in any day
            between 08:00 and 20:00, no appointment needed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <div key={it.name} className="rounded-2xl border bg-card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Package className="h-5 w-5" />
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-lg font-bold">{it.name}</h3>
                <span className="text-sm font-semibold text-accent">{it.price}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">Prices are per item, inc. VAT. Multi-buy discounts on full moving kits — ask at reception.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/contact-us">Reserve a moving kit <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
