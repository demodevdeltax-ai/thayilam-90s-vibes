-- Product moderation columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'Approved',
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_flagged boolean NOT NULL DEFAULT false;

-- Platform settings (singleton row)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name text NOT NULL DEFAULT 'Thayilam',
  support_email text NOT NULL DEFAULT 'support@thayilam.in',
  default_commission numeric NOT NULL DEFAULT 12,
  min_payout numeric NOT NULL DEFAULT 1000,
  free_ship_threshold numeric NOT NULL DEFAULT 999,
  two_factor boolean NOT NULL DEFAULT true,
  auto_approve_vendors boolean NOT NULL DEFAULT false,
  public_catalog boolean NOT NULL DEFAULT true,
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings"
  ON public.platform_settings FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admins manage settings"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.platform_settings (singleton) VALUES (true)
  ON CONFLICT (singleton) DO NOTHING;

-- Notifications log
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

CREATE POLICY "Admins view notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));