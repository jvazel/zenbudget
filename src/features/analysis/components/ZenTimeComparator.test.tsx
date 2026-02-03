import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ZenTimeComparator } from './ZenTimeComparator'
import { transactionService } from '../../../services/transactionService'

// Mock transactionService
vi.mock('../../../services/transactionService', () => ({
    transactionService: {
        getMonthlyHistory: vi.fn()
    }
}))

describe('ZenTimeComparator', () => {
    it('renders empty state correctly (Hourglass)', async () => {
        (transactionService.getMonthlyHistory as any).mockResolvedValue([])

        render(<ZenTimeComparator />)

        await waitFor(() => {
            expect(screen.getByText('Machine à remonter le temps...')).toBeDefined()
            expect(screen.getByText('En attente de données historiques')).toBeDefined()
        })
    })

    it('renders history bars and correct analysis', async () => {
        const mockHistory = [
            { month: 'Jan', fullMonth: 'Janvier', amount: 1000, isCurrent: false },
            { month: 'Feb', fullMonth: 'Février', amount: 1100, isCurrent: false },
            { month: 'Mar', fullMonth: 'Mars', amount: 1050, isCurrent: false },
            { month: 'Apr', fullMonth: 'Avril', amount: 1000, isCurrent: true } // Current month is low (Zen)
        ]

            ; (transactionService.getMonthlyHistory as any).mockResolvedValue(mockHistory)

        render(<ZenTimeComparator />)

        await waitFor(() => {
            expect(screen.getByText('Voyage Temporel')).toBeDefined()
            expect(screen.getByText('Vitesse de croisière')).toBeDefined() // Zen message
            expect(screen.getByText('Jan')).toBeDefined()
            expect(screen.getByText('Apr')).toBeDefined()
        })
    })

    it('renders turbulence warning if current month is high', async () => {
        const mockHistory = [
            { month: 'Jan', fullMonth: 'Janvier', amount: 1000, isCurrent: false },
            { month: 'Feb', fullMonth: 'Février', amount: 1100, isCurrent: false },
            { month: 'Mar', fullMonth: 'Mars', amount: 1050, isCurrent: false },
            { month: 'Apr', fullMonth: 'Avril', amount: 2000, isCurrent: true } // Current month is high
        ]

            ; (transactionService.getMonthlyHistory as any).mockResolvedValue(mockHistory)

        render(<ZenTimeComparator />)

        await waitFor(() => {
            expect(screen.getByText('Légère turbulence')).toBeDefined()
        })
    })
})
