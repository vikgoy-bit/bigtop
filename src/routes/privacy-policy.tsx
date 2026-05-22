import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Big Top Self Storage" },
      { name: "description", content: "How Big Top Self Storage collects, uses and protects your personal data." },
      { property: "og:url", content: "https://bigtop.lovable.app/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/privacy-policy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Privacy policy</h1>
          <p className="mt-3 text-primary-foreground/80">Last updated: 22 May 2026</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose prose-slate dark:prose-invert">
        <p>
          Big Top Self Storage ("we", "us", "our") respects your privacy. This policy explains what personal
          data we collect, why, and what your rights are under UK GDPR.
        </p>

        <h2>Who we are</h2>
        <p>
          Big Top Self Storage, Harvey Road, Basildon, Essex, SS13 1ET. We are the data controller for the
          information we hold about you. Contact us at <a href="mailto:hi@bigtopselfstorage.com">hi@bigtopselfstorage.com</a>.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Contact details</strong> — name, address, email, phone number.</li>
          <li><strong>ID verification</strong> — a copy of your photo ID, required by law to rent a unit.</li>
          <li><strong>Billing</strong> — Direct Debit details, processed by our payment provider.</li>
          <li><strong>Site access</strong> — entry/exit logs and CCTV footage of communal areas.</li>
          <li><strong>Website usage</strong> — anonymised analytics about how you use bigtopselfstorage.com.</li>
        </ul>

        <h2>Why we collect it</h2>
        <ul>
          <li>To set up and manage your storage account.</li>
          <li>To meet our legal obligations (ID, anti-money-laundering, insurance).</li>
          <li>To keep the site secure for everyone.</li>
          <li>To send service emails (e.g. payment receipts, contract changes).</li>
          <li>With your consent, to send occasional offers and updates — you can opt out at any time.</li>
        </ul>

        <h2>How long we keep it</h2>
        <p>
          We keep account data for the duration of your contract and for 6 years afterwards (HMRC rules).
          CCTV footage is retained for 31 days unless required for an incident investigation.
        </p>

        <h2>Your rights</h2>
        <p>
          You have the right to access, correct, delete or restrict our use of your data, and to lodge a
          complaint with the ICO. To exercise any of these rights, email us at
          <a href="mailto:hi@bigtopselfstorage.com"> hi@bigtopselfstorage.com</a>.
        </p>

        <h2>Cookies</h2>
        <p>See our <a href="/cookie-policy">cookie policy</a> for details of what we set and how to manage them.</p>
      </article>

      <SiteFooter />
    </div>
  );
}
