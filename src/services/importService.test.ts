import { importService } from './importService'
import { describe, it, expect } from 'vitest'

describe('importService', () => {
    describe('parseCSV', () => {
        it('should correctly parse a standard CSV with semicolon', async () => {
            const csv = 'Date;Description;Montant\n01/01/2026;Monoprix;-45.20\n02/01/2026;Salaire;2500.00'
            const result = await importService.parseCSV(csv)

            expect(result).toHaveLength(2)
            expect(result[0]).toEqual({
                date: '01/01/2026',
                description: 'Monoprix',
                amount: -45.2
            })
        })

        it('should correctly parse a CSV with commas and quotes', async () => {
            const csv = 'date,label,amount\n"2026-01-01","Uber Trip",-15.50\n"2026-01-02","Netflix",-17.99'
            const result = await importService.parseCSV(csv)

            expect(result).toHaveLength(2)
            expect(result[0].description).toBe('Uber Trip')
            expect(result[1].amount).toBe(-17.99)
        })

        it('should throw error on invalid format', async () => {
            const csv = 'Invalid;Header;Only\nValue;Value;Value'
            await expect(importService.parseCSV(csv)).rejects.toThrow('Format CSV non reconnu')
        })
    })

    describe('parseJSON', () => {
        it('should correctly parse a JSON array', async () => {
            const json = JSON.stringify([
                { date: '2026-01-01', description: 'Test 1', amount: -10 },
                { transaction_date: '2026-01-02', label: 'Test 2', montant: -20 }
            ])
            const result = await importService.parseJSON(json)

            expect(result).toHaveLength(2)
            expect(result[0].amount).toBe(-10)
            expect(result[1].description).toBe('Test 2')
        })
    })
})
