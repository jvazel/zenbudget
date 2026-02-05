import { render, screen } from '@testing-library/react'
import { TransactionCard } from './TransactionCard'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

// Mock icons
vi.mock('lucide-react', () => {
    const icons = [
        'Zap', 'X', 'Check', 'ShoppingBag', 'Coffee', 'Car', 'Home', 'Heart', 'Sparkles', 'Tag', 'TrendingUp', 'RefreshCw',
        'GraduationCap', 'Dumbbell', 'Plane', 'Gift', 'Music', 'Gamepad2', 'Briefcase', 'Stethoscope', 'Utensils', 'Wifi',
        'Smartphone', 'PiggyBank', 'Receipt', 'Wrench', 'Baby', 'PawPrint', 'Bus', 'Train', 'BookOpen', 'Film', 'Camera',
        'Palette', 'Hammer', 'Leaf', 'DollarSign', 'Percent'
    ]
    const mocks: any = {}
    icons.forEach(icon => {
        mocks[icon] = () => <div data-testid={`icon-${icon.toLowerCase()}`} />
    })
    return mocks
})

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
