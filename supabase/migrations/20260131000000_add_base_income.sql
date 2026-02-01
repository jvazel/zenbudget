ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS base_monthly_income decimal DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guide_dismissed boolean DEFAULT false;
