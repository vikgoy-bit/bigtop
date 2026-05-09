-- Storage bucket for BIGProtect cover-elsewhere proof uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-documents', 'cover-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies: users can upload/view their own files (folder = user id)
CREATE POLICY "Users upload own cover docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cover-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own cover docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cover-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins view all cover docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'cover-documents' AND has_role(auth.uid(), 'admin'));

-- Track uploaded proof on the booking
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cover_document_path text;