import { describe, it, expect } from 'vitest'
import { analysisService } from './analysisService'
import { type Transaction } from '../features/inbox/components/TransactionCard'

describe('analysisService', () => {
    const history: Transaction[] = [
        { id: '1', description: 'Netflix', amount: -15, predicted_category: 'Loisirs', date: '01 Jan' },
        { id: '2', description: 'Netflix Premium', amount: -15, predicted_category: 'Loisirs', date: '01 Feb' },
        { id: '3', description: 'Netflix', amount: -15, predicted_category: 'Loisirs', date: '01 Mar' },
    ]

    describe('detectAnomaly', () => {
        it('returns false for income', () => {
            const income: Transaction = { id: '4', description: 'Salaire', amount: 2000, predicted_category: 'Salaire', date: '01 Apr' }
            expect(analysisService.detectAnomaly(income, history).isAnomaly).toBe(false)
        })

        it('returns false for normal expenses', () => {
            const normal: Transaction = { id: '5', description: 'Netflix', amount: -16, predicted_category: 'Loisirs', date: '01 Apr' } // < 30% increase
            expect(analysisService.detectAnomaly(normal, history).isAnomaly).toBe(false)
        })

        it('detects a price spike (> 30%)', () => {
            const spike: Transaction = { id: '6', description: 'Netflix', amount: -21, predicted_category: 'Loisirs', date: '01 Apr' } // 15 * 1.3 = 19.5. 21 is more.
            const result = analysisService.detectAnomaly(spike, history)
            expect(result.isAnomaly).toBe(true)
            expect(result.type).toBe('price_spike')
            expect(result.averageAmount).toBe(15)
        })

        it('returns false if not enough history', () => {
            const unique: Transaction = { id: '7', description: 'New Shop', amount: -100, predicted_category: 'Autres', date: '01 Apr' }
            expect(analysisService.detectAnomaly(unique, history).isAnomaly).toBe(false)
        })
    })

    describe('detectCategoryAlert', () => {
        const historicalTotals = [
            { 'Loisirs': 100, 'Alimentation': 400 },
            { 'Loisirs': 110, 'Alimentation': 420 },
            { 'Loisirs': 90, 'Alimentation': 380 },
        ]

        it('detects category overrun (> 20%)', () => {
            const overrun = 130 // Avg (100+110+90)/3 = 100. 100 * 1.2 = 120.
            const result = analysisService.detectCategoryAlert('Loisirs', overrun, historicalTotals)
            expect(result.isAnomaly).toBe(true)
            expect(result.type).toBe('category_overrun')
            expect(result.averageAmount).toBe(100)
        })

        it('returns false for normal category spending', () => {
            const normal = 115
            expect(analysisService.detectCategoryAlert('Loisirs', normal, historicalTotals).isAnomaly).toBe(false)
        })
    })
})
