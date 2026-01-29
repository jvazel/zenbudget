import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transactionService } from './transactionService'

// Mock Supabase with hoisting
const { mockSupabase } = vi.hoisted(() => {
    return {
        mockSupabase: {
            auth: {
                getUser: vi.fn()
            },
            from: vi.fn(),
            channel: vi.fn(() => ({
                on: vi.fn().mockReturnThis(),
                subscribe: vi.fn()
            })),
            removeChannel: vi.fn()
        }
    }
})

// Mock lib/supabase
vi.mock('../lib/supabase', () => ({
    supabase: mockSupabase,
    isConfigured: true
}))

describe('transactionService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('getDashboardStats', () => {
        it('calculates stats correctly', async () => {
            const mockTransactions = [
                { amount: 1000 },
                { amount: 500 },
                { amount: -200 },
                { amount: -300 }
            ]

            const mockSavings = [
                { current_amount: 150 },
                { current_amount: 50 }
            ]

            // Mock strict implementation for the service calls
            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'transactions') {
                    return {
                        select: () => ({
                            eq: () => ({
                                gte: () => ({
                                    lte: () => Promise.resolve({ data: mockTransactions, error: null })
                                })
                            })
                        })
                    }
                }
                if (table === 'savings_goals') {
                    return {
                        select: () => Promise.resolve({ data: mockSavings, error: null })
                    }
                }
                return {}
            })

            const stats = await transactionService.getDashboardStats()

            expect(stats.income).toBe(1500)
            expect(stats.expenses).toBe(500)
            // RAV: 1500 - 500 - 200 = 800
            expect(stats.rav).toBe(800)
        })

        it('handles errors gracefully', async () => {
            mockSupabase.from.mockImplementation(() => {
                return {
                    select: () => ({
                        eq: () => ({
                            gte: () => ({
                                lte: () => Promise.resolve({ data: null, error: new Error('DB Error') })
                            })
                        })
                    })
                }
            })

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

            const stats = await transactionService.getDashboardStats()

            expect(stats).toEqual({ income: 0, expenses: 0, rav: 0 })
            expect(consoleSpy).toHaveBeenCalled()
            consoleSpy.mockRestore()
        })
    })
})
