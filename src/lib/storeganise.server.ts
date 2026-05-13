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
    Authorization: `ApiKey ${key}`,
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
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { /* non-JSON body */ }
  if (!res.ok) {
    const detail =
      (json && (json.message || json.error || json.errors)) ||
      text.slice(0, 400) ||
      `HTTP ${res.status}`;
    const msg = `Storeganise ${res.status} on ${path}: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`;
    throw new Error(msg);
  }
  return json as T;
}

/** Fetch the full unit order object (includes any agreement/contract fields Storeganise exposes). */
export async function getStoreganiseOrder(orderId: string): Promise<Record<string, unknown>> {
  return sg<Record<string, unknown>>(`/units/orders/${orderId}`);
}

/**
 * Try to attach a signed contract PDF to a unit order. Storeganise's document
 * endpoint isn't publicly documented, so we attempt a couple of best-guess
 * paths and return whichever succeeds. The PDF is also stored in our own
 * bucket regardless of upload outcome so nothing is lost if every endpoint 404s.
 */
export async function uploadSignedContractToStoreganise(params: {
  orderId: string;
  fileName: string;
  pdf: Uint8Array;
}): Promise<{ uploaded: boolean; via: string | null; error: string | null }> {
  const key = process.env.STOREGANISE_API_KEY;
  if (!key) return { uploaded: false, via: null, error: "STOREGANISE_API_KEY not set" };

  const candidates = [
    `/units/orders/${params.orderId}/files`,
    `/units/orders/${params.orderId}/documents`,
    `/units/orders/${params.orderId}/attachments`,
  ];

  let lastError = "";
  for (const path of candidates) {
    try {
      const form = new FormData();
      const buf = params.pdf.buffer.slice(
        params.pdf.byteOffset,
        params.pdf.byteOffset + params.pdf.byteLength,
      ) as ArrayBuffer;
      form.append(
        "file",
        new Blob([buf], { type: "application/pdf" }),
        params.fileName,
      );
      form.append("name", params.fileName);
      form.append("type", "agreement");
      const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: { Authorization: `ApiKey ${key}`, Accept: "application/json" },
        body: form,
      });
      if (res.ok) return { uploaded: true, via: path, error: null };
      lastError = `${res.status} on ${path}: ${(await res.text()).slice(0, 200)}`;
    } catch (e) {
      lastError = `${path}: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return { uploaded: false, via: null, error: lastError };
}

let cachedSiteId: string | null = null;
async function getSiteId(): Promise<string> {
  if (cachedSiteId) return cachedSiteId;
  const site = await sg<{ id: string }>(`/sites/${SITE_CODE}`);
  cachedSiteId = site.id;
  return site.id;
}

export type SgUser = { id: string; email?: string };

function splitName(name: string | undefined, email: string) {
  const fallback = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Customer";
  const parts = (name?.trim() || fallback).split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Customer";
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}

function createTemporaryPassword() {
  return `Bt!${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}aA1`;
}

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
    const found = await sg<SgUser[] | { data?: SgUser[]; users?: SgUser[] }>(
      `/admin/users?search=${encodeURIComponent(params.email)}&limit=20`,
    );
    const users = Array.isArray(found) ? found : (found.users ?? found.data ?? []);
    const existing = users.find((u) => u.email === params.email) ?? users[0];
    if (existing?.id) return existing;
  } catch {
    // fall through to create
  }

  const { firstName, lastName } = splitName(params.name, params.email);

  return sg<SgUser>(`/admin/users`, {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      firstName,
      lastName,
      phone: params.phone,
      password: createTemporaryPassword(),
      language: "en",
      isActive: true,
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
      submitLater: true,
      notes: params.notes,
      ...(params.products && Object.keys(params.products).length > 0
        ? { products: params.products }
        : {}),
    }),
  });
}
