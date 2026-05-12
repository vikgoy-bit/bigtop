// Server-only Mollie REST client. Do not import from client code.

const MOLLIE_BASE = "https://api.mollie.com/v2";

function getApiKey(): string {
  const mode = (process.env.MOLLIE_MODE || "test").toLowerCase();
  const key =
    mode === "live"
      ? process.env.MOLLIE_API_KEY_LIVE
      : process.env.MOLLIE_API_KEY_TEST;
  if (!key) {
    throw new Error(
      `Mollie API key missing for mode "${mode}". Set MOLLIE_API_KEY_${mode.toUpperCase()}.`,
    );
  }
  return key;
}

async function mollieFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${MOLLIE_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg =
      (json && (json.detail || json.title)) ||
      `Mollie request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}

export type MolliePayment = {
  id: string;
  status: string;
  _links?: { checkout?: { href: string } };
  customerId?: string;
  mandateId?: string;
  metadata?: Record<string, unknown>;
};

export type MollieCustomer = { id: string };
export type MollieSubscription = { id: string; status: string };

export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, unknown>;
}): Promise<MollieCustomer> {
  return mollieFetch<MollieCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function createFirstPayment(params: {
  customerId: string;
  amountValue: string; // e.g. "120.00"
  currency: string;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: Record<string, unknown>;
}): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(
    `/customers/${encodeURIComponent(params.customerId)}/payments`,
    {
      method: "POST",
      body: JSON.stringify({
        amount: { value: params.amountValue, currency: params.currency },
        description: params.description,
        redirectUrl: params.redirectUrl,
        webhookUrl: params.webhookUrl,
        sequenceType: "first",
        metadata: params.metadata,
      }),
    },
  );
}

export async function getPayment(paymentId: string): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(
    `/payments/${encodeURIComponent(paymentId)}`,
  );
}

export async function createSubscription(params: {
  customerId: string;
  amountValue: string;
  currency: string;
  description: string;
  webhookUrl: string;
  startDate?: string; // YYYY-MM-DD
  metadata?: Record<string, unknown>;
}): Promise<MollieSubscription> {
  return mollieFetch<MollieSubscription>(
    `/customers/${encodeURIComponent(params.customerId)}/subscriptions`,
    {
      method: "POST",
      body: JSON.stringify({
        amount: { value: params.amountValue, currency: params.currency },
        interval: "1 month",
        description: params.description,
        webhookUrl: params.webhookUrl,
        startDate: params.startDate,
        metadata: params.metadata,
      }),
    },
  );
}

export function penceToDecimalString(pence: number): string {
  return (pence / 100).toFixed(2);
}
