import Stripe from "stripe";
import { isBookingTestMode } from "./booking-mode.server";

let _stripeLive: Stripe | null = null;
let _stripeTest: Stripe | null = null;

export function getStripe(): Stripe {
  if (isBookingTestMode()) {
    if (_stripeTest) return _stripeTest;
    const key = process.env.STRIPE_SECRET_KEY_TEST;
    if (!key) throw new Error("STRIPE_SECRET_KEY_TEST not configured (BOOKING_MODE=test)");
    _stripeTest = new Stripe(key);
    return _stripeTest;
  }
  if (_stripeLive) return _stripeLive;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
  _stripeLive = new Stripe(key);
  return _stripeLive;
}

export function getStripeWebhookSecret(): string | undefined {
  return isBookingTestMode()
    ? process.env.STRIPE_WEBHOOK_SECRET_TEST
    : process.env.STRIPE_WEBHOOK_SECRET;
}
