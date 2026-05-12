ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS storeganise_user_id text,
  ADD COLUMN IF NOT EXISTS storeganise_order_id text;