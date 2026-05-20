import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Cookie policy — Big Top Self Storage" },
      { name: "description", content: "How Big Top Self Storage uses cookies and similar technologies." },
      { property: "og:url", content: "https://bigtop.lovable.app/cookie-policy" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/cookie-policy" }],
  }),
  component: () => (
    <ComingSoonPage title="Cookie policy" intro="Our full cookie policy is being rebuilt. Email hi@bigtopselfstorage.com for a copy in the meantime." />
  ),
});
