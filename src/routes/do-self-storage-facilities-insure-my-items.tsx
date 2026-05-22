import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "do-self-storage-facilities-insure-my-items";
const URL = "https://bigtop.lovable.app/do-self-storage-facilities-insure-my-items";

export const Route = createFileRoute("/do-self-storage-facilities-insure-my-items")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Do self-storage facilities insure my items? — Big Top Self Storage" },
        { name: "description", content: "Are my items insured? Learn what self storage insurance means, what may be covered, & why checking your protection matters" },
        { property: "og:title", content: "Do self-storage facilities insure my items?" },
        { property: "og:description", content: "Are my items insured? Learn what self storage insurance means, what may be covered, & why checking your protection matters" },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoTwo-S4-scaled.png" },
        { property: "article:published_time", content: "2026-04-16T08:13:06+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Do self-storage facilities insure my items?","description":"Are my items insured? Learn what self storage insurance means, what may be covered, & why checking your protection matters","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoTwo-S4-scaled.png","datePublished":"2026-04-16T08:13:06+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/do-self-storage-facilities-insure-my-items"}),
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
