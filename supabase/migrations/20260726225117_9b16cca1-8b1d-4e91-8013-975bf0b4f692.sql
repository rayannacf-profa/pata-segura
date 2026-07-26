DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'visitor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = lower('PataSegura1.0@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'visitor') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_created_assign_role ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_role AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.dogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  condition TEXT NOT NULL,
  photo TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  triage JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dogs TO authenticated;
GRANT ALL ON public.dogs TO service_role;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can view dogs" ON public.dogs;
CREATE POLICY "Authenticated can view dogs" ON public.dogs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins can insert dogs" ON public.dogs;
CREATE POLICY "Admins can insert dogs" ON public.dogs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update dogs" ON public.dogs;
CREATE POLICY "Admins can update dogs" ON public.dogs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete dogs" ON public.dogs;
CREATE POLICY "Admins can delete dogs" ON public.dogs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS update_dogs_updated_at ON public.dogs;
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  photo text,
  lat double precision,
  lng double precision,
  address text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated view reports" ON public.reports;
CREATE POLICY "Authenticated view reports" ON public.reports FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated create reports" ON public.reports;
CREATE POLICY "Authenticated create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Admin delete reports" ON public.reports;
CREATE POLICY "Admin delete reports" ON public.reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  date text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated view notices" ON public.notices;
CREATE POLICY "Authenticated view notices" ON public.notices FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert notices" ON public.notices;
CREATE POLICY "Admin insert notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update notices" ON public.notices;
CREATE POLICY "Admin update notices" ON public.notices FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete notices" ON public.notices;
CREATE POLICY "Admin delete notices" ON public.notices FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.castrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL,
  location text NOT NULL,
  slots integer NOT NULL DEFAULT 0,
  taken integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.castrations TO authenticated;
GRANT ALL ON public.castrations TO service_role;
ALTER TABLE public.castrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated view castrations" ON public.castrations;
CREATE POLICY "Authenticated view castrations" ON public.castrations FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admin insert castrations" ON public.castrations;
CREATE POLICY "Admin insert castrations" ON public.castrations FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin update castrations" ON public.castrations;
CREATE POLICY "Admin update castrations" ON public.castrations FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admin delete castrations" ON public.castrations;
CREATE POLICY "Admin delete castrations" ON public.castrations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));