import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type FoundAddress = {
  line_1: string;
  line_2: string;
  line_3: string;
  line_4: string;
  locality: string;
  town_or_city: string;
  county: string;
  formatted: string;
};

export const lookupAddresses = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      postcode: z
        .string()
        .min(2)
        .max(10)
        .regex(/^[A-Za-z0-9 ]+$/, "Invalid postcode"),
    }).parse,
  )
  .handler(
    async ({ data }): Promise<{
      addresses: FoundAddress[];
      postcode: string;
      error: string | null;
    }> => {
      const apiKey = process.env.GETADDRESS_API_KEY;
      if (!apiKey) {
        return { addresses: [], postcode: "", error: "Address lookup is not configured" };
      }

      const pc = data.postcode.trim().toUpperCase().replace(/\s+/g, "");
      const url = `https://api.getAddress.io/find/${encodeURIComponent(pc)}?api-key=${encodeURIComponent(
        apiKey,
      )}&expand=true&sort=true`;

      try {
        const res = await fetch(url);
        if (res.status === 404) {
          return { addresses: [], postcode: pc, error: "No addresses found for that postcode" };
        }
        if (res.status === 401 || res.status === 403) {
          return { addresses: [], postcode: pc, error: "Address lookup unauthorised — check API key" };
        }
        if (res.status === 429) {
          return { addresses: [], postcode: pc, error: "Address lookup quota exceeded — please try again later" };
        }
        if (!res.ok) {
          return { addresses: [], postcode: pc, error: `Address lookup failed (${res.status})` };
        }

        const json = (await res.json()) as {
          postcode?: string;
          addresses?: Array<{
            line_1?: string;
            line_2?: string;
            line_3?: string;
            line_4?: string;
            locality?: string;
            town_or_city?: string;
            county?: string;
            formatted_address?: string[];
          }>;
        };

        const addresses: FoundAddress[] = (json.addresses ?? []).map((a) => {
          const formatted = (a.formatted_address ?? [])
            .filter((p) => p && p.trim().length > 0)
            .join(", ");
          return {
            line_1: a.line_1 ?? "",
            line_2: a.line_2 ?? "",
            line_3: a.line_3 ?? "",
            line_4: a.line_4 ?? "",
            locality: a.locality ?? "",
            town_or_city: a.town_or_city ?? "",
            county: a.county ?? "",
            formatted: formatted || [a.line_1, a.town_or_city].filter(Boolean).join(", "),
          };
        });

        return {
          addresses,
          postcode: json.postcode ?? pc,
          error: null,
        };
      } catch {
        return { addresses: [], postcode: pc, error: "Address lookup failed — network error" };
      }
    },
  );
