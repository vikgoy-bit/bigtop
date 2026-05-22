import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & conditions — Big Top Self Storage" },
      { name: "description", content: "The terms that apply when you rent a self storage unit from Big Top in Basildon." },
      { property: "og:url", content: "https://bigtop.lovable.app/terms-conditions" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/terms-conditions" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Terms & conditions</h1>
          <p className="mt-3 text-primary-foreground/80">Last updated: 22 May 2026</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose prose-slate dark:prose-invert">
        <p>
          These terms summarise the contract between you (the customer) and Big Top Self Storage Ltd. The
          full storage agreement is provided at checkout and is the legally-binding document — this page is
          just a plain-English overview.
        </p>

        <h2>1. The unit</h2>
        <p>
          We grant you a licence to use a specific unit for storage of your goods. You are responsible for the
          goods inside. We do not take ownership or possession of them.
        </p>

        <h2>2. Payment</h2>
        <p>
          Rent is paid monthly in advance by Direct Debit. Prices may change with at least 28 days' notice in
          writing. Late payments may incur an admin fee and, ultimately, a lien over your goods.
        </p>

        <h2>3. Notice period</h2>
        <p>
          Either side can end the agreement with 14 days' written notice. The unit must be left clean, empty
          and undamaged.
        </p>

        <h2>4. Insurance</h2>
        <p>
          Insurance is mandatory. You can use ours (see <a href="/self-storage-insurance">insurance</a>) or
          provide proof of equivalent third-party cover.
        </p>

        <h2>5. Prohibited items</h2>
        <p>
          You may not store: living things, food, perishables, illegal items, firearms, explosives, flammable
          or hazardous materials, or anything that breaks UK law. We reserve the right to inspect units where
          we reasonably suspect a breach.
        </p>

        <h2>6. Access</h2>
        <p>
          Smart-entry access is available 24/7 to active customers in good standing. We may suspend access if
          the account is in arrears or if there's a security concern.
        </p>

        <h2>7. Liability</h2>
        <p>
          Our liability is limited as set out in the full storage agreement. Nothing in these terms limits
          liability for death, personal injury or fraud.
        </p>

        <h2>8. Governing law</h2>
        <p>The contract is governed by the laws of England and Wales.</p>
      </article>

      <SiteFooter />
    </div>
  );
}
