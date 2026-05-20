import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy policy — Big Top Self Storage" },
      { name: "description", content: "How Big Top Self Storage collects, uses and protects your personal information." },
      { property: "og:url", content: "https://bigtop.lovable.app/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/privacy-policy" }],
  }),
  component: () => (
    <ComingSoonPage title="Privacy policy" intro="Our full privacy policy is being rebuilt. Email hi@bigtopselfstorage.com for a copy in the meantime." />
  ),
});
