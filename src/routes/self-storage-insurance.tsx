import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/self-storage-insurance")({
  head: () => ({
    meta: [
      { title: "Self storage insurance — Big Top Self Storage" },
      { name: "description", content: "Big Protect storage insurance — add cover at checkout in a single click. No separate paperwork." },
      { property: "og:url", content: "https://bigtop.lovable.app/self-storage-insurance" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/self-storage-insurance" }],
  }),
  component: () => (
    <ComingSoonPage
      title="Self storage insurance"
      intro="Add Big Protect cover at checkout — no separate forms, no follow-up emails."
    />
  ),
});
