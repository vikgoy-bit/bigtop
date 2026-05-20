import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/boxes-and-packaging")({
  head: () => ({
    meta: [
      { title: "Boxes & packaging — Big Top Self Storage Basildon" },
      { name: "description", content: "Buy moving boxes, tape, bubble wrap and packaging supplies on site at Big Top Self Storage Basildon." },
      { property: "og:url", content: "https://bigtop.lovable.app/boxes-and-packaging" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/boxes-and-packaging" }],
  }),
  component: () => (
    <ComingSoonPage
      title="Boxes & packaging"
      intro="Pick up moving boxes, tape and bubble wrap on site — no need to go anywhere else."
    />
  ),
});
