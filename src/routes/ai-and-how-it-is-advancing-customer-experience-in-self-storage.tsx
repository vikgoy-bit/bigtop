import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "ai-and-how-it-is-advancing-customer-experience-in-self-storage";
const URL = "https://bigtop.lovable.app/ai-and-how-it-is-advancing-customer-experience-in-self-storage";

export const Route = createFileRoute("/ai-and-how-it-is-advancing-customer-experience-in-self-storage")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "AI and how it is advancing customer experience in self storage — Big Top Self Storage" },
        { name: "description", content: "How AI is improving the self storage customer experience: faster enquiries & smoother move ins, to smarter security & personalised support." },
        { property: "og:title", content: "AI and how it is advancing customer experience in self storage" },
        { property: "og:description", content: "How AI is improving the self storage customer experience: faster enquiries & smoother move ins, to smarter security & personalised support." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/12/BigTopStorage-VideoTwo-S8-scaled.png" },
        { property: "article:published_time", content: "2026-02-05T08:27:18+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"AI and how it is advancing customer experience in self storage","description":"How AI is improving the self storage customer experience: faster enquiries & smoother move ins, to smarter security & personalised support.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/12/BigTopStorage-VideoTwo-S8-scaled.png","datePublished":"2026-02-05T08:27:18+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/ai-and-how-it-is-advancing-customer-experience-in-self-storage"}),
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
