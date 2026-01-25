import { supabase, isConfigured } from '../lib/supabase'

export interface Category {
    id: string
    owner_id: string
    name: string
    icon: string
    color: string
    budget_limit: number
    type: 'income' | 'expense'
    created_at: string
}

const MOCK_CATEGORIES: Category[] = [
    { id: 'cat-1', owner_id: 'user-1', name: 'Alimentation', icon: 'ShoppingBag', color: '#10b981', budget_limit: 500, type: 'expense', created_at: new Date().toISOString() },
    { id: 'cat-2', owner_id: 'user-1', name: 'Loisirs', icon: 'Sparkles', color: '#f59e0b', budget_limit: 200, type: 'expense', created_at: new Date().toISOString() },
    { id: 'cat-3', owner_id: 'user-1', name: 'Logement', icon: 'Home', color: '#3b82f6', budget_limit: 1000, type: 'expense', created_at: new Date().toISOString() },
    { id: 'cat-4', owner_id: 'user-1', name: 'Salaire', icon: 'TrendingUp', color: '#10b981', budget_limit: 0, type: 'income', created_at: new Date().toISOString() },
    { id: 'cat-5', owner_id: 'user-1', name: 'Vente & Occasion', icon: 'Tag', color: '#f59e0b', budget_limit: 0, type: 'income', created_at: new Date().toISOString() },
]

export const categoryService = {
    async getCategories(): Promise<Category[]> {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error

            if (!data || data.length === 0) {
                return MOCK_CATEGORIES
            }

            return data
        } catch (e) {
            console.error('Error fetching categories:', e)
            return MOCK_CATEGORIES
        }
    },

    async getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('type', type)
                .order('name', { ascending: true })

            if (error) throw error

            if (!data || data.length === 0) {
                return MOCK_CATEGORIES.filter(c => c.type === type)
            }

            return data
        } catch (e) {
            console.error(`Error fetching ${type} categories:`, e)
            return MOCK_CATEGORIES.filter(c => c.type === type)
        }
    },

    async createCategory(category: Partial<Category>): Promise<Category | null> {
        if (!isConfigured) {
            return {
                id: Math.random().toString(36).substr(2, 9),
                owner_id: 'demo-user',
                name: category.name || 'Sans nom',
                icon: category.icon || 'Tag',
                color: category.color || '#ffffff',
                budget_limit: Number(category.budget_limit) || 0,
                type: category.type || 'expense',
                created_at: new Date().toISOString()
            }
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('categories')
            .insert([{ ...category, owner_id: user.id }])
            .select()
            .single()

        if (error) {
            console.error('Error creating category:', error)
            return null
        }

        return data
    },

    async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            console.error('Error updating category:', error)
            return null
        }

        return data
    },

    async deleteCategory(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting category:', error)
            return false
        }

        return true
    }
}
