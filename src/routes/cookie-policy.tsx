import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie policy — Big Top Self Storage" },
      { name: "description", content: "What cookies Big Top Self Storage uses and how to manage them." },
      { property: "og:url", content: "https://bigtop.lovable.app/cookie-policy" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/cookie-policy" }],
  }),
  component: CookiePage,
});

function CookiePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
          <h1 className="font-display text-4xl font-extrabold sm:text-5xl">Cookie policy</h1>
          <p className="mt-3 text-primary-foreground/80">Last updated: 22 May 2026</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 prose prose-slate dark:prose-invert">
        <p>
          Cookies are small text files that websites place on your device. We use them to make the site work
          and to understand how it's used.
        </p>

        <h2>The cookies we set</h2>
        <ul>
          <li>
            <strong>Strictly necessary</strong> — keep you logged in, remember your quote, and protect against
            fraud. These can't be switched off.
          </li>
          <li>
            <strong>Analytics</strong> — anonymised stats about page views and clicks so we can improve the
            site. You can opt out via the cookie banner.
          </li>
          <li>
            <strong>Marketing</strong> — only set if you consent. Used to measure the effectiveness of any ads
            we run on Google or Meta.
          </li>
        </ul>

        <h2>Managing cookies</h2>
        <p>
          You can change your preferences at any time using the cookie banner, or by clearing cookies in your
          browser settings. Blocking strictly necessary cookies may prevent parts of the site from working.
        </p>

        <h2>More info</h2>
        <p>
          For general background, the ICO's <a href="https://ico.org.uk/your-data-matters/online/cookies/" target="_blank" rel="noopener noreferrer">guide to cookies</a> is excellent.
          For anything specific to Big Top, email <a href="mailto:hi@bigtopselfstorage.com">hi@bigtopselfstorage.com</a>.
        </p>
      </article>

      <SiteFooter />
    </div>
  );
}
