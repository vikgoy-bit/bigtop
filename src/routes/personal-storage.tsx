import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/personal-storage")({
  head: () => ({
    meta: [
      { title: "Personal storage in Basildon — Big Top Self Storage" },
      { name: "description", content: "Personal self storage for moving home, decluttering, or storing seasonal kit. Units from 25 to 150 sq ft, smart-entry access." },
      { property: "og:url", content: "https://bigtop.lovable.app/personal-storage" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/personal-storage" }],
  }),
  component: () => (
    <ComingSoonPage
      title="Personal storage"
      intro="Moving, decluttering or just out of space at home? We've got you covered."
    />
  ),
});
