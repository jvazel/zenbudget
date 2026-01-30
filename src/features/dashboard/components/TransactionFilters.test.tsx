import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionFilters } from './TransactionFilters'
import { describe, it, expect, vi } from 'vitest'

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Search: () => <div data-testid="search-icon" />,
    X: () => <div data-testid="x-icon" />,
    Filter: () => <div data-testid="filter-icon" />
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>
    }
}))

describe('TransactionFilters', () => {
    const defaultProps = {
        searchQuery: '',
        setSearchQuery: vi.fn(),
        selectedCategoryIds: [],
        setSelectedCategoryIds: vi.fn(),
        categories: [
            { id: 'cat-1', name: 'Alimentation', icon: 'food', color: '#ff0000', owner_id: 'user-1', budget_limit: 500, type: 'expense' as const, created_at: new Date().toISOString() },
            { id: 'cat-2', name: 'Loisirs', icon: 'fun', color: '#00ff00', owner_id: 'user-1', budget_limit: 200, type: 'expense' as const, created_at: new Date().toISOString() }
        ],
        showFilters: true,
        setShowFilters: vi.fn()
    }

    it('renders search input when showFilters is true', () => {
        render(<TransactionFilters {...defaultProps} />)
        expect(screen.getByPlaceholderText('Rechercher une transaction...')).toBeInTheDocument()
    })

    it('calls setSearchQuery when typing in the search input', () => {
        render(<TransactionFilters {...defaultProps} />)
        const input = screen.getByPlaceholderText('Rechercher une transaction...')
        fireEvent.change(input, { target: { value: 'Courses' } })
        expect(defaultProps.setSearchQuery).toHaveBeenCalledWith('Courses')
    })

    it('renders category chips and calls setSelectedCategoryIds on click', () => {
        render(<TransactionFilters {...defaultProps} />)
        const chip = screen.getByText('Alimentation')
        fireEvent.click(chip)

        // Check if the state update function is called
        expect(defaultProps.setSelectedCategoryIds).toHaveBeenCalled()
        const updateFn = (defaultProps.setSelectedCategoryIds as any).mock.calls[0][0]
        expect(updateFn([])).toEqual(['cat-1'])
    })

    it('calls clear filters when "Effacer les filtres" is clicked', () => {
        const propsWithFilters = {
            ...defaultProps,
            searchQuery: 'Some query'
        }
        render(<TransactionFilters {...propsWithFilters} />)
        const clearBtn = screen.getByText('Effacer les filtres')
        fireEvent.click(clearBtn)

        expect(defaultProps.setSearchQuery).toHaveBeenCalledWith('')
        expect(defaultProps.setSelectedCategoryIds).toHaveBeenCalledWith([])
    })

    it('toggles filters visibility when clicking filter icon', () => {
        render(<TransactionFilters {...defaultProps} />)
        const filterBtn = screen.getByTestId('filter-icon').parentElement!
        fireEvent.click(filterBtn)
        expect(defaultProps.setShowFilters).toHaveBeenCalledWith(false)
    })
})
