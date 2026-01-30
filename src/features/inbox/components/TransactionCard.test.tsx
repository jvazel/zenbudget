import { render, screen } from '@testing-library/react'
import { TransactionCard } from './TransactionCard'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

// Mock icons
vi.mock('lucide-react', () => ({
    Zap: () => <div data-testid="icon-zap" />,
    X: () => <div data-testid="icon-x" />,
    Check: () => <div data-testid="icon-check" />,
    ShoppingBag: () => <div data-testid="icon-bag" />,
    TrendingUp: () => <div data-testid="icon-trending" />,
    Coffee: () => <div />,
    Car: () => <div />,
    Home: () => <div />,
    Heart: () => <div />,
    Sparkles: () => <div data-testid="sparkles-icon" />,
    Tag: () => <div />,
    RefreshCw: () => <div />
}))

// Mock patternService
vi.mock('../../../services/patternService', () => ({
    patternService: {
        findPattern: vi.fn(() => Promise.resolve(null)),
        learnPattern: vi.fn(() => Promise.resolve()),
        toggleAutoValidation: vi.fn(() => Promise.resolve())
    }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, style, ...props }: any) => <div style={style} {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>
    },
    useMotionValue: () => ({ get: () => 0, set: () => { }, onChange: () => { }, on: () => { return () => { } } }),
    useTransform: () => ({ get: () => 0 }),
    AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('TransactionCard', () => {
    const mockTransaction = {
        id: 't1',
        description: 'Netflix',
        amount: -17.99,
        predicted_category: 'Loisirs',
        category_icon: 'Sparkles',
        category_color: 'red',
        date: '20 Jan',
        isval_zen_suggestion: false
    }

    it('renders basic transaction info', () => {
        render(<TransactionCard transaction={mockTransaction} onSwipe={vi.fn()} isFront={true} />)
        expect(screen.getByText('Netflix')).toBeInTheDocument()
        expect(screen.getByText('-17,99€')).toBeInTheDocument()
    })

    it('shows ZEN suggestion badge when flag is true', () => {
        render(<TransactionCard transaction={{ ...mockTransaction, isval_zen_suggestion: true }} onSwipe={vi.fn()} isFront={true} />)
        expect(screen.getByTitle('Suggéré par le Majordome Zen')).toBeInTheDocument()
    })

    it('hides ZEN suggestion badge when flag is false', () => {
        render(<TransactionCard transaction={{ ...mockTransaction, isval_zen_suggestion: false }} onSwipe={vi.fn()} isFront={true} />)
        expect(screen.queryByText('ZEN')).not.toBeInTheDocument()
    })
})
