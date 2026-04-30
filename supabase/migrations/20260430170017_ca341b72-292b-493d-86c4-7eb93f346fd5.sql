
-- Extend banners with admin fields
ALTER TABLE public.banners
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS cta text,
  ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'Homepage Hero';

-- Extend coupons with admin fields not yet present
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS scope_targets text[] NOT NULL DEFAULT '{}';

-- Extend categories with admin fields
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS icon text;
