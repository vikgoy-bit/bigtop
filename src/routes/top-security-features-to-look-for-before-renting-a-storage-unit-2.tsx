import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "top-security-features-to-look-for-before-renting-a-storage-unit-2";
const URL = "https://bigtop.lovable.app/top-security-features-to-look-for-before-renting-a-storage-unit-2";

export const Route = createFileRoute("/top-security-features-to-look-for-before-renting-a-storage-unit-2")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Top security features to look for before renting a storage unit — Big Top Self Storage" },
        { name: "description", content: "Discover the top security features to look for, from CCTV to access control, and how Big Top Self Storage helps protect your belongings." },
        { property: "og:title", content: "Top security features to look for before renting a storage unit" },
        { property: "og:description", content: "Discover the top security features to look for, from CCTV to access control, and how Big Top Self Storage helps protect your belongings." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/12/BigTopStorage-VideoTwo-S1-scaled.png" },
        { property: "article:published_time", content: "2026-03-23T09:11:45+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Top security features to look for before renting a storage unit","description":"Discover the top security features to look for, from CCTV to access control, and how Big Top Self Storage helps protect your belongings.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/12/BigTopStorage-VideoTwo-S1-scaled.png","datePublished":"2026-03-23T09:11:45+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/top-security-features-to-look-for-before-renting-a-storage-unit-2"}),
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
