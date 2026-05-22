import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "pack-away-seasonal-clothing-the-right-way";
const URL = "https://bigtop.lovable.app/pack-away-seasonal-clothing-the-right-way";

export const Route = createFileRoute("/pack-away-seasonal-clothing-the-right-way")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Pack away seasonal clothing the right way — Big Top Self Storage" },
        { name: "description", content: "Practical tips on cleaning, folding, breathable containers, pest prevention, & using self storage to protect clothes long term." },
        { property: "og:title", content: "Pack away seasonal clothing the right way" },
        { property: "og:description", content: "Practical tips on cleaning, folding, breathable containers, pest prevention, & using self storage to protect clothes long term." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/12/BigTopStorage-VideoTwo-S2-scaled.png" },
        { property: "article:published_time", content: "2026-03-16T08:53:19+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Pack away seasonal clothing the right way","description":"Practical tips on cleaning, folding, breathable containers, pest prevention, & using self storage to protect clothes long term.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/12/BigTopStorage-VideoTwo-S2-scaled.png","datePublished":"2026-03-16T08:53:19+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/pack-away-seasonal-clothing-the-right-way"}),
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
