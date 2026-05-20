import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/contact-us")({
  head: () => ({
    meta: [
      { title: "Contact — Big Top Self Storage Basildon" },
      { name: "description", content: "Call 01268 230 230 or email hi@bigtopselfstorage.com. Visit us at Harvey Road, Basildon SS13 1ET, open 8am–8pm every day." },
      { property: "og:url", content: "https://bigtop.lovable.app/contact-us" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/contact-us" }],
  }),
  component: () => (
    <ComingSoonPage
      title="Get in touch"
      intro="We're at Harvey Road, Basildon SS13 1ET. Open every day from 8am to 8pm."
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone</dt>
          <dd className="mt-2 font-display text-2xl font-bold"><a href="tel:01268230230">01268 230 230</a></dd>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</dt>
          <dd className="mt-2 font-display text-xl font-bold break-all"><a href="mailto:hi@bigtopselfstorage.com">hi@bigtopselfstorage.com</a></dd>
        </div>
        <div className="rounded-2xl border bg-card p-6 sm:col-span-2">
          <dt className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visit</dt>
          <dd className="mt-2 text-base">Big Top Self Storage, Harvey Road, Basildon, Essex, SS13 1ET</dd>
          <dd className="mt-1 text-sm text-muted-foreground">Open every day · 08:00 – 20:00</dd>
        </div>
      </dl>
    </ComingSoonPage>
  ),
});
