import { createFileRoute } from "@tanstack/react-router";
import { ComingSoonPage } from "@/components/ComingSoonPage";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Storage offers & discounts — Big Top Self Storage" },
      { name: "description", content: "£1 for the first 6 weeks. 10% off for Blue Light and students. Refer a friend and get 50% off your next bill." },
      { property: "og:url", content: "https://bigtop.lovable.app/offers" },
    ],
    links: [{ rel: "canonical", href: "https://bigtop.lovable.app/offers" }],
  }),
  component: () => (
    <ComingSoonPage
      title="Storage offers"
      intro="Big Top opening offers and discounts — stack the ones you qualify for."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {[
          ["£1 for 6 weeks", "Opening offer — your first six weeks of rental for £1."],
          ["10% Blue Light discount", "After booking, email your details to hi@bigtopselfstorage.com."],
          ["10% Student discount", "After booking, email your details to hi@bigtopselfstorage.com."],
          ["Refer a friend", "Get 50% off your next bill when a friend signs up."],
        ].map(([title, body]) => (
          <li key={title} className="rounded-2xl border bg-card p-6">
            <div className="font-display text-lg font-bold">{title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </ComingSoonPage>
  ),
});
