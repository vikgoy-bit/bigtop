import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowLeft } from "lucide-react";
import type { BlogPost } from "@/data/blogPosts";

interface Props {
  post: BlogPost;
}

export function BlogPostLayout({ post }: Props) {
  const date = post.datePublished
    ? new Date(post.datePublished).toLocaleDateString("en-GB", {
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
          {date && (
            <p className="mt-3 text-sm text-muted-foreground">{date}</p>
          )}
        </header>

        {post.ogImage && (
          <img
            src={post.ogImage}
            alt={post.title}
            className="mt-8 w-full rounded-xl border bg-muted object-cover"
            loading="eager"
          />
        )}

        <div
          className="prose prose-slate mt-10 max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />
      </article>

      <SiteFooter />
    </div>
  );
}
