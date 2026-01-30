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

vi.mock('../lib/supabase', () => ({
    supabase: mockSupabase,
    isConfigured: true
}))

// Mock patternService
vi.mock('./patternService', () => ({
    patternService: {
        findPattern: vi.fn().mockResolvedValue(null),
        learnPattern: vi.fn().mockResolvedValue(true),
        toggleAutoValidation: vi.fn().mockResolvedValue(true)
    }
}))

import { patternService } from './patternService'

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

    describe('getSubscriptions', () => {
        it('detects recurring transactions from mock data', async () => {
            const subs = await transactionService.getSubscriptions()
            expect(subs.length).toBeGreaterThan(0)

            // Should detect "Loyer Zen Appt" as it repeats in mock history
            const rent = subs.find(s => s.name.includes('Loyer'))
            expect(rent).toBeDefined()
            expect(rent?.occurrences).toBeGreaterThanOrEqual(2)
        })
    })

    describe('getTrendData', () => {
        it('identifies trends and inflation from mock data', async () => {
            const trends = await transactionService.getTrendData()
            expect(trends.length).toBeGreaterThan(0)

            const item = trends[0]
            expect(item.data.length).toBe(6)
            expect(item.trend).toBeTypeOf('number')
            expect(item).toHaveProperty('isInflation')
        })
    })

    describe('getSavingsPotential', () => {
        it('calculates total potential correctly', async () => {
            const potential = await transactionService.getSavingsPotential()
            expect(potential).toHaveProperty('surplus')
            expect(potential).toHaveProperty('optimizable')
            expect(potential.total).toBe(potential.surplus + potential.optimizable)
        })
    })

    describe('importTransactions', () => {
        it('auto-validates transactions matching an auto-validate pattern', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })

            // Setup specific mock for this test
            const insertFn = vi.fn().mockResolvedValue({ error: null })
            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'accounts') return { select: () => ({ eq: () => ({ limit: () => ({ maybeSingle: () => Promise.resolve({ data: { id: 'acc-1' } }) }) }) }) }
                if (table === 'transactions') return {
                    select: () => ({ gte: () => Promise.resolve({ data: [], error: null }) }),
                    insert: insertFn
                }
                return {}
            })

            // Mock pattern match with auto-validation
            vi.mocked(patternService.findPattern).mockResolvedValue({
                categoryId: 'cat-auto',
                isAutoValidated: true
            })

            const imported = [
                { date: '2026-01-01', description: 'Netflix', amount: -17.99 }
            ]

            const result = await transactionService.importTransactions(imported)

            expect(result.importedCount).toBe(1)
            expect(result.autoValidatedCount).toBe(1)

            const insertedData = insertFn.mock.calls[0][0] as any[]
            expect(insertedData[0].status).toBe('validated')
            expect(insertedData[0].category_id).toBe('cat-auto')
        })
    })
})
