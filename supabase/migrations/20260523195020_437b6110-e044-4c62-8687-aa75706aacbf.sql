
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- has_role must remain executable by authenticated users because RLS policies invoke it.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
