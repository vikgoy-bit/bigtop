// Server-only Storeganise REST client for booking handoff.
// Storeganise will own recurring billing once the first Mollie payment clears.
//
// API docs live at https://bigtopselfstorage.storeganise.com/api/docs/

const SUBDOMAIN = "bigtopselfstorage";
const SITE_CODE = "ss13-1et";
const BASE = `https://${SUBDOMAIN}.storeganise.com/api/v1`;

function authHeaders(): HeadersInit {
  const key = process.env.STOREGANISE_API_KEY;
  if (!key) throw new Error("STOREGANISE_API_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function sg<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init.headers || {}) },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg =
      (json && (json.message || json.error)) ||
      `Storeganise ${res.status} on ${path}`;
    throw new Error(msg);
  }
  return json as T;
}

let cachedSiteId: string | null = null;
async function getSiteId(): Promise<string> {
  if (cachedSiteId) return cachedSiteId;
  const site = await sg<{ id: string }>(`/sites/${SITE_CODE}`);
  cachedSiteId = site.id;
  return site.id;
}

export type SgUser = { id: string; email?: string };

/**
 * Find an existing Storeganise user by email or create one.
 * Field names follow the Storeganise user schema (email, name, phone).
 */
export async function ensureStoreganiseUser(params: {
  email: string;
  name?: string;
  phone?: string;
}): Promise<SgUser> {
  // Try lookup first
  try {
    const found = await sg<{ users?: SgUser[] }>(
      `/users?email=${encodeURIComponent(params.email)}&limit=1`,
    );
    const existing = found.users?.[0];
    if (existing?.id) return existing;
  } catch {
    // fall through to create
  }

  return sg<SgUser>(`/users`, {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      name: params.name,
      phone: params.phone,
    }),
  });
}

/**
 * Create a unit order (move-in job) in Storeganise. Storeganise then handles
 * subsequent monthly invoicing/charging via its own automation.
 */
export async function createStoreganiseUnitOrder(params: {
  userId: string;
  unitTypeId: string;
  startDate: string; // YYYY-MM-DD
  notes?: string;
  /** Map of Storeganise product id -> quantity (e.g. BIGProtect tier). */
  products?: Record<string, number>;
}): Promise<{ id: string }> {
  const siteId = await getSiteId();
  return sg<{ id: string }>(`/units/orders`, {
    method: "POST",
    body: JSON.stringify({
      userId: params.userId,
      siteId,
      unitTypeId: params.unitTypeId,
      startDate: params.startDate,
      notes: params.notes,
      ...(params.products && Object.keys(params.products).length > 0
        ? { products: params.products }
        : {}),
    }),
  });
}
