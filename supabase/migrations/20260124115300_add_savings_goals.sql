-- Add Savings Goals table
CREATE TABLE public.savings_goals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    target_amount numeric NOT NULL,
    current_amount numeric DEFAULT 0,
    category text,
    owner_id uuid REFERENCES public.profiles(id) NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Savings: Owner all" ON public.savings_goals
FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Savings: Partner view during sharing" ON public.savings_goals
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.sharing_access
        WHERE owner_id = savings_goals.owner_id
        AND partner_id = auth.uid()
        AND expires_at > now()
        AND status = 'active'
    )
);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_goals;
