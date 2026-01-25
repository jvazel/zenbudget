import { supabase } from '../lib/supabase'

export const sharingService = {
    async createInviteToken(): Promise<string> {
        // Generate a robust alphanumeric token (base36 from random bytes)
        const array = new Uint8Array(8)
        crypto.getRandomValues(array)
        const token = Array.from(array).map(b => b.toString(36).padStart(2, '0')).join('').substring(0, 12).toUpperCase()

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Authentication required')

        const { error } = await supabase
            .from('sharing_access')
            .insert({
                owner_id: user.id,
                token: token,
                expires_at: expiresAt,
                status: 'active'
            })

        if (error) throw error
        return token
    },

    async joinSession(token: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Authentication required')

        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        const { data, error } = await supabase
            .from('sharing_access')
            .update({
                partner_id: user.id,
                expires_at: newExpiresAt
            })
            .eq('token', token)
            .eq('status', 'active')
            .gt('expires_at', new Date().toISOString())
            .select()

        if (error) throw new Error(`Erreur technique: ${error.message}`)
        if (!data || data.length === 0) {
            // Check if it's expired or just invalid
            const { data: check } = await supabase.from('sharing_access').select('status, expires_at, partner_id').eq('token', token).single()
            if (!check) throw new Error('Code d\'invitation introuvable.')
            if (check.partner_id) throw new Error('Cette invitation a déjà été utilisée.')
            if (check.status !== 'active' || new Date(check.expires_at) < new Date()) throw new Error('Ce code a expiré.')
            throw new Error('Jeton invalide.')
        }
    }
}
