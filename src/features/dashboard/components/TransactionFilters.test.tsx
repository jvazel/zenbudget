import { render, screen, fireEvent } from '@testing-library/react'
import { TransactionFilters } from './TransactionFilters'
import { describe, it, expect, vi } from 'vitest'

// Mock lucide-react
vi.mock('lucide-react', () => ({
    Search: () => <div data-testid="search-icon" />,
    X: () => <div data-testid="x-icon" />,
    Filter: () => <div data-testid="filter-icon" />,
    Check: () => <div data-testid="check-icon" />
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
        search: '',
        onSearchChange: vi.fn(),
        categoryId: 'all',
        onCategoryChange: vi.fn(),
        checkStatus: 'all' as const,
        onCheckStatusChange: vi.fn(),
        categories: [
            { id: 'cat-1', name: 'Alimentation', icon: 'food', color: '#ff0000', owner_id: 'user-1', budget_limit: 500, type: 'expense' as const, created_at: new Date().toISOString() },
            { id: 'cat-2', name: 'Loisirs', icon: 'fun', color: '#00ff00', owner_id: 'user-1', budget_limit: 200, type: 'expense' as const, created_at: new Date().toISOString() }
        ]
    }

    it('renders search input', () => {
        render(<TransactionFilters {...defaultProps} />)
        expect(screen.getByPlaceholderText('Rechercher une transaction...')).toBeInTheDocument()
    })

    it('calls onSearchChange when typing in the search input', () => {
        render(<TransactionFilters {...defaultProps} />)
        const input = screen.getByPlaceholderText('Rechercher une transaction...')
        fireEvent.change(input, { target: { value: 'Courses' } })
        expect(defaultProps.onSearchChange).toHaveBeenCalledWith('Courses')
    })

    it('calls onCategoryChange when choosing a category', () => {
        render(<TransactionFilters {...defaultProps} />)
        const categorySelect = screen.getAllByRole('combobox')[0]
        fireEvent.change(categorySelect, { target: { value: 'cat-1' } })
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('cat-1')
    })

    it('calls onCheckStatusChange when choosing a check status', () => {
        render(<TransactionFilters {...defaultProps} />)
        const checkSelect = screen.getAllByRole('combobox')[1]
        fireEvent.change(checkSelect, { target: { value: 'checked' } })
        expect(defaultProps.onCheckStatusChange).toHaveBeenCalledWith('checked')
    })

    it('calls clear filters reset and calls all change handlers', () => {
        const propsWithFilters = {
            ...defaultProps,
            search: 'Some query',
            categoryId: 'cat-1',
            checkStatus: 'checked' as const
        }
        render(<TransactionFilters {...propsWithFilters} />)
        const clearBtn = screen.getByTitle('Réinitialiser les filtres')
        fireEvent.click(clearBtn)

        expect(defaultProps.onSearchChange).toHaveBeenCalledWith('')
        expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('all')
        expect(defaultProps.onCheckStatusChange).toHaveBeenCalledWith('all')
    })
})
