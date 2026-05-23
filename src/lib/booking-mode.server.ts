// Single source of truth for the booking-flow environment toggle.
//
// Set `BOOKING_MODE=test` to route Storeganise / Stripe / Mollie to their
// test/demo equivalents (Storeganise demo subdomain, Stripe test keys,
// Mollie test key). Defaults to "live" so production behaviour is unchanged
// when the var is unset.

export function getBookingMode(): "test" | "live" {
  return (process.env.BOOKING_MODE || "live").toLowerCase() === "test"
    ? "test"
    : "live";
}

export function isBookingTestMode(): boolean {
  return getBookingMode() === "test";
}
