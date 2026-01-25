-- Add type to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS type text CHECK (type IN ('income', 'expense')) DEFAULT 'expense';

-- Add account_id lookup helper if needed, but for manual entry we'll usually pick a default or specific account.
-- Let's ensure RLS allows inserting transactions.
CREATE POLICY "Users can insert their own transactions" ON public.transactions
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM accounts WHERE id = transactions.account_id AND owner_id = auth.uid())
);
