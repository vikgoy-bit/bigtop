import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { blogPosts } from "@/data/blogPosts";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Big Top Self Storage Basildon" },
      {
        name: "description",
        content:
          "Guides and tips on self storage, renovations, security, insurance and packing — from the Big Top Self Storage team in Basildon.",
      },
      { property: "og:title", content: "Big Top Self Storage Blog" },
      {
        property: "og:description",
        content:
          "Guides and tips on self storage, renovations, security, insurance and packing.",
      },
      { property: "og:url", content: "https://bigtop.lovable.app/blog" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/blog" }],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = [...blogPosts].sort((a, b) =>
    (b.datePublished || "").localeCompare(a.datePublished || ""),
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Blog
          </span>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">
            Guides, tips & news
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-primary-foreground/85">
            Practical advice on packing, security, insurance, business storage and
            getting the most out of your unit.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/${post.slug}` as never}
              className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-lg"
            >
              {post.ogImage && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={post.ogImage}
                    alt={post.title}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">
                  {post.category}
                </span>
                <h2 className="mt-2 font-display text-lg font-bold leading-snug group-hover:text-primary">
                  {post.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {post.metaDesc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
