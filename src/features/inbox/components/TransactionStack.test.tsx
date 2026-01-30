import { render, screen, waitFor } from '@testing-library/react'
import { TransactionStack } from './TransactionStack'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transactionService } from '../../../services/transactionService'
import React from 'react'

// Manual Mocks
vi.mock('../../../services/transactionService', () => ({
    transactionService: {
        getPendingTransactions: vi.fn(),
        updateTransactionStatus: vi.fn(),
        importTransactions: vi.fn()
    }
}))

vi.mock('./TransactionCard', () => ({
    TransactionCard: () => <div data-testid="transaction-card">Card</div>
}))

vi.mock('./ZenSuccessState', () => ({
    ZenSuccessState: () => <div data-testid="success-state">Success</div>
}))

vi.mock('../../../stores/useNotificationStore', () => ({
    useNotificationStore: () => ({
        addNotification: vi.fn(),
        removeNotification: vi.fn(),
        notifications: []
    })
}))

vi.mock('../../auth/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'test-user', email: 'johann@zenbudget.app' },
        loading: false
    })
}))

vi.mock('lucide-react', () => ({
    ShieldCheck: () => <div />,
    Zap: () => <div />,
    Loader2: () => <div data-testid="loader">Loading...</div>,
    Upload: () => <div />,
    CheckCircle2: () => <div />
}))

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>
    }
}))

vi.mock('../../../lib/supabase', () => ({
    supabase: {
        channel: () => ({
            on: () => ({ subscribe: () => { } }),
            subscribe: () => { }
        }),
        removeChannel: () => { }
    }
}))

describe('TransactionStack', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows success state when no transactions', async () => {
        (transactionService.getPendingTransactions as any).mockResolvedValue([])

        render(<TransactionStack />)

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByTestId('success-state')).toBeInTheDocument()
        })
    })

    it('shows loader initially', () => {
        (transactionService.getPendingTransactions as any).mockReturnValue(new Promise(() => { }))
        render(<TransactionStack />)
        expect(screen.getByTestId('loader')).toBeInTheDocument()
    })
})
