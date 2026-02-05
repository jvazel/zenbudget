import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TransactionCard, type Transaction } from './TransactionCard'
import { ShieldCheck, Zap, Loader2, Upload, CheckCircle2 } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'
import { patternService } from '../../../services/patternService'
import { importService } from '../../../services/importService'
import { supabase } from '../../../lib/supabase'
import { ZenSuccessState } from './ZenSuccessState'
import { useAuth } from '../../auth/AuthContext'
import { useNotificationStore } from '../../../stores/useNotificationStore'
import { useOfflineStore } from '../../../stores/useOfflineStore'
import { connectivityService } from '../../../services/connectivityService'

interface TransactionStackProps {
    onComplete?: () => void
}

export const TransactionStack: React.FC<TransactionStackProps> = ({ onComplete }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [importResult, setImportResult] = useState<{ count: number, skipped: number, auto: number } | null>(null)
    const [isImporting, setIsImporting] = useState(false)
    const { addNotification } = useNotificationStore()
    const { addSyncAction } = useOfflineStore()
    const { user: currentUser } = useAuth()

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
                    const updatedTx = payload.new as any

                    // If it was validated by someone else!
                    if (updatedTx && updatedTx.status === 'validated' && updatedTx.validated_by !== currentUser?.id) {
                        addNotification({
                            message: `${updatedTx.profiles?.full_name || 'Votre partenaire'} a validé une transaction.`,
                            type: 'zen'
                        })
                    }

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

        if (connectivityService.isOnline()) {
            // Remote Sync
            await transactionService.updateTransactionStatus(swipedTransaction.id, status)

            // Zen Butler Learning (only if validated and has category)
            if (status === 'validated' && swipedTransaction.category_id) {
                await patternService.learnPattern(swipedTransaction.description, swipedTransaction.category_id)
            }
        } else {
            // Offline Queue
            const offlineAction = status === 'validated' ? 'validate' : 'ignore'
            addSyncAction(swipedTransaction.id, offlineAction)
            addNotification({
                message: "Action enregistrée hors-ligne. Synchronisation automatique au retour du réseau. 🧘",
                type: 'info'
            })
        }
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsImporting(true)
        try {
            const content = await file.text()
            let importedData: any[] = []

            if (file.name.endsWith('.json')) {
                importedData = await importService.parseJSON(content)
            } else {
                importedData = await importService.parseCSV(content)
            }

            const result = await transactionService.importTransactions(importedData)
            setImportResult({
                count: result.importedCount,
                skipped: result.skippedCount,
                auto: result.autoValidatedCount
            })

            // Refresh list
            const data = await transactionService.getPendingTransactions()
            setTransactions(data)

            // Zen Notification
            if (result.importedCount > 0) {
                addNotification({
                    message: `${result.importedCount} transactions importées. ${result.autoValidatedCount} ont été auto-validées par l'IA 🧘`,
                    type: 'success'
                })
            }

            // Auto hide message
            setTimeout(() => setImportResult(null), 5000)
        } catch (err) {
            alert((err as Error).message)
        } finally {
            setIsImporting(false)
            e.target.value = '' // Reset input
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
            {/* Import Header Section */}
            <div className="w-full max-w-sm flex items-center justify-between px-2">
                <div className="flex flex-col">
                    <h2 className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Rituel Inbox</h2>
                    <p className="text-white/30 text-[9px]">{transactions.length} en attente</p>
                </div>

                <label className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all cursor-pointer group">
                    {isImporting ? (
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    ) : (
                        <Upload className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-tighter">Importer</span>
                    <input
                        type="file"
                        className="hidden"
                        accept=".csv,.json"
                        onChange={handleImport}
                        disabled={isImporting}
                    />
                </label>
            </div>

            <AnimatePresence>
                {importResult && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-sm bg-primary/20 border border-primary/30 rounded-2xl p-3 flex items-center space-x-3 glass"
                    >
                        <div className="bg-primary/20 p-2 rounded-full">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-white font-medium">Importation réussie !</p>
                            <p className="text-[9px] text-white/60">
                                {importResult.count} ajoutées, {importResult.skipped} ignorés.
                                {importResult.auto > 0 && ` (${importResult.auto} auto-validées 🧘)`}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
