import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "self-storage-vs-office-space";
const URL = "https://bigtop.lovable.app/self-storage-vs-office-space";

export const Route = createFileRoute("/self-storage-vs-office-space")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Self storage vs office space for small businesses, cost, flexibility, and when it makes sense — Big Top Self Storage" },
        { name: "description", content: "Self storage vs office space: understand costs, flexibility and when a storage unit is a smarter alternative to taking larger premises." },
        { property: "og:title", content: "Self storage vs office space for small businesses, cost, flexibility, and when it makes sense" },
        { property: "og:description", content: "Self storage vs office space: understand costs, flexibility and when a storage unit is a smarter alternative to taking larger premises." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoOne-S5-scaled.png" },
        { property: "article:published_time", content: "2026-02-09T08:30:00+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Self storage vs office space for small businesses, cost, flexibility, and when it makes sense","description":"Self storage vs office space: understand costs, flexibility and when a storage unit is a smarter alternative to taking larger premises.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoOne-S5-scaled.png","datePublished":"2026-02-09T08:30:00+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/self-storage-vs-office-space"}),
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
