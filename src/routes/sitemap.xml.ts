import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://bigtop.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap/xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.8" },
          { path: "/how-self-storage-works", changefreq: "monthly", priority: "1.0" },
          { path: "/smart-entry", changefreq: "monthly", priority: "0.9" },
          { path: "/offers", changefreq: "weekly", priority: "0.9" },
          { path: "/personal-storage", changefreq: "weekly", priority: "1.0" },
          { path: "/business-storage", changefreq: "weekly", priority: "1.0" },
          { path: "/student-storage", changefreq: "weekly", priority: "1.0" },
          { path: "/self-storage-insurance", changefreq: "monthly", priority: "0.8" },
          { path: "/boxes-and-packaging", changefreq: "monthly", priority: "0.8" },
          { path: "/get-a-quote", changefreq: "weekly", priority: "1.0" },
          { path: "/contact-us", changefreq: "monthly", priority: "0.7" },
          { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
          { path: "/cookie-policy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms-conditions", changefreq: "yearly", priority: "0.3" },
          { path: "/book/details", changefreq: "weekly", priority: "0.9" },
          { path: "/login", changefreq: "yearly", priority: "0.5" },
          { path: "/signup", changefreq: "yearly", priority: "0.5" },
          { path: "/forgot-password", changefreq: "yearly", priority: "1.0" },
          { path: "/reset-password", changefreq: "yearly", priority: "0.1" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
