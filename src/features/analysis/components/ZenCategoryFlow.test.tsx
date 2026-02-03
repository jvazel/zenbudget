import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ZenCategoryFlow } from './ZenCategoryFlow'
import { transactionService } from '../../../services/transactionService'

// Mock transactionService
vi.mock('../../../services/transactionService', () => ({
    transactionService: {
        getCategoryTrends: vi.fn()
    }
}))

describe('ZenCategoryFlow', () => {
    it('renders loading state initially', () => {
        (transactionService.getCategoryTrends as any).mockResolvedValue([])
        render(<ZenCategoryFlow />)
        expect(screen.getByText('Chargement du flux...')).toBeDefined()
    })

    it('renders empty state when no data', async () => {
        (transactionService.getCategoryTrends as any).mockResolvedValue([
            { month: 'Jan', fullMonth: 'Janvier', categories: { 'Loisirs': 0 } }
        ])

        render(<ZenCategoryFlow />)

        await waitFor(() => {
            expect(screen.getByText('Aucun flux détecté')).toBeDefined()
            expect(screen.getByText('Le calme plat...')).toBeDefined()
        })
    })

    it('renders chart when data exists', async () => {
        (transactionService.getCategoryTrends as any).mockResolvedValue([
            { month: 'Jan', fullMonth: 'Janvier', categories: { 'Loisirs': 100 } }
        ])

        render(<ZenCategoryFlow />)

        await waitFor(() => {
            expect(screen.getByText('Fleuve des Flux')).toBeDefined()
            expect(screen.getByText('Loisirs')).toBeDefined()
        })
    })

    it('toggles view mode', async () => {
        (transactionService.getCategoryTrends as any).mockResolvedValue([])

        render(<ZenCategoryFlow />)

        const button = await screen.findByRole('button')
        expect(button.textContent).toContain('Dépenses')

        fireEvent.click(button)

        await waitFor(() => {
            expect(button.textContent).toContain('Recettes')
            expect(transactionService.getCategoryTrends).toHaveBeenCalledWith(6, 'income')
        })
    })
})
