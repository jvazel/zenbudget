import { supabase, isConfigured } from '../lib/supabase'

const MOCK_GOALS: SavingsGoal[] = [
    { id: 'mock-goal-1', title: 'Vacances 2026', target_amount: 3000, current_amount: 1200, category: 'Loisirs', owner_id: 'mock-user' },
    { id: 'mock-goal-2', title: 'Fonds d\'Urgence', target_amount: 10000, current_amount: 4500, category: 'Sécurité', owner_id: 'mock-user' },
    { id: 'mock-goal-3', title: 'Nouvelle Voiture', target_amount: 15000, current_amount: 2000, category: 'Transport', owner_id: 'mock-user' }
]

export interface SavingsGoal {
    id: string
    title: string
    target_amount: number
    current_amount: number
    category: string
    owner_id: string
}

export const savingsService = {
    async getSavingsGoals(): Promise<SavingsGoal[]> {
        if (!isConfigured) return MOCK_GOALS

        try {
            const { data, error } = await supabase
                .from('savings_goals')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            return data || []
        } catch (e) {
            console.error('Failed to fetch savings goals:', e)
            return []
        }
    },

    async updateSavingsAmount(id: string, incrementalAmount: number): Promise<void> {
        if (!isConfigured) {
            const goal = MOCK_GOALS.find(g => g.id === id)
            if (goal) goal.current_amount += incrementalAmount
            return new Promise(resolve => setTimeout(resolve, 500))
        }

        try {
            // Get current amount first
            const { data: goal, error: fetchError } = await supabase
                .from('savings_goals')
                .select('current_amount')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const newAmount = (goal.current_amount || 0) + incrementalAmount

            const { error: updateError } = await supabase
                .from('savings_goals')
                .update({ current_amount: newAmount })
                .eq('id', id)

            if (updateError) throw updateError
        } catch (e) {
            console.error('Failed to update savings amount:', e)
            throw e
        }
    },

    async createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'owner_id' | 'created_at'>): Promise<SavingsGoal> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { data, error } = await supabase
                .from('savings_goals')
                .insert([{ ...goal, owner_id: user.id }])
                .select()
                .single()

            if (error) throw error
            return data
        } catch (e) {
            console.error('Failed to create savings goal:', e)
            throw e
        }
    },

    async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
        try {
            const { error } = await supabase
                .from('savings_goals')
                .update(updates)
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.error('Failed to update savings goal:', e)
            throw e
        }
    },

    async deleteSavingsGoal(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('savings_goals')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.error('Failed to delete savings goal:', e)
            throw e
        }
    }
}
