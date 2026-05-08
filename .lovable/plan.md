## Goal
Rebuild the Basildon site booking flow at `/` as a streamlined 4-step wizard, skipping the location-picker page. Customers go straight from landing on the site into picking a unit, then complete details (with move-in date and BIGProtect cover), payment, ID verification, and a success page.

## Flow

```text
Step 1: Select unit  →  Step 2: Your details + move-in date + BIGProtect
                                    ↓
Step 4: Success  ←  Step 3b: Stripe ID Verification  ←  Step 3a: Payment method
```

Account is required: customer must log in or sign up before reaching Step 2 (login wall sits between Step 1 and Step 2).

## Pages / routes

- `/` — Step 1: **Select your unit** (Basildon site header + unit list with size tabs: All / Small / Medium / Large). Each unit card shows size, features, weekly + monthly price, opening offer badge, "Select unit" button.
- `/login` and `/signup` — auth pages (email/password + Google).
- `/book/details` — Step 2: contact details form + move-in date picker + BIGProtect goods value selector (radio options that each map to a monthly fee, e.g. £0 / £2,000 / £5,000 / £10,000 cover tiers; selection adds a line item to the booking total).
- `/book/payment` — Step 3a: Stripe payment method capture (card via Stripe Elements / Checkout) for first month + BIGProtect.
- `/book/verify` — Step 3b: Stripe Identity verification session (redirect to Stripe-hosted flow, return URL back here to confirm `verified`).
- `/book/success` — Step 4: confirmation with booking reference, unit, move-in date, total charged, next steps.

A persistent **stepper** (Unit → Details → Payment → Verify) sits at the top of every booking step with the current step highlighted and completed steps checkmarked.

## Visual redesign (Step 1 focus)

The current page feels dated. New look:
- Bold editorial header for the Basildon site: large location name, address, hours, phone in a clean info strip (no big banner image dominating the viewport).
- Unit list as a tight grid of cards with strong typography, clear price hierarchy (big monthly price, weekly price as secondary), and a coloured "Opening offer — £1 for 6 weeks" ribbon.
- Sticky size-filter pill bar (All / Small / Medium / Large) under the header.
- Mobile: single-column cards, sticky filter, sticky "Select" CTA per card.
- Design tokens defined in `src/styles.css` using oklch — primary brand red/blue from Big Top palette, neutral surfaces, one accent for offers.

## Data model (Lovable Cloud)

Tables:
- `units` — id, name, size_sqft, size_group (small/medium/large), monthly_price_pence, weekly_price_pence, vat_rate, features[], image_url, offer_label, available.
- `protect_tiers` — id, label (e.g. "Up to £2,000"), cover_value_pence, monthly_fee_pence.
- `bookings` — id, user_id, unit_id, move_in_date, protect_tier_id, status (pending_payment, pending_verification, active, cancelled), stripe_payment_intent_id, stripe_verification_session_id, created_at.
- `profiles` — id (=auth.users.id), full_name, phone, address fields.
- `user_roles` + `app_role` enum + `has_role()` SECURITY DEFINER (per role best practice; no roles in profiles).

RLS: users can read units & protect_tiers (public); users can only read/write their own bookings and profile. Trigger creates profile row on signup.

Seed `units` and `protect_tiers` with the values from the live site.

## Auth

Lovable Cloud auth with email/password + Google. `_authenticated` layout guards `/book/*` routes. Step 1 (`/`) is public; clicking "Select unit" stores the chosen unit id in URL/search params, then routes to `/login?redirect=/book/details?unit=<id>` if not signed in, otherwise straight to `/book/details`.

## Payments + Identity

Use Lovable's built-in Stripe payments. After unit selection + details, create a Stripe Checkout session (or PaymentIntent with Elements) for first month + BIGProtect fee. On success, create a Stripe Identity VerificationSession server-side and redirect the customer to Stripe's hosted verification. Webhook (`/api/public/stripe-webhook`) updates booking status when payment succeeds and when `identity.verification_session.verified` fires, then the success page polls/reads the booking record.

I'll run the Stripe payments eligibility check and enable Stripe payments before wiring this up. Stripe Identity is enabled on the same Stripe account.

## Technical notes

- TanStack Start file routes; `_authenticated.tsx` layout protects booking steps.
- Server functions in `src/lib/booking.functions.ts` for: `createBooking`, `createCheckoutSession`, `createVerificationSession`, `getBooking`.
- Server route for Stripe webhook at `src/routes/api/public/stripe-webhook.ts` with signature verification.
- Zod validation on every server-fn input and webhook payload.
- Shadcn Calendar (with `pointer-events-auto`) for move-in date.
- Stepper component shared across `/book/*` routes.

## Out of scope (this round)

- Multiple locations / map picker (skipped per request).
- "Your units" customer dashboard (can come next).
- Admin tooling for managing units (DB seed + later admin UI).

## Open question

For BIGProtect goods value — do you want me to use the same tiers and monthly fees as your current site? If so, share the tier list and I'll seed them; otherwise I'll seed sensible defaults (£2k / £5k / £10k / £20k cover) for you to edit later.
