ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS mollie_payment_id text,
  ADD COLUMN IF NOT EXISTS mollie_customer_id text,
  ADD COLUMN IF NOT EXISTS mollie_mandate_id text,
  ADD COLUMN IF NOT EXISTS mollie_subscription_id text,
  ADD COLUMN IF NOT EXISTS mollie_status text;

CREATE INDEX IF NOT EXISTS idx_bookings_mollie_payment_id ON public.bookings(mollie_payment_id);