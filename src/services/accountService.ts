import { supabase } from '../lib/supabase'

export interface Account {
    id: string
    owner_id: string
    name: string
    balance: number
    currency: string
    is_shared: boolean
    created_at: string
}

export const accountService = {
    /**
     * Fetch all accounts for the current user
     */
    async getAccounts(): Promise<Account[]> {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .order('name')

        if (error) throw error
        return data || []
    },

    /**
     * Create a new internal account
     */
    async createAccount(name: string, balance: number = 0): Promise<Account> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { data, error } = await supabase
            .from('accounts')
            .insert({
                owner_id: user.id,
                name,
                balance
            })
            .select()
            .single()

        if (error) throw error
        return data
    }
}
