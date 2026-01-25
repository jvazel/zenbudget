-- Security Extensions for Dual-Pilot Sharing (24h)

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sharing_access ENABLE ROW LEVEL SECURITY;

-- 2. ACCOUNTS Policies
-- Owner can see their accounts
CREATE POLICY "Accounts: Owner view" ON public.accounts
FOR SELECT USING (auth.uid() = owner_id);

-- Partner can see shared accounts during the 24h window
CREATE POLICY "Accounts: Partner view shared" ON public.accounts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sharing_access
    WHERE owner_id = accounts.owner_id
    AND partner_id = auth.uid()
    AND expires_at > now()
    AND status = 'active'
  )
);

-- 3. TRANSACTIONS Policies
-- Owner can see their transactions via their accounts
CREATE POLICY "Transactions: Owner view" ON public.transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.accounts
    WHERE id = transactions.account_id
    AND owner_id = auth.uid()
  )
);

-- Partner can see shared transactions via shared accounts
CREATE POLICY "Transactions: Partner view shared" ON public.transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sharing_access s
    JOIN public.accounts a ON a.owner_id = s.owner_id
    WHERE a.id = transactions.account_id
    AND s.partner_id = auth.uid()
    AND s.expires_at > now()
    AND s.status = 'active'
  )
);

-- Anyone can insert transactions (for mock/IA flow simulation)
CREATE POLICY "Transactions: Insert anyone" ON public.transactions
FOR INSERT WITH CHECK (true);

-- 4. VALIDATION Policy
-- Users can only validate transactions they have access to
CREATE POLICY "Transactions: Update status" ON public.transactions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.accounts a
    LEFT JOIN public.sharing_access s ON s.owner_id = a.owner_id
    WHERE a.id = transactions.account_id
    AND (
      a.owner_id = auth.uid() OR 
      (s.partner_id = auth.uid() AND s.expires_at > now() AND s.status = 'active')
    )
  )
)
WITH CHECK (
  status IN ('pending', 'validated', 'ignored')
);
