import { describe, it, expect, vi } from 'vitest'
import { bankingService } from './bankingService'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
    supabase: {
        functions: {
            invoke: vi.fn()
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            upsert: vi.fn().mockReturnThis()
        }))
    }
}))

import { supabase } from '../lib/supabase'

describe('BankingService', () => {
    it('should correctly map Enable Banking transactions to ZenBudget model', async () => {
        const mockTransactions = [
            {
                transaction_id: 'tx-123',
                booking_date: '2026-02-01',
                transaction_amount: { amount: '-45.50', currency: 'EUR' },
                remittance_information_unstructured: 'Boulangerie Zen'
            }
        ]

        vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
            data: { transactions: mockTransactions },
            error: null
        } as any)

        const transactions = await bankingService.syncTransactions('acc-1', 'ext-1', 'sess-1')

        expect(transactions).toHaveLength(1)
        expect(transactions[0].amount).toBe(-45.5)
        expect(transactions[0].description).toBe('Boulangerie Zen')
        expect(transactions[0].raw_date).toBe('2026-02-01')
        expect(transactions[0].external_id).toBe('tx-123')
        expect(transactions[0].status).toBe('pending')
    })
})
