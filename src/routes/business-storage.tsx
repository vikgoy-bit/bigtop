import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/business-storage")({
  head: () => ({
    meta: [
      { title: "Business storage in Basildon — Big Top Self Storage" },
      { name: "description", content: "Flexible business storage in Basildon — stock, archives, equipment. Open 8am–8pm every day, smart-entry access." },
      { property: "og:url", content: "https://bigtop.lovable.app/business-storage" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/business-storage" }],
  }),
  component: () => (
    <ComingSoonPage
      title="Business storage"
      intro="Stock, archives, equipment, ecommerce inventory. Scale up or down anytime."
    />
  ),
});
