import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowLeft } from "lucide-react";
import { getPublishedPostBySlug } from "@/lib/blog.functions";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPostBySlug({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return {};
    const { post } = loaderData;
    const canonical = `https://bigtop.lovable.app/${params.slug}`;
    return {
      meta: [
        { title: `${post.title} — Big Top Self Storage` },
        { name: "description", content: post.meta_desc },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.meta_desc },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
        ...(post.og_image ? [{ property: "og:image", content: post.og_image }] : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.meta_desc,
            image: post.og_image || undefined,
            datePublished: post.date_published,
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-block font-semibold text-primary hover:underline"
        >
          Browse the blog →
        </Link>
      </div>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="p-10 text-center text-muted-foreground">
        {error instanceof Error ? error.message : "Something went wrong"}
      </div>
      <SiteFooter />
    </div>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const date = post.date_published
    ? new Date(post.date_published).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <header className="mt-6">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            {post.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            {post.title}
          </h1>
          {date && <p className="mt-3 text-sm text-muted-foreground">{date}</p>}
        </header>

        {post.og_image && (
          <img
            src={post.og_image}
            alt={post.title}
            className="mt-8 w-full rounded-xl border bg-muted object-cover"
            loading="eager"
          />
        )}

        <div
          className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.body_html }}
        />
      </article>

      <SiteFooter />
    </div>
  );
}
