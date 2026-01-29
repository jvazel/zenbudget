import { render, screen, act, waitFor } from '@testing-library/react'
import { TransactionStack } from './TransactionStack'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { transactionService } from '../../../services/transactionService'
import React from 'react'

// Manual Mocks to avoid complex mocking issues
vi.mock('../../../services/transactionService', () => ({
    transactionService: {
        getPendingTransactions: vi.fn(),
        updateTransactionStatus: vi.fn()
    }
}))

vi.mock('./TransactionCard', () => ({
    TransactionCard: () => <div data-testid="transaction-card">Card</div>
}))

vi.mock('./ZenSuccessState', () => ({
    ZenSuccessState: () => <div data-testid="success-state">Success</div>
}))

// Mock lucide-react
vi.mock('lucide-react', () => ({
    ShieldCheck: () => <div />,
    Zap: () => <div />,
    Loader2: () => <div data-testid="loader">Loading...</div>
}))

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: any) => <>{children}</>,
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>
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
        // vi.useFakeTimers()
    })

    afterEach(() => {
        // vi.useRealTimers()
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

    it('triggers onComplete after delay when empty', async () => {
        (transactionService.getPendingTransactions as any).mockResolvedValue([])
        const onCompleteMock = vi.fn()

        render(<TransactionStack onComplete={onCompleteMock} />)

        await waitFor(() => {
            expect(screen.getByTestId('success-state')).toBeInTheDocument()
        })

        // Wait for onComplete (needs > 2500ms) logic in component
        await waitFor(() => {
            expect(onCompleteMock).toHaveBeenCalled()
        }, { timeout: 4000 })
    })
})
