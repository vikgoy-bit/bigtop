
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS signed_contract_path text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS signer_name text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-contracts', 'signed-contracts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users read own signed contracts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'signed-contracts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
