import { type ProjectedTransaction, type BalancePoint, type ProjectionAlert } from './projectionService'

/**
 * Pure service for financial calculations.
 * No side effects, no database calls, no external dependencies.
 */
export const calculationService = {
    /**
     * Calculates the Remaining to Live (RAV).
     */
    calculateRAV(income: number, expenses: number, totalSavings: number): number {
        return income - expenses - totalSavings
    },

    /**
     * Sums the amounts of an array of transactions.
     */
    sumTransactions(transactions: { amount: number | string }[]): number {
        return transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)
    },

    /**
     * Projects daily balance history for a given period.
     * @param currentBalance Starting balance
     * @param projections Array of upcoming expected transactions
     * @param days Number of days to project
     * @param simulationEvents Optional array of one-off or recurring simulation events
     */
    projectBalanceHistory(
        currentBalance: number,
        projections: ProjectedTransaction[],
        days: number = 32,
        simulationEvents: { amount: number, date: string }[] = []
    ): BalancePoint[] {
        const history: BalancePoint[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let balance = currentBalance

        // Helper to get YYYY-MM-DD in local time
        const formatLocal = (d: Date) => {
            const year = d.getFullYear()
            const month = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        const allEvents = [
            ...projections.map(p => ({ amount: p.amount, date: p.due_date })),
            ...simulationEvents.map(s => ({ amount: s.amount, date: s.date }))
        ]

        for (let i = 0; i <= days; i++) {
            const currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)
            const dateStr = formatLocal(currentDate)

            // Find events due on this specific date
            const deltaToday = allEvents
                .filter(e => e.date === dateStr)
                .reduce((sum, e) => sum + e.amount, 0)

            balance += deltaToday

            history.push({
                date: dateStr,
                balance: balance
            })
        }

        return history
    },

    /**
     * Detects the first overdraft in a balance history.
     */
    detectOverdraft(history: BalancePoint[]): ProjectionAlert | null {
        const firstOverdraft = history.find(p => p.balance < 0)

        if (firstOverdraft) {
            return {
                type: 'overdraft',
                date: firstOverdraft.date,
                amount: firstOverdraft.balance,
                severity: 'critical'
            }
        }

        return null
    }
}
