import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listPublishedPosts } from "@/lib/blog.functions";

export const Route = createFileRoute("/blog")({
  loader: () => listPublishedPosts(),
  head: () => ({
    meta: [
      { title: "Blog — Big Top Self Storage" },
      {
        name: "description",
        content:
          "Storage tips, packing guides, and updates from Big Top Self Storage in Basildon.",
      },
      { property: "og:title", content: "Blog — Big Top Self Storage" },
      {
        property: "og:description",
        content:
          "Storage tips, packing guides, and updates from Big Top Self Storage in Basildon.",
      },
      { property: "og:url", content: "https://bigtop.lovable.app/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-12 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            The Big Top blog
          </span>
          <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Storage tips, guides &amp; news
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Advice on packing, security, business storage and life in Basildon — from the
            Big Top team.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/$slug"
                params={{ slug: p.slug }}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-lg"
              >
                {p.og_image ? (
                  <img
                    src={p.og_image}
                    alt={p.title}
                    className="aspect-[16/10] w-full bg-muted object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="aspect-[16/10] w-full bg-gradient-to-br from-primary/10 to-accent/10" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">
                    {p.category}
                  </span>
                  <h2 className="mt-2 font-display text-lg font-bold leading-snug group-hover:underline">
                    {p.title}
                  </h2>
                  {p.excerpt || p.meta_desc ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {p.excerpt || p.meta_desc}
                    </p>
                  ) : null}
                  {p.date_published && (
                    <p className="mt-auto pt-3 text-xs text-muted-foreground">
                      {new Date(p.date_published).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
