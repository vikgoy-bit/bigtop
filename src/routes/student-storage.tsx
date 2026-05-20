import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/student-storage")({
  head: () => ({
    meta: [
      { title: "Student storage in Basildon — Big Top Self Storage" },
      { name: "description", content: "Cheap, secure student storage for the summer break. 10% student discount. Smart-entry access — no padlocks." },
      { property: "og:url", content: "https://bigtop.lovable.app/student-storage" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/student-storage" }],
  }),
  component: () => (
    <ComingSoonPage
      title="Student storage"
      intro="Heading home for summer? Store your stuff for less with a 10% student discount."
    />
  ),
});
