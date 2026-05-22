import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "why-businesses-should-insure-stock-and-documents";
const URL = "https://bigtop.lovable.app/why-businesses-should-insure-stock-and-documents";

export const Route = createFileRoute("/why-businesses-should-insure-stock-and-documents")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Why businesses should insure stock and documents in storage — Big Top Self Storage" },
        { name: "description", content: "Why insuring stock & documents matter - the risks insurance can cover, how to choose the right value, and how to protect business assets." },
        { property: "og:title", content: "Why businesses should insure stock and documents in storage" },
        { property: "og:description", content: "Why insuring stock & documents matter - the risks insurance can cover, how to choose the right value, and how to protect business assets." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2026/01/BigTopStorage-VideoTwo-S5-scaled.png" },
        { property: "article:published_time", content: "2026-02-16T08:33:00+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Why businesses should insure stock and documents in storage","description":"Why insuring stock & documents matter - the risks insurance can cover, how to choose the right value, and how to protect business assets.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2026/01/BigTopStorage-VideoTwo-S5-scaled.png","datePublished":"2026-02-16T08:33:00+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/why-businesses-should-insure-stock-and-documents"}),
      }],
    };
  },
  component: Page,
});

function Page() {
  const post = getPost(SLUG);
  if (!post) return null;
  return <BlogPostLayout post={post} />;
}
