import { describe, it, expect, vi } from 'vitest'
import { transactionService } from './transactionService'

// Mock dependencies
vi.mock('../lib/supabase', () => ({
    supabase: {},
    isConfigured: false // Use mock data
}))

describe('transactionService.getBankingFees', () => {
    it('should detect banking fees based on keywords', async () => {
        // We rely on the internal mock history generator for this test
        // since isConfigured is false.
        const result = await transactionService.getBankingFees()

        expect(result).toBeDefined()
        expect(result.totalMonthly).toBeGreaterThanOrEqual(0)
        expect(result.projectedAnnual).toBe(result.totalMonthly * 12)

        // Check if detected transactions match keywords
        const feeKeywords = ['commission', 'agios', 'frais', 'cotisation', 'interets debiteurs', 'tenue de compte']
        result.transactions.forEach(t => {
            const desc = t.description.toLowerCase()
            const found = feeKeywords.some(kw => desc.includes(kw))
            expect(found).toBe(true)
            expect(t.amount).toBeLessThan(0)
        })
    })
})
