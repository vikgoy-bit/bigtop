import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/terms-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & conditions — Big Top Self Storage" },
      { name: "description", content: "Big Top Self Storage standard terms and conditions of rental." },
      { property: "og:url", content: "https://bigtop.lovable.app/terms-conditions" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/terms-conditions" }],
  }),
  component: () => (
    <ComingSoonPage title="Terms & conditions" intro="Our terms and conditions are being rebuilt. Email hi@bigtopselfstorage.com for a copy." />
  ),
});
