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
 * Submit a previously-deferred unit order so Storeganise allocates a specific
 * unit to it. Storeganise requires the e-signature to be stored on the order
 * before the final `submitNow` update when move-in agreements are enabled.
 */
export async function submitStoreganiseUnitOrder(
  orderId: string,
  params: { signatureUrl?: string } = {},
): Promise<{ submitted: boolean; via: string | null; error: string | null }> {
  let lastError = "";
  try {
    if (params.signatureUrl) {
      await sg<Record<string, unknown>>(`/units/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ signatureUrl: params.signatureUrl }),
      });
    }
    await sg<Record<string, unknown>>(`/units/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ submitNow: true }),
    });
    return { submitted: true, via: `/units/orders/${orderId}`, error: null };
  } catch (e) {
    lastError = e instanceof Error ? e.message : String(e);
  }

  for (const path of [`/units/orders/${orderId}/submit`, `/admin/jobs/${orderId}/submit`]) {
    try {
      await sg<Record<string, unknown>>(path, { method: "POST", body: "{}" });
      return { submitted: true, via: path, error: null };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  return { submitted: false, via: null, error: lastError };
}

/** Fetch the public business settings (terms URL, company name, etc.). */
export async function getStoreganiseSettings(): Promise<Record<string, unknown>> {
  return sg<Record<string, unknown>>(`/settings`);
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
export type EnsuredSgUser = SgUser & { password?: string };

function pickArray<T>(value: T[] | { data?: T[]; jobs?: T[]; results?: T[] }): T[] {
  return Array.isArray(value) ? value : (value.jobs ?? value.data ?? value.results ?? []);
}

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
}): Promise<EnsuredSgUser> {
  // Try lookup first
  try {
    const found = await sg<SgUser[] | { data?: SgUser[]; users?: SgUser[] }>(
      `/admin/users?search=${encodeURIComponent(params.email)}&limit=20`,
    );
    const users = Array.isArray(found) ? found : (found.users ?? found.data ?? []);
    const existing = users.find((u) => u.email === params.email) ?? users[0];
    if (existing?.id) {
      return { ...existing, email: params.email };
    }
  } catch {
    // fall through to create
  }

  const { firstName, lastName } = splitName(params.name, params.email);
  const password = createTemporaryPassword();

  const user = await sg<SgUser>(`/admin/users`, {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      firstName,
      lastName,
      phone: params.phone,
      password,
      language: "en",
      isActive: true,
    }),
  });
  return { ...user, email: params.email, password };
}

/**
 * Ensure a Storeganise user + unit order exist for a booking. Idempotent —
 * safe to call from the Mollie webhook AND as a fallback during contract
 * signing if the webhook hasn't run yet (or failed to reach Storeganise).
 *
 * Returns the field updates the caller should persist on the booking row.
 */
export async function ensureStoreganiseOrderForBooking(params: {
  supabaseAdmin: any;
  booking: {
    id: string;
    user_id: string;
    unit_id: string;
    total_pence: number;
    move_in_date: string;
    protect_tier_id: string | null;
    storeganise_user_id: string | null;
    storeganise_order_id: string | null;
  };
  payment?: { id?: string; customerId?: string; mandateId?: string };
}): Promise<{ storeganise_user_id?: string; storeganise_order_id?: string }> {
  const { supabaseAdmin: db, booking, payment } = params;
  if (booking.storeganise_order_id) return {};

  const updates: { storeganise_user_id?: string; storeganise_order_id?: string } = {};

  const { data: userInfo } = await db.auth.admin.getUserById(booking.user_id);
  const email = userInfo?.user?.email;
  if (!email) throw new Error("No email on booking user");

  const { data: profile } = await db
    .from("profiles")
    .select("full_name,phone")
    .eq("id", booking.user_id)
    .maybeSingle();

  let sgUserId = booking.storeganise_user_id;
  if (!sgUserId) {
    const sgUser = await ensureStoreganiseUser({
      email,
      name: profile?.full_name || undefined,
      phone: profile?.phone || undefined,
    });
    sgUserId = sgUser.id;
    updates.storeganise_user_id = sgUserId;
  }

  let sgProductId: string | null = null;
  if (booking.protect_tier_id) {
    const { data: tier } = await db
      .from("protect_tiers")
      .select("storeganise_product_id")
      .eq("id", booking.protect_tier_id)
      .maybeSingle();
    sgProductId = tier?.storeganise_product_id ?? null;
  }

  const paymentDesc = payment?.id
    ? `First payment taken via Mollie (${payment.id}) — £${(booking.total_pence / 100).toFixed(2)} (£1 first-month promo + BIGProtect).`
    : `First payment taken via Mollie — £${(booking.total_pence / 100).toFixed(2)} (£1 first-month promo + BIGProtect).`;

  const order = await createStoreganiseUnitOrder({
    bookingId: booking.id,
    userId: sgUserId!,
    unitTypeId: booking.unit_id,
    startDate: booking.move_in_date,
    products: sgProductId ? { [sgProductId]: 1 } : undefined,
    notes: [
      `Booking ${booking.id}`,
      paymentDesc,
      `Mandate: ${payment?.mandateId ?? "n/a"} (Mollie customer ${payment?.customerId ?? "n/a"}).`,
      `PROMO: First month £1. Apply a manual prorata credit to next month's bill — staff to configure in Storeganise.`,
      `BILLING: Monthly cycle anchored to signup/move-in date (${booking.move_in_date}). Bill full months — do NOT sync to 1st-of-month or any fixed date.`,
      sgProductId
        ? `BIGProtect product ${sgProductId} attached to order.`
        : `No BIGProtect product attached (tier ${booking.protect_tier_id ?? "none"}).`,
    ].join("\n"),
  });
  updates.storeganise_order_id = order.id;
  return updates;
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
  try {
    return await sg<{ id: string }>(`/units/orders`, {
      method: "POST",
      body: JSON.stringify({
        submitLater: true,
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
  } catch (e) {
    if (!(e instanceof Error) || !e.message.toLowerCase().includes("duplicate")) throw e;
    const jobs = await sg<Array<Record<string, any>>>(
      `/admin/jobs?userId=${encodeURIComponent(params.userId)}&limit=100`,
    );
    const existing = jobs.find((job) => {
      const data = job.data ?? {};
      const result = job.result ?? {};
      return (
        job.type === "unit_moveIn" &&
        (data.unitTypeId === params.unitTypeId || result.unitTypeId === params.unitTypeId) &&
        (data.siteId === siteId || result.siteId === siteId) &&
        (data.startDate === params.startDate || result.startDate === params.startDate) &&
        (result.orderState === "notSubmitted" || data.submitLater === true)
      );
    });
    if (typeof existing?.id === "string") return { id: existing.id };
    throw e;
  }
}
