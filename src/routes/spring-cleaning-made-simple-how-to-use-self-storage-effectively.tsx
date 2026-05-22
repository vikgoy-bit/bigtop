import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "spring-cleaning-made-simple-how-to-use-self-storage-effectively";
const URL = "https://bigtop.lovable.app/spring-cleaning-made-simple-how-to-use-self-storage-effectively";

export const Route = createFileRoute("/spring-cleaning-made-simple-how-to-use-self-storage-effectively")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "Spring cleaning made simple, how to use self storage effectively — Big Top Self Storage" },
        { name: "description", content: "Learn how to declutter room by room, store seasonal items safely, choose the right unit, and keep your home clear with Big Top Self Storage." },
        { property: "og:title", content: "Spring cleaning made simple, how to use self storage effectively" },
        { property: "og:description", content: "Learn how to declutter room by room, store seasonal items safely, choose the right unit, and keep your home clear with Big Top Self Storage." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/05/BigTopStorage-VideoOne-S8-scaled.png" },
        { property: "article:published_time", content: "2026-03-19T16:39:13+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"Spring cleaning made simple, how to use self storage effectively","description":"Learn how to declutter room by room, store seasonal items safely, choose the right unit, and keep your home clear with Big Top Self Storage.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/05/BigTopStorage-VideoOne-S8-scaled.png","datePublished":"2026-03-19T16:39:13+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/spring-cleaning-made-simple-how-to-use-self-storage-effectively"}),
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
