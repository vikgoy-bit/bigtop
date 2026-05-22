import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "next-generation-self-storage-security";
const URL = "https://bigtop.lovable.app/next-generation-self-storage-security";

export const Route = createFileRoute("/next-generation-self-storage-security")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Next generation self storage security, AI powered monitoring and access control — Big Top Self Storage" },
        { name: "description", content: "Explore how AI assisted monitoring, CCTV and smart entry systems improve protection and customer experience." },
        { property: "og:title", content: "Next generation self storage security, AI powered monitoring and access control" },
        { property: "og:description", content: "Explore how AI assisted monitoring, CCTV and smart entry systems improve protection and customer experience." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2026/01/BigTopStorage-VideoOne-S6-scaled.png" },
        { property: "article:published_time", content: "2026-03-10T19:51:32+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Next generation self storage security, AI powered monitoring and access control","description":"Explore how AI assisted monitoring, CCTV and smart entry systems improve protection and customer experience.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2026/01/BigTopStorage-VideoOne-S6-scaled.png","datePublished":"2026-03-10T19:51:32+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/next-generation-self-storage-security"}),
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
