-- Migration for Bank Integration (Epic 13)

-- 1. Table for Bank Connections (Enable Banking Sessions)
CREATE TABLE IF NOT EXISTS public.bank_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    requisition_id text UNIQUE NOT NULL, -- Holds the Enable Banking session_id
    institution_id text NOT NULL, -- ASPSP name
    agreement_id text,
    status text DEFAULT 'initiated', -- 'initiated', 'linked', 'expired', 'revoked'
    created_at timestamptz DEFAULT now()
);

-- 2. Table for Bank Accounts (Mapping Enable Banking Accounts to ZenBudget Accounts)
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id uuid REFERENCES public.bank_connections(id) ON DELETE CASCADE NOT NULL,
    account_id uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
    external_id text UNIQUE NOT NULL, -- Enable Banking Account Name/ID
    created_at timestamptz DEFAULT now()
);

-- 3. Add External Reference to Transactions for deduplication
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS external_id text UNIQUE;

-- RLS Configuration
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policies for bank_connections
CREATE POLICY "Users can view their own bank connections" 
ON public.bank_connections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bank connections" 
ON public.bank_connections FOR ALL 
USING (auth.uid() = user_id);

-- Policies for bank_accounts
CREATE POLICY "Users can view their own mapped bank accounts" 
ON public.bank_accounts FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.bank_connections 
        WHERE id = public.bank_accounts.connection_id 
        AND user_id = auth.uid()
    )
);

CREATE POLICY "Users can manage their own mapped bank accounts" 
ON public.bank_accounts FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.bank_connections 
        WHERE id = public.bank_accounts.connection_id 
        AND user_id = auth.uid()
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_bank_connections_user_id ON public.bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_connection_id ON public.bank_accounts(connection_id);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON public.transactions(external_id);
