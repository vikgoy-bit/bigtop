// Server-only Storeganise REST client for booking handoff.
// Storeganise will own recurring billing once the first Mollie payment clears.
//
// API docs live at https://bigtopselfstorage.storeganise.com/api/docs/
//
// When BOOKING_MODE=test we route to Storeganise's demo tenant
// (big-top-storage-trial) using STOREGANISE_API_KEY_TEST so we can exercise
// the move-in flow end-to-end without touching the live account.

import { isBookingTestMode } from "./booking-mode.server";

const LIVE_SUBDOMAIN = "bigtopselfstorage";
const TEST_SUBDOMAIN = "big-top-storage-trial";
const SITE_CODE = "ss13-1et"; // same site code in both tenants per Storeganise

function getSubdomain(): string {
  // Unit quotes are loaded from the live Storeganise site, so order creation
  // must use the same tenant or Storeganise rejects the live unitTypeId.
  return LIVE_SUBDOMAIN;
}

function getBase(): string {
  return `https://${getSubdomain()}.storeganise.com/api/v1`;
}

function getApiKey(): string {
  const key = process.env.STOREGANISE_API_KEY;
  if (!key) {
    throw new Error("STOREGANISE_API_KEY is not set");
  }
  return key;
}

function authHeaders(): HeadersInit {
  return {
    Authorization: `ApiKey ${getApiKey()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function sg<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${getBase()}${path}`, {
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
 * Set the Stripe identity verification session id on a Storeganise user's
 * `identity_session` custom field. Storeganise's move-in workflow blocks at
 * `await_verifyIdentity` until this field is populated — once set, Storeganise
 * polls Stripe and progresses the unit from Reserved to Active automatically.
 *
 * Tries a few shapes since Storeganise accepts custom fields under either
 * `customFields` or `data.customFields` depending on account configuration.
 */
export async function setStoreganiseUserIdentitySession(
  userId: string,
  verificationSessionId: string,
): Promise<{ ok: boolean; via: string | null; error: string | null }> {
  const value = verificationSessionId;
  // Confirmed via API probing: the only shape accepted by /admin/users/{id}
  // PUT for custom fields is `{ data: { customFields: { <field>: value } } }`.
  // Everything else returns 400 "You do not have permission to update: customFields".
  const bodies: Array<Record<string, unknown>> = [
    { data: { customFields: { identity_session: value } } },
    { data: { customFields: { identitySession: value } } },
  ];
  let lastError = "";
  for (const body of bodies) {
    try {
      await sg<Record<string, unknown>>(`/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      return { ok: true, via: Object.keys((body as any).data.customFields).join(","), error: null };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  return { ok: false, via: null, error: lastError };
}

/**
 * Read the `ownerId` (the Storeganise user the move-in job is attached to —
 * the user whose `identity_session` custom field Storeganise polls to clear
 * the `await_verifyIdentity` step). Returns null if the order can't be loaded.
 */
export async function getStoreganiseOrderOwnerId(orderId: string): Promise<string | null> {
  try {
    const order = await sg<{ ownerId?: string; result?: { ownerId?: string } }>(
      `/units/orders/${orderId}`,
    );
    return order.ownerId ?? order.result?.ownerId ?? null;
  } catch (e) {
    console.error("getStoreganiseOrderOwnerId failed:", e);
    return null;
  }
}

/**
 * Belt-and-braces: write `identity_session` to BOTH the booking's recorded
 * Storeganise user AND the order's actual `ownerId` (in case the order was
 * created with a different owner — e.g. legacy bookings owned by the API
 * service user). Returns ok if either write succeeded.
 */
export async function setIdentitySessionForOrder(params: {
  orderId: string | null;
  bookingUserId: string | null;
  verificationSessionId: string;
}): Promise<{
  ok: boolean;
  bookingUserResult: { ok: boolean; error: string | null } | null;
  orderOwnerResult: { ok: boolean; error: string | null; ownerId: string | null } | null;
}> {
  const { orderId, bookingUserId, verificationSessionId } = params;

  let bookingUserResult: { ok: boolean; error: string | null } | null = null;
  if (bookingUserId) {
    const r = await setStoreganiseUserIdentitySession(bookingUserId, verificationSessionId);
    bookingUserResult = { ok: r.ok, error: r.error };
  }

  let orderOwnerResult: { ok: boolean; error: string | null; ownerId: string | null } | null = null;
  if (orderId) {
    const ownerId = await getStoreganiseOrderOwnerId(orderId);
    if (ownerId && ownerId !== bookingUserId) {
      const r = await setStoreganiseUserIdentitySession(ownerId, verificationSessionId);
      orderOwnerResult = { ok: r.ok, error: r.error, ownerId };
    } else {
      orderOwnerResult = { ok: !!bookingUserResult?.ok, error: null, ownerId };
    }
  }

  const ok = !!(bookingUserResult?.ok || orderOwnerResult?.ok);
  return { ok, bookingUserResult, orderOwnerResult };
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

/**
 * Tell Storeganise to skip the current step on a unit_moveIn job — used when
 * Stripe Identity rejects a customer but we still want the booking to flow
 * through (admin will follow up manually). Mirrors clicking the "Skip" button
 * in the Storeganise admin UI on the `await_verifyIdentity` step.
 *
 * Tries several likely endpoint shapes since Storeganise's admin job actions
 * aren't fully documented publicly.
 */
export async function skipStoreganiseUnitOrderStep(
  orderId: string,
  reason?: string,
): Promise<{ skipped: boolean; via: string | null; error: string | null }> {
  const note =
    reason ?? "Stripe Identity verification failed — manual follow-up required.";

  // PRIMARY (documented): find the active step on the move-in job and PUT
  // /admin/jobs/{jobId}/steps/{stepId} {state:"skipped"}. Works on any
  // skippable step including `generateAgreement` and `await_verifyIdentity`.
  try {
    const job = await sg<{ steps?: Array<{ id?: string; state?: string; type?: string }> }>(
      `/admin/jobs/${orderId}?fields=steps`,
    );
    const activeStep = (job.steps ?? []).find(
      (s) => s.state === "ready" || s.state === "active" || s.state === "pending",
    );
    if (activeStep?.id) {
      await sg<Record<string, unknown>>(
        `/admin/jobs/${orderId}/steps/${activeStep.id}`,
        { method: "PUT", body: JSON.stringify({ state: "skipped", reason: note }) },
      );
      return {
        skipped: true,
        via: `PUT /admin/jobs/${orderId}/steps/${activeStep.id} (${activeStep.type ?? "?"})`,
        error: null,
      };
    }
  } catch (e) {
    console.error(
      "Documented step-skip path failed, falling back to legacy shotgun:",
      e instanceof Error ? e.message : e,
    );
  }

  // FALLBACK: undocumented endpoints — kept in case the documented path
  // 404s on certain account configurations.
  const attempts: Array<{ path: string; method: "POST" | "PUT"; body: string }> = [
    { path: `/admin/jobs/${orderId}/skip`, method: "POST", body: JSON.stringify({ reason: note }) },
    { path: `/admin/jobs/${orderId}/skip`, method: "POST", body: "{}" },
    { path: `/admin/jobs/${orderId}/skipStep`, method: "POST", body: JSON.stringify({ reason: note }) },
    { path: `/units/orders/${orderId}/skip`, method: "POST", body: JSON.stringify({ reason: note }) },
    { path: `/units/orders/${orderId}/skip`, method: "POST", body: "{}" },
    { path: `/admin/jobs/${orderId}`, method: "PUT", body: JSON.stringify({ skipStep: true, skipReason: note }) },
    { path: `/units/orders/${orderId}`, method: "PUT", body: JSON.stringify({ skipStep: true, skipReason: note }) },
  ];

  let lastError = "";
  for (const a of attempts) {
    try {
      await sg<Record<string, unknown>>(a.path, { method: a.method, body: a.body });
      return { skipped: true, via: `${a.method} ${a.path}`, error: null };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  return { skipped: false, via: null, error: lastError };
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
  let key: string;
  try { key = getApiKey(); } catch (e) {
    return { uploaded: false, via: null, error: e instanceof Error ? e.message : String(e) };
  }

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
      const res = await fetch(`${getBase()}${path}`, {
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

async function authenticateStoreganiseUser(email: string, password: string): Promise<string | null> {
  const token = Buffer.from(`${email}:${password}`).toString("base64");
  try {
    const res = await fetch(`${getBase()}/auth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { accessToken?: string };
    return json.accessToken ?? null;
  } catch {
    return null;
  }
}

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

type SgAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  postCode?: string;
  country?: string;
};

/**
 * Storeganise's `user.address` field is a single STRING (verified via API
 * probe: object shape returns "address must be string" at top level, and
 * silently no-ops inside the `data` envelope — which is why generateAgreement
 * kept crashing on null.address even after our PUT returned 200).
 *
 * Format: "line1, line2, city, postCode, country" (skip empty parts).
 */
function formatSgAddress(addr: SgAddress | undefined): string | undefined {
  if (!addr) return undefined;
  const parts = [addr.line1, addr.line2, addr.city, addr.postCode, addr.country]
    .map((p) => (p ?? "").trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

/**
 * Find an existing Storeganise user by email or create one.
 * Field names follow the Storeganise user schema (email, name, phone, address).
 *
 * Storeganise's `generateAgreement` move-in step reads `user.address` and
 * crashes with `Cannot read properties of null (reading 'address')` if the
 * customer has no address. We always send one when we have profile data, and
 * patch existing users with PUT when their address is missing.
 */
export async function ensureStoreganiseUser(params: {
  email: string;
  name?: string;
  phone?: string;
  address?: SgAddress;
}): Promise<EnsuredSgUser> {
  const addressString = formatSgAddress(params.address);

  // Try lookup first
  try {
    const found = await sg<SgUser[] | { data?: SgUser[]; users?: SgUser[] }>(
      `/admin/users?search=${encodeURIComponent(params.email)}&limit=20`,
    );
    const users = Array.isArray(found) ? found : (found.users ?? found.data ?? []);
    const existing = users.find((u) => u.email === params.email) ?? users[0];
    if (existing?.id) {
      // Patch missing address on existing users so generateAgreement can run.
      if (addressString) {
        try {
          await sg<Record<string, unknown>>(`/admin/users/${existing.id}`, {
            method: "PUT",
            body: JSON.stringify({ data: { address: addressString } }),
          });
        } catch (e) {
          console.error(
            `Storeganise address patch failed for user ${existing.id}:`,
            e instanceof Error ? e.message : e,
          );
        }
      }
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
      ...(addressString ? { address: addressString } : {}),
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
    unit_snapshot?: Record<string, any> | null;
  };
  payment?: { id?: string; customerId?: string; mandateId?: string };
}): Promise<{ storeganise_user_id?: string; storeganise_order_id?: string; unit_snapshot?: Record<string, any> }> {
  const { supabaseAdmin: db, booking, payment } = params;
  if (booking.storeganise_order_id) return {};

  const updates: { storeganise_user_id?: string; storeganise_order_id?: string; unit_snapshot?: Record<string, any> } = {};

  const { data: userInfo } = await db.auth.admin.getUserById(booking.user_id);
  const email = userInfo?.user?.email;
  if (!email) throw new Error("No email on booking user");

  const { data: profile } = await db
    .from("profiles")
    .select("full_name,phone,address_line1,address_line2,city,postcode")
    .eq("id", booking.user_id)
    .maybeSingle();

  const sgAddress: SgAddress | undefined =
    profile?.address_line1 || profile?.city || profile?.postcode
      ? {
          line1: profile.address_line1 ?? "",
          line2: profile.address_line2 ?? "",
          city: profile.city ?? "",
          postCode: profile.postcode ?? "",
          country: "GB",
        }
      : undefined;

  let sgUserId = booking.storeganise_user_id;
  let sgUserAccessToken: string | null = null;
  if (!sgUserId) {
    const sgUser = await ensureStoreganiseUser({
      email,
      name: profile?.full_name || undefined,
      phone: profile?.phone || undefined,
      address: sgAddress,
    });
    sgUserId = sgUser.id;
    updates.storeganise_user_id = sgUserId;
    if (sgUser.password) {
      sgUserAccessToken = await authenticateStoreganiseUser(email, sgUser.password);
    }
  } else {
    const addressString = formatSgAddress(sgAddress);
    if (addressString) {
      // Booking already has a Storeganise user linked — make sure their address
      // is set so generateAgreement doesn't crash on `null.address`.
      try {
        await sg<Record<string, unknown>>(`/admin/users/${sgUserId}`, {
          method: "PUT",
          body: JSON.stringify({ data: { address: addressString } }),
        });
      } catch (e) {
        console.error(
          `Storeganise address patch failed for existing user ${sgUserId}:`,
          e instanceof Error ? e.message : e,
        );
      }
    }
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
    userAccessToken: sgUserAccessToken,
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
  if (order.assignedUnit?.name) {
    updates.unit_snapshot = {
      ...(booking.unit_snapshot ?? {}),
      id: order.assignedUnit.id,
      name: order.assignedUnit.name.toUpperCase(),
    };
  }
  return updates;
}

/**
 * Create a unit order (move-in job) in Storeganise. Storeganise then handles
 * subsequent monthly invoicing/charging via its own automation.
 */
export async function createStoreganiseUnitOrder(params: {
  bookingId?: string;
  userId: string;
  userAccessToken?: string | null;
  unitTypeId: string;
  startDate: string; // YYYY-MM-DD
  notes?: string;
  /** Map of Storeganise product id -> quantity (e.g. BIGProtect tier). */
  products?: Record<string, number>;
}): Promise<{ id: string; assignedUnit?: { id: string; name: string } }> {
  const siteId = await getSiteId();
  const unitCandidates = await sg<Array<{ id: string; name?: string; typeId?: string }>>(
    `/admin/units?typeId=${encodeURIComponent(params.unitTypeId)}&limit=50`,
  ).then((units) => units.filter((unit) => unit.typeId === params.unitTypeId && unit.name)).catch(() => []);
  const findExistingOrder = async (opts?: { loose?: boolean }) => {
    const loose = opts?.loose === true;
    const jobs = pickArray(
      await sg<Array<Record<string, any>> | { data?: Record<string, any>[]; jobs?: Record<string, any>[]; results?: Record<string, any>[] }>(
        `/admin/jobs?ownerId=${encodeURIComponent(params.userId)}&limit=100`,
      ),
    );
    const existing = jobs.find((job) => {
      if (job.type !== "unit_moveIn") return false;
      const data = job.data ?? {};
      const result = job.result ?? {};
      const notes = `${data.notes ?? ""}\n${result.notes ?? ""}`;
      const bookingMatches = params.bookingId ? notes.includes(params.bookingId) : false;
      const detailsMatch =
        (data.unitTypeId === params.unitTypeId || result.unitTypeId === params.unitTypeId) &&
        (data.siteId === siteId || result.siteId === siteId) &&
        (data.startDate === params.startDate || result.startDate === params.startDate);
      const isUnsubmitted = result.orderState === "notSubmitted" || (data.submitLater === true && !data.submitNow);
      if (bookingMatches) return true;
      if (detailsMatch && isUnsubmitted) return true;
      // Loose match (used after Storeganise rejects as duplicate): any unit_moveIn
      // for same user+site+unitType counts, regardless of submission state.
      if (loose) {
        return (
          (data.unitTypeId === params.unitTypeId || result.unitTypeId === params.unitTypeId) &&
          (data.siteId === siteId || result.siteId === siteId)
        );
      }
      return false;
    });
    return typeof existing?.id === "string" ? { id: existing.id } : null;
  };

  const existing = await findExistingOrder();
  if (existing) return existing;

  if (params.userAccessToken) {
    try {
      return await sg<{ id: string }>(`/units/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${params.userAccessToken}` },
        body: JSON.stringify({
          submitLater: true,
          siteId,
          unitTypeId: params.unitTypeId,
          startDate: params.startDate,
          notes: params.notes,
          ...(params.products && Object.keys(params.products).length > 0
            ? { products: params.products }
            : {}),
        }),
      });
    } catch (customerOrderError) {
      console.error(
        "Storeganise customer order create failed; falling back to admin /units/orders:",
        customerOrderError,
      );
    }
  }

  // PRIMARY admin path: POST /units/orders with `userId` at the top level.
  // This returns a real unit-order id (works with GET/PUT /units/orders/{id}
  // for submit, verify, and identity_session writes). Storeganise sets the
  // order's owner from the top-level `userId` when called with admin auth.
  //
  // We previously tried POST /admin/jobs first, but it returns the JOB id
  // (not the order id) — every subsequent /units/orders/{id} call 404'd,
  // breaking submitNow and leaving the order stuck at "Wait for order
  // submission" in the Storeganise UI.
  try {
    const created = await sg<{ id: string; ownerId?: string }>(`/units/orders`, {
      method: "POST",
      body: JSON.stringify({
        submitLater: true,
        // Send BOTH field names — Storeganise's admin `/units/orders` endpoint
        // expects `ownerId` (matches `POST /unit-rentals` in their write API
        // reference); customer-side it derives owner from the bearer token and
        // accepts `userId`. Sending both makes the assignment unambiguous so
        // the resulting move-in job is actually owned by the customer (without
        // this, generateAgreement crashes on `null.address` because the order
        // has no user attached at all).
        ownerId: params.userId,
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

    // Verify the order actually has the right owner. If Storeganise silently
    // dropped both fields we MUST patch it now — otherwise the entire move-in
    // workflow (generateAgreement, signAgreement, identity, invoice) runs
    // against a null user and every step error-alerts.
    try {
      const verify = await sg<{ ownerId?: string }>(`/units/orders/${created.id}`);
      if (!verify.ownerId || verify.ownerId !== params.userId) {
        console.error(
          `Storeganise order ${created.id} created with ownerId=${verify.ownerId ?? "null"}, expected ${params.userId}. Patching…`,
        );
        try {
          await sg<Record<string, unknown>>(`/units/orders/${created.id}`, {
            method: "PUT",
            body: JSON.stringify({ ownerId: params.userId, userId: params.userId }),
          });
        } catch (patchError) {
          console.error(
            `Storeganise owner patch failed for order ${created.id}:`,
            patchError instanceof Error ? patchError.message : patchError,
          );
        }
      }
    } catch (verifyError) {
      console.error("Storeganise order verify-after-create failed:", verifyError);
    }

    return { id: created.id };
  } catch (e) {
    if (e instanceof Error && /duplicate|too many/i.test(e.message)) {
      const retryExisting =
        (await findExistingOrder()) ?? (await findExistingOrder({ loose: true }));
      if (retryExisting) {
        console.warn(
          `Storeganise rejected /units/orders as duplicate; reusing existing job ${retryExisting.id} for user ${params.userId}.`,
        );
        return retryExisting;
      }
    }
    throw e;
  }
}
