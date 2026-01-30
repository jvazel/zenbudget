import { supabase } from '../lib/supabase'

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

export const projectionService = {
    /**
     * Projects upcoming recurring transactions for the next 32 days.
     */
    async getUpcomingProjections(): Promise<ProjectedTransaction[]> {
        try {
            // 1. Fetch all auto-validated patterns
            const { data: patterns, error: pError } = await supabase
                .from('transaction_patterns')
                .select('pattern_text, category_id, categories(name, icon, color)')
                .eq('is_auto_validated', true)

            if (pError) throw pError
            if (!patterns || patterns.length === 0) return []

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
                    let nextDate = new Date(lastDate)

                    // Keep adding months until we find an occurrence in the future
                    let loops = 0
                    while (nextDate <= today && loops < 12) {
                        nextDate.setMonth(nextDate.getMonth() + 1)
                        loops++
                    }

                    // If it falls within next 32 days
                    if (nextDate > today && nextDate <= thirtyDaysFromNow) {
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
            // 1. Get current balance by summing ALL validated transactions
            const { data: txs, error: sError } = await supabase
                .from('transactions')
                .select('amount')
                .eq('status', 'validated')

            if (sError) throw sError

            let currentBalance = (txs || []).reduce((sum, t) => sum + Number(t.amount), 0)

            // 2. Get upcoming projections
            const projections = await this.getUpcomingProjections()

            // 3. Generate 32 days of balance points
            const history: BalancePoint[] = []
            const today = new Date()

            for (let i = 0; i <= 32; i++) {
                const currentDate = new Date(today)
                currentDate.setDate(today.getDate() + i)
                const dateStr = currentDate.toISOString().split('T')[0]

                // Deduct any projections due on OR before this date that haven't been counted yet
                // Note: getUpcomingProjections already filters for future items only.
                const expensesToday = projections
                    .filter(p => p.due_date === dateStr)
                    .reduce((sum, p) => sum + p.amount, 0)

                currentBalance += expensesToday // expenses are negative, so we add them

                history.push({
                    date: dateStr,
                    balance: currentBalance
                })
            }

            return history
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
        const alerts: ProjectionAlert[] = []

        // Find the FIRST point where balance < 0
        const firstOverdraft = history.find(p => p.balance < 0)

        if (firstOverdraft) {
            alerts.push({
                type: 'overdraft',
                date: firstOverdraft.date,
                amount: firstOverdraft.balance,
                severity: 'critical'
            })
        }

        return alerts
    }
}
