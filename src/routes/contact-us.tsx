import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact us — Big Top Self Storage" },
      { name: "description", content: "Get in touch with Big Top Self Storage in Basildon. Call 01268 230 230, email hi@bigtopselfstorage.com or pop in any day 08:00–20:00." },
      { property: "og:title", content: "Contact Big Top Self Storage" },
      { property: "og:url", content: "https://bigtop.lovable.app/contact-us" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/contact-us" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Lightweight client-only stub — wire to a server function when ready.
    await new Promise((r) => setTimeout(r, 600));
    setSending(false);
    (e.target as HTMLFormElement).reset();
    toast.success("Thanks — we'll be in touch within one working day.");
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Contact</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">Talk to a human. Or our AI. Both work.</h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Quickest way to a price is our online quote, but if you'd rather chat we're on the phone, email and
            in person, every day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/get-a-quote">Get an instant quote <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <Card icon={<Phone className="h-5 w-5" />} title="Call us">
              <a href="tel:01268230230" className="text-lg font-semibold text-foreground hover:text-accent">01268 230 230</a>
              <p className="mt-1 text-sm text-muted-foreground">Mon–Sun, 08:00–20:00.</p>
            </Card>
            <Card icon={<Mail className="h-5 w-5" />} title="Email">
              <a href="mailto:hi@bigtopselfstorage.com" className="text-lg font-semibold text-foreground hover:text-accent">hi@bigtopselfstorage.com</a>
              <p className="mt-1 text-sm text-muted-foreground">Replies inside one working day.</p>
            </Card>
            <Card icon={<MapPin className="h-5 w-5" />} title="Visit us">
              <p className="text-foreground">Harvey Road, Basildon, Essex, SS13 1ET</p>
              <p className="mt-1 text-sm text-muted-foreground">Free parking right outside reception.</p>
            </Card>
            <Card icon={<Clock className="h-5 w-5" />} title="Reception hours">
              <p className="text-foreground">Every day, 08:00–20:00</p>
              <p className="mt-1 text-sm text-muted-foreground">Smart-entry access 24/7 for existing customers.</p>
            </Card>
          </div>

          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold">Send us a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tell us what you need and we'll come back to you.</p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" name="name" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" name="phone" type="tel" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="message">How can we help?</Label>
                <Textarea id="message" name="message" required rows={5} className="mt-1.5" />
              </div>
              <Button type="submit" size="lg" disabled={sending} className="w-full sm:w-auto">
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
