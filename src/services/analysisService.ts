import { type Transaction } from '../features/inbox/components/TransactionCard'

export interface AnomalyResult {
    isAnomaly: boolean
    averageAmount?: number
    type?: 'price_spike' | 'category_overrun'
    difference?: number
}

export const analysisService = {
    /**
     * Detects if a transaction is an anomaly compared to history
     * Threshold: 30% increase compared to average of similar transactions
     */
    detectAnomaly(transaction: Transaction, history: Transaction[]): AnomalyResult {
        if (transaction.amount > 0) return { isAnomaly: false } // Ignore income for now

        const absAmount = Math.abs(transaction.amount)

        // Find previous transactions with same description pattern (first 2 words)
        const pattern = transaction.description.split(' ').slice(0, 2).join(' ').toLowerCase()
        const similar = history.filter(t =>
            t.id !== transaction.id &&
            t.amount < 0 &&
            t.description.split(' ').slice(0, 2).join(' ').toLowerCase() === pattern
        )

        if (similar.length < 2) return { isAnomaly: false } // Need at least 2 historical points

        const avg = similar.reduce((acc, t) => acc + Math.abs(t.amount), 0) / similar.length

        // Check for 30% spike
        if (absAmount > avg * 1.3) {
            return {
                isAnomaly: true,
                averageAmount: avg,
                type: 'price_spike',
                difference: ((absAmount - avg) / avg) * 100
            }
        }

        return { isAnomaly: false }
    },

    /**
     * Checks if a category's total for the selected month is an anomaly
     * Threshold: 20% increase compared to average of last 3 months
     */
    detectCategoryAlert(
        categoryName: string,
        currentTotal: number,
        historicalMonthlyTotals: Record<string, number>[] // Array of { [categoryName]: amount }
    ): AnomalyResult {
        const categoryHistory = historicalMonthlyTotals
            .map(month => month[categoryName] || 0)
            .filter(amt => amt > 0)

        if (categoryHistory.length < 2) return { isAnomaly: false }

        const avg = categoryHistory.reduce((acc, amt) => acc + amt, 0) / categoryHistory.length

        if (currentTotal > avg * 1.2) {
            return {
                isAnomaly: true,
                averageAmount: avg,
                type: 'category_overrun',
                difference: ((currentTotal - avg) / avg) * 100
            }
        }

        return { isAnomaly: false }
    }
}
