import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "guide-using-self-storage-during-home-renovations";
const URL = "https://bigtop.lovable.app/guide-using-self-storage-during-home-renovations";

export const Route = createFileRoute("/guide-using-self-storage-during-home-renovations")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Guide: Using self-storage during home renovations — Big Top Self Storage" },
        { name: "description", content: "Renovating your home? Learn how self storage can protect your belongings, reduce clutter & make building work easier with this complete guide." },
        { property: "og:title", content: "Guide: Using self-storage during home renovations" },
        { property: "og:description", content: "Renovating your home? Learn how self storage can protect your belongings, reduce clutter & make building work easier with this complete guide." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoTwo-S15-scaled.png" },
        { property: "article:published_time", content: "2026-04-22T16:15:07+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Guide: Using self-storage during home renovations","description":"Renovating your home? Learn how self storage can protect your belongings, reduce clutter & make building work easier with this complete guide.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoTwo-S15-scaled.png","datePublished":"2026-04-22T16:15:07+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/guide-using-self-storage-during-home-renovations"}),
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
