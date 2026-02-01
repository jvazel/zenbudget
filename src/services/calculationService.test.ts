import { expect, test, describe } from 'vitest'
import { calculationService } from './calculationService'
import { type ProjectedTransaction } from './projectionService'

describe('calculationService', () => {
    test('calculateRAV should correctly subtract expenses and savings from income', () => {
        const result = calculationService.calculateRAV(3000, 1500, 500)
        expect(result).toBe(1000)
    })

    test('projectBalanceHistory should correctly aggregate daily projections', () => {
        const formatDate = (d: Date) => [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')
        ].join('-')

        const todayDate = new Date()
        const today = formatDate(todayDate)

        const tomorrowDate = new Date()
        tomorrowDate.setDate(tomorrowDate.getDate() + 1)
        const tomorrow = formatDate(tomorrowDate)

        const mocks: ProjectedTransaction[] = [
            { id: '1', description: 'Rent', amount: -1000, due_date: today, days_until: 0, category_id: '1', category_name: 'Rent', category_icon: 'home', category_color: 'blue' },
            { id: '2', description: 'Netflix', amount: -20, due_date: tomorrow, days_until: 1, category_id: '2', category_name: 'Subs', category_icon: 'tv', category_color: 'red' }
        ]

        const history = calculationService.projectBalanceHistory(2000, mocks, 2)

        expect(history[0].balance).toBe(1000) // 2000 - 1000 (today)
        expect(history[1].balance).toBe(980)  // 1000 - 20 (tomorrow)
        expect(history[2].balance).toBe(980)  // Day 2 (no change)
    })

    test('detectOverdraft should find the first negative balance point', () => {
        const history = [
            { date: '2024-01-01', balance: 100 },
            { date: '2024-01-02', balance: -50 },
            { date: '2024-01-03', balance: -200 }
        ]

        const alert = calculationService.detectOverdraft(history)
        expect(alert).not.toBeNull()
        expect(alert?.date).toBe('2024-01-02')
        expect(alert?.amount).toBe(-50)
    })

    test('detectOverdraft should return null if no negative balance', () => {
        const history = [
            { date: '2024-01-01', balance: 100 },
            { date: '2024-01-02', balance: 50 }
        ]

        const alert = calculationService.detectOverdraft(history)
        expect(alert).toBeNull()
    })
})
