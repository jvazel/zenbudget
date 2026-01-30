import { exportService } from './exportService'
import { describe, it, expect } from 'vitest'
import { type Transaction } from '../features/inbox/components/TransactionCard'

describe('exportService', () => {
    it('should generate valid semicolon-separated CSV string', () => {
        const transactions: Transaction[] = [
            { id: '1', description: 'Monoprix', amount: -45.20, date: '01/01/2026', raw_date: '2026-01-01', predicted_category: 'Alimentation', status: 'validated' },
            { id: '2', description: 'Salaire', amount: 2500, date: '02/01/2026', raw_date: '2026-01-02', predicted_category: 'Revenu', status: 'validated', validated_by_name: 'Johann' }
        ]

        const csv = exportService.convertToCSV(transactions)
        const lines = csv.split('\n')

        expect(lines[0]).toBe('Date;Description;Montant;Devise;Catégorie;Validé par')
        expect(lines[1]).toContain('01/01/2026')
        expect(lines[1]).toContain('"Monoprix"')
        expect(lines[1]).toContain('-45,2')
        expect(lines[2]).toContain('Johann')
        expect(lines[2]).toContain('Revenu')
    })

    it('should escape quotes in descriptions', () => {
        const transactions: Transaction[] = [
            { id: '1', description: 'Dinner at "Le Zen"', amount: -50, date: '01/01', raw_date: '2026-01-01', status: 'validated', predicted_category: 'Loisirs' }
        ]
        const csv = exportService.convertToCSV(transactions)
        expect(csv).toContain('"Dinner at ""Le Zen"""')
    })
})
