-- Migration: Add Categories Table and link to Transactions

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text DEFAULT 'Tag',
  color text DEFAULT '#14b8a6', -- primary teal
  budget_limit decimal DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Add category_id to Transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 4. Categories Policies
CREATE POLICY "Categories: Owner view" ON public.categories
FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Categories: Owner all" ON public.categories
FOR ALL USING (auth.uid() = owner_id);

-- Partner can see shared categories during the 24h window
CREATE POLICY "Categories: Partner view shared" ON public.categories
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sharing_access
    WHERE owner_id = categories.owner_id
    AND partner_id = auth.uid()
    AND expires_at > now()
    AND status = 'active'
  )
);

-- 5. Seed initial categories for testing (Optional but helpful)
-- Note: This is usually done per user, but for demo/initial setup we can leave it empty or add some global ones if we change schema to support global.
-- For now, let's keep it user-specific.
