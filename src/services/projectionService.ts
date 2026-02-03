import { supabase, isConfigured } from '../lib/supabase'
import { calculationService } from './calculationService'
import { transactionService } from './transactionService'

export interface ProjectedTransaction {
    id: string
    description: string
    amount: number
    category_id: string
    category_name: string
    category_icon: string
    category_color: string
    due_date: string
    days_until: number
}

export interface BalancePoint {
    date: string
    balance: number
}

export interface ProjectionAlert {
    type: 'overdraft'
    date: string
    amount: number
    severity: 'critical' | 'warning'
}

const MOCK_PROJECTIONS: Omit<ProjectedTransaction, 'due_date' | 'days_until'>[] = [
    { id: 'mock-1', description: 'Loyer & Charges', amount: -850, category_id: 'cat-housing', category_name: 'Logement', category_icon: 'Home', category_color: '#3b82f6' },
    { id: 'mock-2', description: 'Abonnement Netflix', amount: -17.99, category_id: 'cat-subs', category_name: 'Abonnements', category_icon: 'Zap', category_color: '#ef4444' },
    { id: 'mock-3', description: 'Spotify Family', amount: -15.99, category_id: 'cat-subs', category_name: 'Abonnements', category_icon: 'Zap', category_color: '#10b981' },
    { id: 'mock-4', description: 'EDF / électricité', amount: -65, category_id: 'cat-bills', category_name: 'Factures', category_icon: 'Zap', category_color: '#f59e0b' },
    { id: 'mock-5', description: 'Internet Fibre', amount: -29.99, category_id: 'cat-bills', category_name: 'Factures', category_icon: 'Zap', category_color: '#6366f1' },
    { id: 'mock-6', description: 'Assurance Habitation', amount: -24.50, category_id: 'cat-insur', category_name: 'Assurance', category_icon: 'Sparkles', category_color: '#8b5cf6' },
    { id: 'mock-7', description: 'Prêt Personnel', amount: -120, category_id: 'cat-loan', category_name: 'Crédit', category_icon: 'TrendingUp', category_color: '#ec4899' },
]

export const projectionService = {
    /**
     * Projects upcoming recurring transactions for the next 32 days.
     */
    async getUpcomingProjections(): Promise<ProjectedTransaction[]> {
        if (!isConfigured) {
            const today = new Date()
            return MOCK_PROJECTIONS.map((m, i) => {
                const nextDate = new Date(today)
                // Spread mock dates across the month
                nextDate.setDate(today.getDate() + (i * 4) + 2)
                return {
                    ...m,
                    due_date: nextDate.toISOString().split('T')[0],
                    days_until: Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                }
            }).sort((a, b) => a.days_until - b.days_until)
        }

        try {
            // 1. Fetch all auto-validated patterns
            const { data: patterns, error: pError } = await supabase
                .from('transaction_patterns')
                .select('pattern_text, category_id, categories(name, icon, color)')
                .eq('is_auto_validated', true)

            if (pError) throw pError

            // If no real patterns found, return mocks to keep dashboard alive
            if (!patterns || patterns.length === 0) {
                const today = new Date()
                return MOCK_PROJECTIONS.slice(0, 5).map((m, i) => {
                    const d = new Date(today); d.setDate(today.getDate() + (i * 3) + 1)
                    return {
                        ...m,
                        due_date: d.toISOString().split('T')[0],
                        days_until: Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                    }
                })
            }

            // 2. For each pattern, find the LAST transaction to predict the NEXT one
            const projections: ProjectedTransaction[] = []
            const today = new Date()
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(today.getDate() + 32)

            for (const pattern of patterns) {
                const { data: lastTx, error: tError } = await supabase
                    .from('transactions')
                    .select('transaction_date, amount, description')
                    .ilike('description', `%${pattern.pattern_text}%`)
                    .order('transaction_date', { ascending: false })
                    .limit(1)
                    .maybeSingle()

                if (tError) {
                    console.error(`Error fetching last tx for pattern ${pattern.pattern_text}:`, tError)
                    continue
                }

                if (lastTx) {
                    const lastDate = new Date(lastTx.transaction_date)
                    // Start from the same day as the last transaction
                    let nextDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())

                    // Keep adding months until we find an occurrence >= today
                    let loops = 0
                    while (nextDate < today && loops < 12) {
                        nextDate.setMonth(nextDate.getMonth() + 1)
                        loops++
                    }

                    // If it falls within next 32 days
                    if (nextDate >= today && nextDate <= thirtyDaysFromNow) {
                        const cat = Array.isArray(pattern.categories) ? pattern.categories[0] : pattern.categories

                        projections.push({
                            id: `proj-${pattern.pattern_text}`,
                            description: lastTx.description,
                            amount: lastTx.amount,
                            category_id: pattern.category_id,
                            category_name: cat?.name || 'Autre',
                            category_icon: cat?.icon || 'Zap',
                            category_color: cat?.color || '#94a3b8',
                            due_date: nextDate.toISOString().split('T')[0],
                            days_until: Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                        })
                    }
                }
            }

            return projections.sort((a, b) => a.days_until - b.days_until)
        } catch (e) {
            console.error('[ZenVision] Failed to get projections:', e)
            return []
        }
    },

    /**
     * Projects the daily balance for the next 30 days.
     */
    async getProjectedBalanceHistory(): Promise<BalancePoint[]> {
        try {
            // 1. Get current balance from centralized service
            const currentBalance = await transactionService.getTotalBalance()

            // 2. Get upcoming projections
            const projections = await this.getUpcomingProjections()

            // 3. Generate 32 days of balance points
            return calculationService.projectBalanceHistory(currentBalance, projections, 32)
        } catch (e) {
            console.error('[ZenVision] Failed to project balance history:', e)
            return []
        }
    },

    /**
     * Checks for potential issues in the projected history.
     */
    async getProjectedAlerts(): Promise<ProjectionAlert[]> {
        const history = await this.getProjectedBalanceHistory()
        const alert = calculationService.detectOverdraft(history)
        return alert ? [alert] : []
    }
}
