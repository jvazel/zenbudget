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
     * Projects daily balance history for a given period.
     * @param currentBalance Starting balance
     * @param projections Array of upcoming expected transactions
     * @param days Number of days to project
     */
    projectBalanceHistory(
        currentBalance: number,
        projections: ProjectedTransaction[],
        days: number = 32
    ): BalancePoint[] {
        const history: BalancePoint[] = []
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let balance = currentBalance

        for (let i = 0; i <= days; i++) {
            const currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)

            // Use YYYY-MM-DD in local time
            const dateStr = [
                currentDate.getFullYear(),
                String(currentDate.getMonth() + 1).padStart(2, '0'),
                String(currentDate.getDate()).padStart(2, '0')
            ].join('-')

            // Find projections due on this specific date
            const expensesToday = projections
                .filter(p => p.due_date === dateStr)
                .reduce((sum, p) => sum + p.amount, 0)

            balance += expensesToday

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
