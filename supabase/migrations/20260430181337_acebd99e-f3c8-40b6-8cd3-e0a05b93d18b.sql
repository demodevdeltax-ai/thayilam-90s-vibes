-- Add columns to align canonical schema with live DB & code
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon text;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'Approved';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_flagged boolean NOT NULL DEFAULT false;

ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS cta text;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'Homepage Hero';

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS scope_targets text[] NOT NULL DEFAULT '{}';

-- notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  audience jsonb NOT NULL DEFAULT '{}'::jsonb,
  recipients integer NOT NULL DEFAULT 0,
  sent_by uuid,
  sent_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins view notifications" ON public.notifications;
CREATE POLICY "Admins view notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins create notifications" ON public.notifications;
CREATE POLICY "Admins create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins delete notifications" ON public.notifications;
CREATE POLICY "Admins delete notifications" ON public.notifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- platform_settings (singleton)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  platform_name text NOT NULL DEFAULT 'Thayilam',
  support_email text NOT NULL DEFAULT 'support@thayilam.in',
  default_commission numeric NOT NULL DEFAULT 12,
  min_payout numeric NOT NULL DEFAULT 1000,
  free_ship_threshold numeric NOT NULL DEFAULT 999,
  two_factor boolean NOT NULL DEFAULT true,
  auto_approve_vendors boolean NOT NULL DEFAULT false,
  public_catalog boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view settings" ON public.platform_settings;
CREATE POLICY "Anyone can view settings" ON public.platform_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage settings" ON public.platform_settings;
CREATE POLICY "Admins manage settings" ON public.platform_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.platform_settings (singleton) VALUES (true) ON CONFLICT (singleton) DO NOTHING;