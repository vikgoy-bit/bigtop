import { createFileRoute } from "@tanstack/react-router";
import { BlogPostLayout } from "@/components/BlogPostLayout";
import { getPost } from "@/data/blogPosts";

const SLUG = "10-common-mistakes-people-make-when-using-storage-units";
const URL = "https://bigtop.lovable.app/10-common-mistakes-people-make-when-using-storage-units";

export const Route = createFileRoute("/10-common-mistakes-people-make-when-using-storage-units")({
  head: () => {
    const post = getPost(SLUG)!;
    return {
      meta: [
        { title: "10 common mistakes people make when using storage units — Big Top Self Storage" },
        { name: "description", content: "Avoid the most common storage unit mistakes with these expert tips. Learn how to pack, protect and organise your unit properly." },
        { property: "og:title", content: "10 common mistakes people make when using storage units" },
        { property: "og:description", content: "Avoid the most common storage unit mistakes with these expert tips. Learn how to pack, protect and organise your unit properly." },
        { property: "og:url", content: URL },
        { property: "og:type", content: "article" },
        { property: "og:image", content: "https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoTwo-S3-scaled.png" },
        { property: "article:published_time", content: "2026-04-09T15:43:47+00:00" },
      ],
      links: [{ rel: "canonical", href: URL }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":"10 common mistakes people make when using storage units","description":"Avoid the most common storage unit mistakes with these expert tips. Learn how to pack, protect and organise your unit properly.","image":"https://www.bigtopselfstorage.com/wp-content/uploads/2025/11/BigTopStorage-VideoTwo-S3-scaled.png","datePublished":"2026-04-09T15:43:47+00:00","author":{"@type":"Organization","name":"Big Top Self Storage"},"publisher":{"@type":"Organization","name":"Big Top Self Storage"},"mainEntityOfPage":"https://bigtop.lovable.app/10-common-mistakes-people-make-when-using-storage-units"}),
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
