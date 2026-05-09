import { createServerFn } from "@tanstack/react-start";

const SUBDOMAIN = "bigtopselfstorage";
const SITE_CODE = "ss13-1et";
const BASE = `https://${SUBDOMAIN}.storeganise.com/api/v1`;

export type StoreganiseUnit = {
  id: string;
  groupCode: "small" | "medium" | "large" | string;
  groupTitle: string;
  title: string;
  size_sqft: number;
  monthly_price_pence: number;
  weekly_price_pence: number;
  available: number;
  total: number;
  features: string[];
  offer_label: string | null;
  image: string | null;
};

type RawSite = {
  id: string;
  title: { en?: string };
  address: { en?: string };
  phone?: string;
  email?: string;
  hours?: { en?: string };
  unitTypeGroups: Array<{ id: string; code: string; title: { en?: string }; order: number }>;
  unitTypes: Array<{
    id: string;
    groupId: string;
    code: string;
    title: { en?: string };
    subtitle?: { en?: string };
    price: number; // weekly £
    image?: string;
    availability?: { available: number; total: number };
    order: number;
    annotations?: Array<{ type: string; text?: { en?: string }; position?: string; color?: string }>;
  }>;
};

export const getStoreganiseUnits = createServerFn({ method: "GET" }).handler(async () => {
  const res = await fetch(`${BASE}/sites/${SITE_CODE}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    return { units: [] as StoreganiseUnit[], error: `Storeganise error ${res.status}` };
  }
  const site = (await res.json()) as RawSite;

  const groupById = new Map(site.unitTypeGroups.map((g) => [g.id, g]));

  const units: StoreganiseUnit[] = site.unitTypes
    .map((u) => {
      const group = groupById.get(u.groupId);
      const groupCode = (group?.code ?? "small").toLowerCase();
      const sqft = parseInt(u.code.replace(/\D/g, ""), 10) || 0;
      const monthlyPounds = u.price ?? 0;
      const weeklyPence = Math.round((monthlyPounds * 100) / 4.333);
      const offer =
        u.annotations?.find((a) => a.type === "text")?.text?.en?.replace(/\*\*/g, "").trim() ?? null;
      const subtitle = u.subtitle?.en ?? "";
      const features = subtitle
        .split("||")
        .map((s) => s.trim())
        .filter(Boolean);

      return {
        id: u.id,
        groupCode,
        groupTitle: group?.title?.en ?? "",
        title: u.title?.en ?? `${sqft} sq ft`,
        size_sqft: sqft,
        monthly_price_pence: monthlyPounds * 100,
        weekly_price_pence: Math.round(weeklyPounds * 100),
        available: u.availability?.available ?? 0,
        total: u.availability?.total ?? 0,
        features,
        offer_label: offer && offer.length < 60 ? offer : null,
        image: u.image ?? null,
      };
    })
    .sort((a, b) => a.size_sqft - b.size_sqft);

  return { units, error: null as string | null };
});
