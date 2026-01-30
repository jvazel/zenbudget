import { describe, it, expect, vi, beforeEach } from 'vitest'
import { projectionService } from './projectionService'

// Mock Supabase
const { mockSupabase } = vi.hoisted(() => {
    return {
        mockSupabase: {
            from: vi.fn()
        }
    }
})

vi.mock('../lib/supabase', () => ({
    supabase: mockSupabase
}))

describe('projectionService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.useFakeTimers()
    })

    it('should project a transaction for next month (mid-month case)', async () => {
        const today = new Date('2026-05-15T12:00:00Z')
        vi.setSystemTime(today)

        const lastTxDate = new Date('2026-04-15T12:00:00Z')

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'transaction_patterns') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({
                            data: [{
                                pattern_text: 'NETFLIX',
                                category_id: 'cat-1',
                                categories: { name: 'Loisirs', icon: 'Zap', color: '#ff0000' }
                            }],
                            error: null
                        })
                    })
                }
            }
            if (table === 'transactions') {
                return {
                    select: () => ({
                        ilike: () => ({
                            order: () => ({
                                limit: () => ({
                                    maybeSingle: () => Promise.resolve({
                                        data: {
                                            transaction_date: lastTxDate.toISOString().split('T')[0],
                                            amount: -17.99,
                                            description: 'Netflix.com'
                                        },
                                        error: null
                                    })
                                })
                            })
                        })
                    })
                }
            }
            return {}
        })

        const projections = await projectionService.getUpcomingProjections()

        expect(projections.length).toBe(1)
        expect(projections[0].description).toBe('Netflix.com')
        // nextDate should be 2026-06-15 (since May 15 is today)
        expect(projections[0].due_date).toBe('2026-06-15')
    })

    it('should not project if next date is beyond the 32-day window', async () => {
        const today = new Date('2026-05-15T12:00:00Z')
        vi.setSystemTime(today)

        // If last was March 15. Next is April 15 (past), next next is May 15 (past), next next next is June 15 (future).
        // Wait, Jan 1st. Today May 15.
        // Jan 1 -> Feb 1 -> March 1 -> April 1 -> May 1 -> June 1.
        // June 1 is 17 days from May 15. So it SHOULD project.

        // Let's test "beyond window".
        // Today May 15. Window ends June 16.

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'transaction_patterns') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({
                            data: [{ pattern_text: 'DISTANT', category_id: 'cat-1', categories: {} }],
                            error: null
                        })
                    })
                }
            }
            if (table === 'transactions') {
                return {
                    select: () => ({
                        ilike: () => ({
                            order: () => ({
                                limit: () => ({
                                    maybeSingle: () => Promise.resolve({
                                        data: { transaction_date: '2026-07-01', amount: -10 },
                                        error: null
                                    })
                                })
                            })
                        })
                    })
                }
            }
            return {}
        })

        const projections = await projectionService.getUpcomingProjections()
        expect(projections.length).toBe(0)
    })

    it('should detect an overdraft in projections', async () => {
        // Mock current balance as $100
        // Recurring expense of $150
        vi.setSystemTime(new Date('2026-05-15T12:00:00Z'))

        mockSupabase.from.mockImplementation((table: string) => {
            if (table === 'transaction_patterns') {
                return {
                    select: () => ({
                        eq: () => Promise.resolve({
                            data: [{ pattern_text: 'RENT', category_id: 'cat-1', categories: { name: 'Rent', icon: 'Home', color: 'blue' } }],
                            error: null
                        })
                    })
                }
            }
            if (table === 'transactions') {
                return {
                    select: () => ({
                        ilike: () => ({
                            order: () => ({
                                limit: () => ({
                                    maybeSingle: () => {
                                        return Promise.resolve({
                                            data: { transaction_date: '2026-05-01', amount: -150, description: 'RENT' },
                                            error: null
                                        })
                                    }
                                })
                            })
                        }),
                        eq: () => Promise.resolve({
                            data: [{ amount: 100 }], // Initial balance
                            error: null
                        })
                    })
                }
            }
            return {}
        })

        const alerts = await projectionService.getProjectedAlerts()
        expect(alerts.length).toBe(1)
        expect(alerts[0].type).toBe('overdraft')
        expect(alerts[0].amount).toBe(-50) // 100 - 150
    })
})
