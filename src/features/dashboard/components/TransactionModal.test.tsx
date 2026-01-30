import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { TransactionModal } from './TransactionModal'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { patternService } from '../../../services/patternService'
import { categoryService } from '../../../services/categoryService'
import React from 'react'

// Mock Services
vi.mock('../../../services/transactionService', () => ({
    transactionService: {
        createManualTransaction: vi.fn(),
        updateManualTransaction: vi.fn()
    }
}))

vi.mock('../../../services/categoryService', () => ({
    categoryService: {
        getCategoriesByType: vi.fn()
    }
}))

vi.mock('../../../services/patternService', () => ({
    patternService: {
        findPattern: vi.fn(),
        learnPattern: vi.fn()
    }
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
    X: () => <div />,
    Plus: () => <div />,
    Calendar: () => <div />,
    Tag: () => <div />,
    CreditCard: () => <div />,
    Loader2: () => <div />,
    Sparkles: () => <div data-testid="sparkles-icon" />
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
    }
}))

describe('TransactionModal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
            // vi.useFakeTimers() // Moved to individual tests if needed

            // Default categories
            ; (categoryService.getCategoriesByType as any).mockResolvedValue([
                { id: 'cat-1', name: 'Alimentation', icon: 'food' },
                { id: 'cat-2', name: 'Loisirs', icon: 'fun' }
            ])
    })

    afterEach(() => {
        // vi.useRealTimers()
    })

    it('should trigger pattern search when description changes', async () => {
        // Real timers for stability with debounce
        render(<TransactionModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)

        await waitFor(() => {
            expect(categoryService.getCategoriesByType).toHaveBeenCalled()
        })

        const input = screen.getByPlaceholderText('ex: Courses Monoprix...')
        fireEvent.change(input, { target: { value: 'NETFLIX' } })

        // Should debounce - wait a bit but less than 800ms
        await new Promise(r => setTimeout(r, 200))
        expect(patternService.findPattern).not.toHaveBeenCalled()

        // Wait full duration + buffer
        await new Promise(r => setTimeout(r, 1000))

        await waitFor(() => {
            expect(patternService.findPattern).toHaveBeenCalledWith('NETFLIX')
        }, { timeout: 3000 })
    })

    it('should auto-select category and show icon on match', async () => {
        ; (patternService.findPattern as any).mockResolvedValue({ categoryId: 'cat-2' }) // Loisirs

        render(<TransactionModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)

        await waitFor(() => expect(categoryService.getCategoriesByType).toHaveBeenCalled())

        const input = screen.getByPlaceholderText('ex: Courses Monoprix...')
        fireEvent.change(input, { target: { value: 'NETFLIX' } })

        // Wait for debounce and async resolution
        await new Promise(r => setTimeout(r, 1200))

        // Check auto-selection
        await waitFor(() => {
            const select = screen.getByRole('combobox') as HTMLSelectElement
            expect(select.value).toBe('cat-2')
        })

        // Check "Zen Suggestion" icon
        expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
    })

    it('should learn pattern on submission', async () => {
        // No need for fake timers here?
        // Submitting calls `learnPattern`.
        render(<TransactionModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />)

        await waitFor(() => expect(categoryService.getCategoriesByType).toHaveBeenCalled())

        fireEvent.change(screen.getByPlaceholderText('ex: Courses Monoprix...'), { target: { value: 'NEW PATTERN' } })
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '10' } })

        // Submit
        const submitBtn = screen.getByText('Ajouter')
        await act(async () => {
            fireEvent.click(submitBtn)
        })

        await waitFor(() => {
            expect(patternService.learnPattern).toHaveBeenCalledWith('NEW PATTERN', 'cat-1')
        })
    })
})
