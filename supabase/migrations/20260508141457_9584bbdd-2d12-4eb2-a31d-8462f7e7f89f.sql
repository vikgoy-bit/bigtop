
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.size_group AS ENUM ('small', 'medium', 'large');
CREATE TYPE public.booking_status AS ENUM ('pending_payment', 'pending_verification', 'active', 'cancelled');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles (separate table to avoid privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Auto profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Units
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size_sqft INTEGER NOT NULL,
  size_group public.size_group NOT NULL,
  monthly_price_pence INTEGER NOT NULL,
  weekly_price_pence INTEGER NOT NULL,
  vat_rate NUMERIC(4,2) NOT NULL DEFAULT 0.20,
  features TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  offer_label TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Units are public" ON public.units FOR SELECT USING (true);
CREATE POLICY "Admins manage units" ON public.units FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Protect tiers
CREATE TABLE public.protect_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  cover_value_pence INTEGER NOT NULL,
  monthly_fee_pence INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.protect_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tiers are public" ON public.protect_tiers FOR SELECT USING (true);
CREATE POLICY "Admins manage tiers" ON public.protect_tiers FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id),
  protect_tier_id UUID REFERENCES public.protect_tiers(id),
  move_in_date DATE NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending_payment',
  stripe_payment_intent_id TEXT,
  stripe_verification_session_id TEXT,
  total_pence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
