ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_unit_id_fkey;
ALTER TABLE public.bookings ALTER COLUMN unit_id TYPE text USING unit_id::text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS unit_snapshot jsonb;