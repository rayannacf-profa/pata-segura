-- 1) Restrict reports reads to owner + admin
DROP POLICY IF EXISTS "Authenticated view reports" ON public.reports;
CREATE POLICY "Owners and admins view reports"
ON public.reports FOR SELECT TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Allow admins to moderate/correct reports
CREATE POLICY "Admins update reports"
ON public.reports FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Admin-only role management
CREATE POLICY "Admins insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- 4) Trigger-only SECURITY DEFINER function must not be callable by users
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;