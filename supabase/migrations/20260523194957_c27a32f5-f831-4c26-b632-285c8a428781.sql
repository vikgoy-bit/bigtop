
-- 1. Drop author_email column from blog_posts (PII exposure on public reads)
ALTER TABLE public.blog_posts DROP COLUMN IF EXISTS author_email;

-- 2. Cover-documents storage bucket: add UPDATE/DELETE policies scoped to owner folder
DROP POLICY IF EXISTS "Users can update own cover documents" ON storage.objects;
CREATE POLICY "Users can update own cover documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'cover-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'cover-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own cover documents" ON storage.objects;
CREATE POLICY "Users can delete own cover documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'cover-documents'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Signed-contracts: add admin SELECT policy
DROP POLICY IF EXISTS "Admins can view signed contracts" ON storage.objects;
CREATE POLICY "Admins can view signed contracts"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'signed-contracts'
  AND public.has_role(auth.uid(), 'admin')
);

-- 4. Profiles: admin SELECT policy
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Email queue helper functions: revoke from public/anon/authenticated,
--    pin search_path. Only service_role and trigger owners need execute.
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

-- Trigger-only SECURITY DEFINER functions: not meant to be called by clients
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_admin_for_bigtop_email() FROM PUBLIC, anon, authenticated;

-- 6. Public blog-images bucket: remove broad listing, keep direct file reads by id.
--    Drop any catch-all SELECT policy and replace with one that allows fetching
--    a specific object but blocks `list` operations (which return all keys).
DROP POLICY IF EXISTS "Public read blog images" ON storage.objects;
DROP POLICY IF EXISTS "Blog images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view blog images" ON storage.objects;

CREATE POLICY "Public can read individual blog images"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'blog-images'
  AND name IS NOT NULL
  AND name <> ''
);
