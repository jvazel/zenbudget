import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TransactionCard, type Transaction } from './TransactionCard'
import { ShieldCheck, Zap, Loader2 } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'
import { patternService } from '../../../services/patternService'
import { supabase } from '../../../lib/supabase'
import { ZenSuccessState } from './ZenSuccessState'

interface TransactionStackProps {
    onComplete?: () => void
}

export const TransactionStack: React.FC<TransactionStackProps> = ({ onComplete }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (transactions.length === 0 && !isLoading && onComplete) {
            const timer = setTimeout(() => {
                onComplete()
            }, 2500) // Delay to enjoy the Zen State
            return () => clearTimeout(timer)
        }
    }, [transactions.length, isLoading, onComplete])

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true)
            const data = await transactionService.getPendingTransactions()
            setTransactions(data)
            setIsLoading(false)
        }
        fetchTransactions()

        // Real-time Subscription
        const channel = supabase
            .channel('transaction-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'transactions',
                filter: 'status=eq.pending'
            }, (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    const newT = payload.new as any
                    setTransactions(prev => [...prev, {
                        id: newT.id,
                        description: newT.description,
                        amount: Number(newT.amount),
                        predicted_category: newT.predicted_category || 'Inconnu',
                        date: new Date(newT.transaction_date).toLocaleDateString()
                    }])
                } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
                    const deletedId = (payload.old as any).id || (payload.new as any).id
                    setTransactions(prev => prev.filter(t => t.id !== deletedId))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleSwipe = async (direction: 'left' | 'right') => {
        const swipedTransaction = transactions[0]
        const status = direction === 'right' ? 'validated' : 'ignored'

        console.log(`Swiped ${direction} on ${swipedTransaction.description}`)

        // Optimistic Update
        setTransactions(prev => prev.slice(1))

        // Remote Sync
        await transactionService.updateTransactionStatus(swipedTransaction.id, status)

        // Zen Butler Learning (only if validated and has category)
        if (status === 'validated' && swipedTransaction.category_id) {
            await patternService.learnPattern(swipedTransaction.description, swipedTransaction.category_id)
        }
    }

    if (isLoading) {
        return (
            <div className="w-full h-[420px] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin opacity-50 transition-opacity" />
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center space-y-12">
            <div className="relative w-full max-w-sm h-[420px] perspective-1000">
                <AnimatePresence>
                    {transactions.length > 0 ? (
                        transactions.map((t, index) => (
                            index < 3 && ( // Only render top 3 for performance
                                <TransactionCard
                                    key={t.id}
                                    transaction={t}
                                    onSwipe={handleSwipe}
                                    isFront={index === 0}
                                />
                            )
                        )).reverse() // Reverse to keep front card on top
                    ) : (
                        <ZenSuccessState />
                    )}
                </AnimatePresence>
            </div>

            <div className="flex space-x-8 text-muted-foreground text-sm font-medium pt-4 opacity-50">
                <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sync Johann + Partner</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Optimized by AI</span>
                </div>
            </div>
        </div>
    )
}
