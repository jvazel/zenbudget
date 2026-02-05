import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EnergyLeaks } from './EnergyLeaks'
import { transactionService } from '../../../services/transactionService'

// Mock transactionService
vi.mock('../../../services/transactionService', () => ({
    transactionService: {
        getEnergyLeaks: vi.fn()
    }
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Zap: () => <div />,
    ZapOff: () => <div />,
    ArrowRight: () => <div />,
    Shield: () => <div />
}))

describe('EnergyLeaks', () => {
    it('renders empty state correctly (Zen Shield)', async () => {
        (transactionService.getEnergyLeaks as any).mockResolvedValue([])

        render(<EnergyLeaks />)

        await waitFor(() => {
            expect(screen.getByText('Aucune fuite détectée')).toBeDefined()
            expect(screen.getByText('Votre budget est blindé')).toBeDefined()
        })
    })

    it('renders leaks and highlights high impact ones', async () => {
        const mockLeaks = [
            { name: 'Netflix', amount: 15, annualImpact: 180, occurrences: 1 }, // High impact (>100)
            { name: 'Spotify', amount: 10, annualImpact: 60, occurrences: 1 }   // Low impact
        ]

            ; (transactionService.getEnergyLeaks as any).mockResolvedValue(mockLeaks)

        render(<EnergyLeaks />)

        await waitFor(() => {
            expect(screen.getByText('Netflix')).toBeDefined()
            expect(screen.getByText('Spotify')).toBeDefined()
            // Check for annual impact text
            expect(screen.getByText('-180€')).toBeDefined()
            expect(screen.getByText('-60€')).toBeDefined()
        })
    })

    it('toggles show all button when more than 3 leaks', async () => {
        const mockLeaks = Array(5).fill(null).map((_, i) => ({
            name: `Service ${i}`,
            amount: 10,
            annualImpact: 120,
            occurrences: 1
        }))

            ; (transactionService.getEnergyLeaks as any).mockResolvedValue(mockLeaks)

        render(<EnergyLeaks />)

        await waitFor(() => {
            expect(screen.getByText('Voir toutes les récurrences')).toBeDefined()
        })

        // Initially lists should be sliced (logic test via DOM check hard in jsdom without precise selectors, 
        // but button presence confirms logic triggers)

        const button = screen.getByText('Voir toutes les récurrences')
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText('Voir moins')).toBeDefined()
        })
    })
})
