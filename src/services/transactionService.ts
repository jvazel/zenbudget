import { supabase, isConfigured } from '../lib/supabase'
import { type Transaction } from '../features/inbox/components/TransactionCard'
import { patternService } from './patternService'
import { analysisService } from './analysisService'
import { type ImportedTransaction } from './importService'
import { calculationService } from './calculationService'

const generateMockHistory = (): Transaction[] => {
    const transactions: Transaction[] = []
    const now = new Date()
    const categories = [
        { id: 'cat-1', name: 'Alimentation', icon: 'ShoppingBag', color: '#10b981', amountRange: [-80, -20] },
        { id: 'cat-2', name: 'Loisirs', icon: 'Sparkles', color: '#f59e0b', amountRange: [-150, -30] },
        { id: 'cat-3', name: 'Logement', icon: 'Home', color: '#3b82f6', amountRange: [-850, -850] },
        { id: 'cat-4', name: 'Salaire', icon: 'TrendingUp', color: '#10b981', amountRange: [2500, 3000] },
        { id: 'cat-5', name: 'Transport', icon: 'Car', color: '#ef4444', amountRange: [-60, -40] }
    ]

    for (let i = 0; i < 6; i++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)

        // Income
        transactions.push({
            id: `mock-income-${i}`,
            description: 'Salaire Mensuel',
            amount: 2800,
            predicted_category: 'Salaire',
            category_icon: 'TrendingUp',
            category_color: '#10b981',
            date: monthDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            raw_date: monthDate.toISOString(),
            status: 'validated',
            category_id: 'cat-4'
        })

        // Rent
        transactions.push({
            id: `mock-rent-${i}`,
            description: 'Loyer Zen Appt',
            amount: -850,
            predicted_category: 'Logement',
            category_icon: 'Home',
            category_color: '#3b82f6',
            date: monthDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            raw_date: monthDate.toISOString(),
            status: 'validated',
            category_id: 'cat-3'
        })

        // Random Expenses
        for (let j = 0; j < 5; j++) {
            const cat = categories[Math.floor(Math.random() * (categories.length - 1))] // Skip salary for random expenses
            const day = Math.floor(Math.random() * 28) + 1
            const date = new Date(now.getFullYear(), now.getMonth() - i, day)

            transactions.push({
                id: `mock-exp-${i}-${j}`,
                description: `${cat.name} ${day}/${i + 1}`,
                amount: Math.floor(Math.random() * (cat.amountRange[1] - cat.amountRange[0] + 1)) + cat.amountRange[0],
                predicted_category: cat.name,
                category_icon: cat.icon,
                category_color: cat.color,
                date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
                raw_date: date.toISOString(),
                status: 'validated',
                category_id: cat.id
            })
        }
    }

    // Add a specific Anomaly mock
    transactions.push({
        id: 'mock-anomaly-1',
        description: 'Monoprix Exceptionnel',
        amount: -185.40, // Assuming average is around 50
        predicted_category: 'Alimentation',
        category_icon: 'ShoppingBag',
        category_color: '#10b981',
        date: now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        raw_date: now.toISOString(),
        status: 'validated',
        category_id: 'cat-1',
        anomaly: {
            isAnomaly: true,
            type: 'price_spike',
            averageAmount: 52,
            difference: 256
        }
    })

    // Add extra Pending mocks for demo
    const pendingMocks: Transaction[] = [
        { id: 'p-1', description: 'Monoprix', amount: -42.50, predicted_category: 'Alimentation', category_icon: 'ShoppingBag', category_color: '#10b981', date: now.toLocaleDateString(), raw_date: now.toISOString(), status: 'pending', category_id: '' },
        { id: 'p-2', description: 'Uber Trip', amount: -15.20, predicted_category: 'Transport', category_icon: 'Car', category_color: '#ef4444', date: now.toLocaleDateString(), raw_date: now.toISOString(), status: 'pending', category_id: '' },
        { id: 'p-3', description: 'Netflix', amount: -17.99, predicted_category: 'Loisirs', category_icon: 'Sparkles', category_color: '#f59e0b', date: now.toLocaleDateString(), raw_date: now.toISOString(), status: 'pending', category_id: '' },
        { id: 'p-4', description: 'Boulangerie Paul', amount: -8.40, predicted_category: 'Inconnu', category_icon: 'HelpCircle', category_color: '#94a3b8', date: now.toLocaleDateString(), raw_date: now.toISOString(), status: 'pending', category_id: '' },
        { id: 'p-5', description: 'Spotify', amount: -10.99, predicted_category: 'Loisirs', category_icon: 'Sparkles', category_color: '#f59e0b', date: now.toLocaleDateString(), raw_date: now.toISOString(), status: 'pending', category_id: '' }
    ]

    return [...transactions, ...pendingMocks]
}

const MOCK_DATA = generateMockHistory()

export const transactionService = {
    async getPendingTransactions(): Promise<Transaction[]> {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*, categories(*), profiles!transactions_validated_by_fkey(full_name)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (!data || data.length === 0) {
                console.info('No transactions in DB, using mock data.')
                return MOCK_DATA.filter(t => t.status === 'pending')
            }

            const pending = data.map((t: any) => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                predicted_category: t.categories?.name || t.predicted_category || 'Inconnu',
                category_color: t.categories?.color,
                category_icon: t.categories?.icon,
                date: new Date(t.transaction_date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }),
                validated_by: t.validated_by,
                validated_by_name: t.profiles?.full_name,
                category_id: t.category_id
            }))

            // Apply Zen Butler Suggestions
            const enhanced = await Promise.all(pending.map(async (t: any) => {
                if (!t.category_id) {
                    const match = await patternService.findPattern(t.description)
                    if (match) {
                        return {
                            ...t,
                            predicted_category: match.categoryName || t.predicted_category,
                            category_color: match.categoryColor || t.category_color,
                            category_icon: match.categoryIcon || t.category_icon,
                            isval_zen_suggestion: true // Optional flag for UI
                        }
                    }
                }
                return t
            }))

            return enhanced as Transaction[]
        } catch (e) {
            console.error('Failed to fetch transactions from Supabase:', e)
            return MOCK_DATA.filter(t => t.status === 'pending')
        }
    },

    async updateTransactionStatus(id: string, status: 'validated' | 'ignored', categoryId?: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const updates: any = { status }
            if (categoryId) updates.category_id = categoryId
            if (status === 'validated' && user) updates.validated_by = user.id

            const { error } = await supabase
                .from('transactions')
                .update(updates)
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.warn(`Local update only: failed to sync ${status} for ${id} to Supabase.`)
        }
    },

    async getValidatedTransactions(selectedDate: Date = new Date()): Promise<Transaction[]> {
        try {
            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
            const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59)

            const { data, error } = await supabase
                .from('transactions')
                .select('*, categories(*), profiles!transactions_validated_by_fkey(full_name)')
                .neq('status', 'pending')
                .gte('transaction_date', startOfMonth.toISOString())
                .lte('transaction_date', endOfMonth.toISOString())
                .order('transaction_date', { ascending: false })
                .limit(10)

            if (!isConfigured) {
                return MOCK_DATA
                    .filter(t => t.status === 'validated' && new Date(t.raw_date!) >= startOfMonth && new Date(t.raw_date!) <= endOfMonth)
                    .slice(0, 10)
            }

            if (error) throw error

            const mapped: Transaction[] = (data || []).map((t: any) => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                predicted_category: t.categories?.name || t.predicted_category || 'Inconnu',
                category_color: t.categories?.color,
                category_icon: t.categories?.icon,
                date: new Date(t.transaction_date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short'
                }),
                raw_date: t.transaction_date,
                category_id: t.category_id,
                validated_by: t.validated_by,
                validated_by_name: t.profiles?.full_name
            }))

            // Detect Anomalies for the list
            // Note: in a real app, we would fetch a larger history for accurate comparison
            return mapped.map(t => ({
                ...t,
                anomaly: analysisService.detectAnomaly(t, mapped)
            }))
        } catch (e) {
            console.error('Failed to fetch validated transactions:', e)
            return []
        }
    },

    async getDashboardStats(selectedDate: Date = new Date()): Promise<{ income: number, expenses: number, rav: number }> {
        try {
            const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
            startOfMonth.setHours(0, 0, 0, 0)
            const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59)

            const { data, error } = await supabase
                .from('transactions')
                .select('amount')
                .eq('status', 'validated')
                .gte('transaction_date', startOfMonth.toISOString())
                .lte('transaction_date', endOfMonth.toISOString())

            if (error) throw error

            const { data: profile } = await supabase
                .from('profiles')
                .select('base_monthly_income')
                .single()

            const baseIncome = Number(profile?.base_monthly_income || 0)

            const incomeFromTxs = data
                .filter(t => t.amount > 0)
                .reduce((acc, t) => acc + Number(t.amount), 0)

            const income = incomeFromTxs || baseIncome

            const expenses = Math.abs(data
                .filter(t => t.amount < 0)
                .reduce((acc, t) => acc + Number(t.amount), 0))

            const { data: savings, error: savingsError } = await supabase
                .from('savings_goals')
                .select('current_amount')

            if (savingsError) throw savingsError

            const totalSavings = (savings || []).reduce((acc, s) => acc + Number(s.current_amount), 0)

            // RAV = Income - Expenses - Total Savings
            const rav = calculationService.calculateRAV(income, expenses, totalSavings)

            return { income, expenses, rav }
        } catch (e) {
            if (!isConfigured) {
                const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
                const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59)
                const currentMonthData = MOCK_DATA.filter(t => {
                    const d = new Date(t.raw_date!)
                    return d >= startOfMonth && d <= endOfMonth
                })

                const income = currentMonthData
                    .filter(t => t.amount > 0)
                    .reduce((acc, t) => acc + t.amount, 0)

                const expenses = Math.abs(currentMonthData
                    .filter(t => t.amount < 0)
                    .reduce((acc, t) => acc + t.amount, 0))

                return { income, expenses, rav: calculationService.calculateRAV(income, expenses, 250) } // Mock savings 250
            }
            console.error('Failed to calculate dashboard stats:', e)
            return { income: 0, expenses: 0, rav: 0 }
        }
    },

    async createManualTransaction(params: {
        description: string,
        amount: number,
        type: 'income' | 'expense',
        categoryId: string,
        date: string
    }): Promise<void> {
        // MOCK MODE: If not configured, just simulate success for testing
        if (!isConfigured) {
            console.info('Mock Mode: Simulating manual transaction creation', params)
            return new Promise(resolve => setTimeout(resolve, 800))
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get default account for the user
            const { data: account, error: accountError } = await supabase
                .from('accounts')
                .select('id')
                .eq('owner_id', user.id)
                .limit(1)
                .maybeSingle()

            if (accountError) throw accountError

            let accountId = account?.id

            // Create default account if none exists
            if (!accountId) {
                const { data: newAccount, error: createError } = await supabase
                    .from('accounts')
                    .insert({
                        owner_id: user.id,
                        name: 'Principal',
                        balance: 0
                    })
                    .select()
                    .single()

                if (createError) throw createError
                accountId = newAccount.id
            }

            // Ensure amount has correct sign
            const finalAmount = params.type === 'expense' ? -Math.abs(params.amount) : Math.abs(params.amount)

            const { error } = await supabase
                .from('transactions')
                .insert({
                    account_id: accountId,
                    description: params.description,
                    amount: finalAmount,
                    category_id: params.categoryId,
                    transaction_date: params.date,
                    status: 'validated', // Manual entries are pre-validated
                    validated_by: user.id
                })

            if (error) throw error
        } catch (e) {
            console.error('Failed to create manual transaction:', e)
            throw e
        }
    },

    async updateManualTransaction(id: string, params: {
        description: string,
        amount: number,
        type: 'income' | 'expense',
        categoryId: string,
        date: string
    }): Promise<void> {
        try {
            const finalAmount = params.type === 'expense' ? -Math.abs(params.amount) : Math.abs(params.amount)

            const { error } = await supabase
                .from('transactions')
                .update({
                    description: params.description,
                    amount: finalAmount,
                    category_id: params.categoryId,
                    transaction_date: params.date
                })
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.error('Failed to update transaction:', e)
            throw e
        }
    },

    async deleteManualTransaction(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id)

            if (error) throw error
        } catch (e) {
            console.error('Failed to delete transaction:', e)
            throw e
        }
    },

    async getMonthlyHistory(months: number = 6): Promise<{ month: string, fullMonth: string, amount: number, isCurrent: boolean }[]> {
        // Mock implementation for now, replacing the static data in ZenAnalysis
        // in a real scenario, this would aggregate Supabase data
        const history = []
        const now = new Date()

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const isCurrent = i === 0

            // Generate semi-random data based on "Zen" patterns
            // Base expense around 1200-1500 + random variation
            const baseAmount = 1350
            const variation = Math.floor(Math.random() * 400) - 200

            history.push({
                month: d.toLocaleDateString('fr-FR', { month: 'narrow' }),
                fullMonth: d.toLocaleDateString('fr-FR', { month: 'long' }),
                amount: Math.abs(baseAmount + variation),
                isCurrent
            })
        }
        return history
    },

    async getEnergyLeaks(): Promise<{ name: string, amount: number, annualImpact: number, occurrences: number }[]> {
        const transactions = await this.getValidatedTransactions(new Date()) // Get current month for now, ideally broader range

        // Simple heuristic: same description prefix + same amount = recurring
        const recurring = transactions.reduce((acc, t) => {
            if (t.amount > 0) return acc // Ignore income

            // Normalize description (take first 2 words)
            const key = t.description.split(' ').slice(0, 2).join(' ').toLowerCase()

            if (!acc[key]) acc[key] = { items: [], total: 0, name: t.description }
            acc[key].items.push(t)
            acc[key].total += Math.abs(t.amount)
            return acc
        }, {} as Record<string, { items: Transaction[], total: number, name: string }>)

        return Object.values(recurring)
            .filter(r => r.items.length >= 1) // In a real app, strict > 1. For demo with limited mock data, relaxed.
            .map(r => ({
                name: r.name,
                amount: Math.abs(r.items[0].amount),
                annualImpact: Math.abs(r.items[0].amount) * 12,
                occurrences: r.items.length
            }))
            .sort((a, b) => b.annualImpact - a.annualImpact)
            .slice(0, 5) // Top 5
    },

    async getCategoryTrends(months: number = 6, type: 'income' | 'expense' = 'expense'): Promise<{ month: string, fullMonth: string, categories: Record<string, number> }[]> {
        const trends = []
        const now = new Date()
        const categories = type === 'expense'
            ? ['Alimentation', 'Logement', 'Loisirs', 'Transport', 'Autres']
            : ['Salaire', 'Dividendes', 'Freelance', 'Cadeaux', 'Autres']

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthData: any = {
                month: d.toLocaleDateString('fr-FR', { month: 'narrow' }),
                fullMonth: d.toLocaleDateString('fr-FR', { month: 'long' }),
                categories: {}
            }

            // Generate "Zen" consistent data
            categories.forEach(cat => {
                let base = 0
                if (type === 'expense') {
                    if (cat === 'Logement') base = 850
                    else if (cat === 'Alimentation') base = 400
                    else base = 150
                } else {
                    if (cat === 'Salaire') base = 2800
                    else base = 0
                }

                // Add some organic variation
                const variation = Math.floor(Math.random() * (base * 0.2)) - (base * 0.1)

                // Occasional spikes for "Loisirs" or "Freelance"
                const spike = Math.random() > 0.8 ? base * 0.5 : 0

                monthData.categories[cat] = Math.max(0, Math.floor(base + variation + spike))
            })

            trends.push(monthData)
        }
        return trends
    },

    async getSubscriptions(): Promise<{ name: string, amount: number, occurrences: number, lastDate: string, categoryName: string, categoryColor: string }[]> {
        // Logic: find transactions that repeat with same description pattern in different months
        const all = MOCK_DATA.filter(t => t.amount < 0 && t.status === 'validated')

        const groups: Record<string, Transaction[]> = {}
        all.forEach(t => {
            const pattern = t.description.split(' ').slice(0, 2).join(' ').toLowerCase()
            if (!groups[pattern]) groups[pattern] = []
            groups[pattern].push(t)
        })

        const recurring = Object.entries(groups)
            .filter(([_, items]) => {
                // Heuristic: Must be in at least 2 distinct months
                const months = new Set(items.map(t => new Date(t.raw_date || '').getMonth()))
                return months.size >= 2
            })
            .map(([_, items]) => {
                const latest = items.sort((a, b) => new Date(b.raw_date || '').getTime() - new Date(a.raw_date || '').getTime())[0]
                const avgAmount = items.reduce((acc, t) => acc + Math.abs(t.amount), 0) / items.length

                return {
                    name: latest.description,
                    amount: avgAmount,
                    occurrences: items.length,
                    lastDate: latest.date,
                    categoryName: latest.predicted_category,
                    categoryColor: latest.category_color || '#94a3b8'
                }
            })
            .sort((a, b) => b.amount - a.amount)

        return recurring
    },

    async getTrendData(): Promise<{ name: string, data: number[], trend: number, isInflation: boolean }[]> {
        // Find top patterns (at least 3 occurrences)
        const all = MOCK_DATA.filter(t => t.amount < 0 && t.status === 'validated')
        const groups: Record<string, Transaction[]> = {}
        all.forEach(t => {
            const pattern = t.description.split(' ').slice(0, 2).join(' ').toLowerCase()
            if (!groups[pattern]) groups[pattern] = []
            groups[pattern].push(t)
        })

        const now = new Date()
        const last6Months = Array.from({ length: 6 }, (_, idx) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1)
            return d.getMonth()
        })

        const trends = Object.entries(groups)
            .filter(([_, items]) => items.length >= 3)
            .map(([_, items]) => {
                const monthlyData = last6Months.map(monthIdx => {
                    const inMonth = items.filter(t => new Date(t.raw_date || '').getMonth() === monthIdx)
                    if (inMonth.length === 0) return 0
                    return inMonth.reduce((acc, t) => acc + Math.abs(t.amount), 0) / inMonth.length
                })

                // If most values are 0, use a fallback or specific mock logic for demo
                const filteredData = monthlyData.map((v) => v === 0 ? (items[0] ? Math.abs(items[0].amount) * (0.9 + Math.random() * 0.2) : 0) : v)

                const firstHalf = filteredData.slice(0, 3)
                const secondHalf = filteredData.slice(3)
                const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
                const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
                const trend = avg1 > 0 ? ((avg2 - avg1) / avg1) * 100 : 0

                return {
                    name: items[0].description,
                    data: filteredData,
                    trend,
                    isInflation: trend > 5
                }
            })
            .sort((a, b) => b.data[5] - a.data[5])
            .slice(0, 4)

        return trends
    },

    async getSavingsPotential(): Promise<{ surplus: number, optimizable: number, total: number }> {
        const stats = await this.getDashboardStats(new Date())
        const subs = await this.getSubscriptions()
        const energyLeaks = await this.getEnergyLeaks()

        const surplus = Math.max(0, stats.rav)

        // Optimizable = Average monthly cost of "leaks" or high-cost subscriptions that could be optimized
        // For demo, let's say 20% of subscriptions could be optimized + 100% of energy leaks
        const optimizableSubs = subs.reduce((acc, s) => acc + s.amount, 0) * 0.2
        const energyImpact = energyLeaks.reduce((acc, l) => acc + (l.annualImpact / 12), 0)

        const optimizable = Math.abs(optimizableSubs) + energyImpact

        return {
            surplus,
            optimizable,
            total: surplus + optimizable
        }
    },

    async importTransactions(imported: ImportedTransaction[]): Promise<{ importedCount: number, skippedCount: number, autoValidatedCount: number }> {
        if (!isConfigured) {
            console.info('Mock Mode: Simulating bulk import', imported)
            return { importedCount: imported.length, skippedCount: 0, autoValidatedCount: 0 }
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Fetch default account
            const { data: account } = await supabase
                .from('accounts')
                .select('id')
                .eq('owner_id', user.id)
                .limit(1)
                .maybeSingle()

            const accountId = account?.id
            if (!accountId) throw new Error('Aucun compte trouvé pour l\'import.')

            // Fetch existing transactions to deduplicate (recent history)
            const { data: existing } = await supabase
                .from('transactions')
                .select('description, amount, transaction_date')
                .gte('transaction_date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()) // 60 days back

            const existingKeys = new Set((existing || []).map(e =>
                `${new Date(e.transaction_date).toISOString().split('T')[0]}|${e.description.toLowerCase()}|${Number(e.amount)}`
            ))

            const toInsert = imported.filter(item => {
                // Normalize date
                let isoDate = ''
                try {
                    // Try parsing local format DD/MM/YYYY or YYYY-MM-DD
                    const parts = item.date.split(/[/.-]/)
                    if (parts.length === 3) {
                        if (parts[2].length === 4) isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                        else isoDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
                    } else {
                        isoDate = new Date(item.date).toISOString().split('T')[0]
                    }
                } catch (e) {
                    return false
                }

                const key = `${isoDate}|${item.description.toLowerCase()}|${item.amount}`
                return !existingKeys.has(key)
            })

            // Auto-validation logic
            const processedToInsert = await Promise.all(toInsert.map(async item => {
                const match = await patternService.findPattern(item.description)

                // Normalize date for insertion
                const parts = item.date.split(/[/.-]/)
                let isoDate = item.date
                if (parts.length === 3) {
                    if (parts[2].length === 4) isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
                }

                return {
                    account_id: accountId,
                    description: item.description,
                    amount: item.amount,
                    transaction_date: isoDate,
                    category_id: match?.categoryId || null,
                    status: (match?.isAutoValidated) ? 'validated' : 'pending'
                }
            }))

            if (processedToInsert.length > 0) {
                const { error } = await supabase
                    .from('transactions')
                    .insert(processedToInsert)

                if (error) throw error
            }

            return {
                importedCount: processedToInsert.length,
                skippedCount: imported.length - processedToInsert.length,
                autoValidatedCount: processedToInsert.filter(i => i.status === 'validated').length
            }
        } catch (e) {
            console.error('Failed to import transactions:', e)
            throw e
        }
    },

    async getAllValidatedTransactions(): Promise<Transaction[]> {
        if (!isConfigured) {
            return MOCK_DATA.filter(t => t.status === 'validated')
        }

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*, categories(*), profiles!transactions_validated_by_fkey(full_name)')
                .neq('status', 'pending')
                .order('transaction_date', { ascending: false })

            if (error) throw error

            return (data || []).map((t: any) => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                predicted_category: t.categories?.name || t.predicted_category || 'Inconnu',
                category_color: t.categories?.color,
                category_icon: t.categories?.icon,
                date: new Date(t.transaction_date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short'
                }),
                raw_date: t.transaction_date,
                category_id: t.category_id,
                validated_by: t.validated_by,
                validated_by_name: t.profiles?.full_name
            }))
        } catch (e) {
            console.error('Failed to fetch all validated transactions:', e)
            return []
        }
    }
}
