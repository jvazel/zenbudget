import { describe, it, expect, vi, beforeEach } from 'vitest'
import { simulationService, useSimulationStore } from './simulationService'
import { transactionService } from './transactionService'
import { projectionService } from './projectionService'

vi.mock('./transactionService')
vi.mock('./projectionService')
vi.mock('../lib/supabase', () => ({
    supabase: {},
    isConfigured: true
}))

describe('simulationService', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        useSimulationStore.setState({
            scenarios: [{ id: 'test-scenario', name: 'Test', events: [] }],
            activeScenarioId: 'test-scenario',
            isSimulationMode: true
        })
    })

    it('should project a one-off simulation event correctly', async () => {
        vi.mocked(transactionService.getTotalBalance).mockResolvedValue(1000)
        vi.mocked(projectionService.getUpcomingProjections).mockResolvedValue([])

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dateStr = tomorrow.toISOString().split('T')[0]

        useSimulationStore.getState().addEventToScenario('test-scenario', {
            description: 'One-off Expense',
            amount: -500,
            date: dateStr,
            type: 'one-off'
        })

        const history = await simulationService.getSimulatedBalanceHistory(2)

        // J0: 1000
        // J1: 1000 - 500 = 500
        // J2: 500
        expect(history[0].balance).toBe(1000)
        expect(history[1].balance).toBe(500)
        expect(history[2].balance).toBe(500)
    })

    it('should project recurring events correctly', async () => {
        vi.mocked(transactionService.getTotalBalance).mockResolvedValue(1000)
        vi.mocked(projectionService.getUpcomingProjections).mockResolvedValue([])

        const today = new Date()
        const dateStr = today.toISOString().split('T')[0]

        useSimulationStore.getState().addEventToScenario('test-scenario', {
            description: 'Monthly Bonus',
            amount: 100,
            date: dateStr,
            type: 'recurring',
            frequency: 'monthly'
        })

        const history = await simulationService.getSimulatedBalanceHistory(40) // Over 1 month

        // Should have 2 bonus applications (Day 0 and Day 30/31)
        const initial = history[0].balance
        const final = history[history.length - 1].balance

        expect(initial).toBe(1100) // 1000 + 100 (today)
        expect(final).toBe(1200) // 1100 + 100 (next month)
    })
})
