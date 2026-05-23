import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { importedPages } from "@/data/importedPages";

const page = importedPages["storage-size"];
const canonical = "https://bigtop.lovable.app/storage-size";

export const Route = createFileRoute("/storage-size")({
  head: () => ({
    meta: [
      { title: `${page.title} — Big Top Self Storage` },
      { name: "description", content: page.metaDesc },
      { property: "og:title", content: `${page.title} — Big Top Self Storage` },
      { property: "og:description", content: page.metaDesc },
      { property: "og:url", content: canonical },
    ],
    links: [{ rel: "canonical", href: canonical }],
  }),
  component: PageComponent,
});

function PageComponent() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl mb-8">
          {page.title}
        </h1>
        <div
          className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline prose-table:w-full prose-th:bg-muted prose-th:p-3 prose-th:text-left prose-td:p-3 prose-td:border prose-th:border"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
