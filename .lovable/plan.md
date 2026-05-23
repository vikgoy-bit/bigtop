# Pre-allocate unit number on payment page

## Goal
By the time the customer reaches the contract page, the Storeganise unit number is already assigned — no waiting, no "Allocating…" message.

## Today's flow (slow)
1. **Details** → booking row created
2. **Payment** → Mollie checkout
3. **Mollie webhook** → creates Storeganise order (first chance)
4. **Contract** → fallback creates order if webhook hasn't fired yet, then polls Storeganise up to ~12s for a unit number
5. **Verify**

The order creation + unit allocation only starts at step 3 or 4, so the customer waits on the contract page.

## Proposed flow
1. **Details** → booking created
2. **Payment page mount** → fire-and-forget call to a new server fn `prepareStoreganiseOrder(bookingId)` that runs `ensureStoreganiseOrderForBooking`. The user spends 30s–2min on Mollie checkout while this completes in the background.
3. **Mollie webhook** → still calls `ensureStoreganiseOrderForBooking` (idempotent — no-op if already created)
4. **Contract page** → order already exists, `refreshUnitSnapshot` returns the unit on the first call. Existing 1.5s client poll handles the rare edge case.
5. **Verify**

## Changes

### `src/lib/contract.functions.ts` (or new `src/lib/booking-prep.functions.ts`)
Add a thin server fn:
```ts
export const prepareStoreganiseOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ bookingId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    // Load booking (RLS scoped), call ensureStoreganiseOrderForBooking,
    // persist storeganise_order_id / storeganise_user_id.
    // Return { ok: true } — never throws to the client; logs errors.
  });
```
Idempotent: if `storeganise_order_id` is already set, return immediately.

### `src/routes/_authenticated/book/payment.tsx`
On mount (when `bookingId` is known), fire the server fn once. No await blocking the UI, no toast on failure — pure background warm-up. The existing contract-page fallback still handles the case where this call fails.

```ts
const prepare = useServerFn(prepareStoreganiseOrder);
useEffect(() => {
  if (!bookingId) return;
  prepare({ data: { bookingId } }).catch(() => { /* silent */ });
}, [bookingId]);
```

### `src/lib/contract.functions.ts`
No logic change needed — `ensureStoreganiseOrderForBooking` is already idempotent. The contract-page server fn becomes a fast read in the common case.

## Edge cases
- **User abandons payment page before Storeganise call finishes** — webhook still creates the order after payment. No regression.
- **Storeganise is down at payment-page mount** — silent fail, contract page falls back to today's behaviour.
- **User refreshes payment page** — second call is a no-op (order already exists).
- **User pays very fast** (<5s) — webhook may race the payment-page call. Both are idempotent and guarded by the `storeganise_order_id` check.

## Out of scope
- Submitting the order (`submitStoreganiseUnitOrder`) stays on contract sign — that's tied to the signed contract upload.
- No DB schema changes.
