-- Initial Schema for zenbudget

-- 1. Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  zen_mode_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  balance decimal DEFAULT 0,
  currency text DEFAULT 'EUR',
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount decimal NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'validated', 'ignored'
  predicted_category text,
  validated_by uuid REFERENCES public.profiles(id),
  transaction_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 4. Sharing Access (24h Window)
CREATE TABLE IF NOT EXISTS public.sharing_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  status text DEFAULT 'active', -- 'active', 'revoked', 'expired'
  created_at timestamptz DEFAULT now()
);

-- RLS Configuration
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_access ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own accounts" ON accounts FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM accounts WHERE id = transactions.account_id AND owner_id = auth.uid())
);

-- Dual-Pilot Policy (Placeholder for shared access)
-- This will be expanded as we implement the sharing logic
