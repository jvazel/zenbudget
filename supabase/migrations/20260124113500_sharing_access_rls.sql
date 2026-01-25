-- RLS Policies for sharing_access

-- 1. Owners can insert their own tokens
CREATE POLICY "Sharing Access: Owner insert" ON public.sharing_access
FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 2. Owners and Partners can view tokens
CREATE POLICY "Sharing Access: View shared" ON public.sharing_access
FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = partner_id);

-- 3. Partners can join a session (set partner_id via token)
-- Note: This is used by joinSession
CREATE POLICY "Sharing Access: Partner join" ON public.sharing_access
FOR UPDATE USING (
    status = 'active' 
    AND expires_at > now() 
    AND partner_id IS NULL
) WITH CHECK (
    auth.uid() = partner_id
);
