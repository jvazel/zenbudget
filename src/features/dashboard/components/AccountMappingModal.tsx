import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark, ArrowRight, Check, X, Loader2, Plus, Wallet } from 'lucide-react'
import { bankingService, type BankAccount } from '../../../services/bankingService'
import { accountService, type Account } from '../../../services/accountService'

interface AccountMappingModalProps {
    isOpen: boolean
    onClose: () => void
    bankAccounts: BankAccount[]
    sessionId: string
    connectionId: string
    onSuccess: () => void
}

export const AccountMappingModal: React.FC<AccountMappingModalProps> = ({
    isOpen,
    onClose,
    bankAccounts,
    sessionId,
    connectionId,
    onSuccess
}) => {
    const [internalAccounts, setInternalAccounts] = useState<Account[]>([])
    const [mappings, setMappings] = useState<Record<string, string>>({}) // externalId -> internalId
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            loadInternalAccounts()
        }
    }, [isOpen])

    const loadInternalAccounts = async () => {
        setIsLoading(true)
        try {
            const data = await accountService.getAccounts()
            setInternalAccounts(data)

            // Auto-select if names match or if there is only one account
            const initialMappings: Record<string, string> = {}
            bankAccounts.forEach(ba => {
                const match = data.find(ia => ia.name.toLowerCase() === ba.name?.toLowerCase())
                if (match) initialMappings[ba.external_id] = match.id
                else if (data.length === 1) initialMappings[ba.external_id] = data[0].id
            })
            setMappings(initialMappings)
        } catch (err) {
            console.error('Failed to load accounts:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveMappings = async () => {
        setIsSaving(true)
        try {
            const selectedExternalIds = Object.keys(mappings)

            for (const extId of selectedExternalIds) {
                const internalId = mappings[extId]
                if (internalId) {
                    await bankingService.mapAccount(connectionId, extId, internalId)

                    // Initial Sync for this account
                    const txs = await bankingService.syncTransactions(internalId, extId, sessionId)
                    await bankingService.saveTransactions(txs, internalId)
                }
            }

            onSuccess()
            onClose()
        } catch (err) {
            console.error('Failed to save mappings and sync:', err)
        } finally {
            setIsSaving(false)
        }
    }

    const toggleMapping = (externalId: string, internalId: string) => {
        setMappings(prev => {
            const next = { ...prev }
            if (next[externalId] === internalId) {
                delete next[externalId]
            } else {
                next[externalId] = internalId
            }
            return next
        })
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl glass border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold tracking-tight">Lier vos comptes</h2>
                                    <p className="text-sm text-muted-foreground">Sélectionnez les comptes bancaires à synchroniser avec ZenBudget.</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-white/40" />
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-xs uppercase font-bold tracking-widest text-primary/40">Découverte des comptes...</p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                                    {bankAccounts.map(ba => (
                                        <div key={ba.external_id} className="glass p-6 rounded-3xl border border-white/5 space-y-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                                                    <Landmark className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">{ba.name || 'Compte Bancaire'}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{ba.iban || ba.external_id} • {ba.currency}</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-white/20" />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {internalAccounts.map(ia => (
                                                    <button
                                                        key={ia.id}
                                                        onClick={() => toggleMapping(ba.external_id, ia.id)}
                                                        className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${mappings[ba.external_id] === ia.id
                                                                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]'
                                                                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/60'
                                                            }`}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <Wallet className="w-3 h-3" />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">{ia.name}</span>
                                                        </div>
                                                        {mappings[ba.external_id] === ia.id && <Check className="w-3 h-3" />}
                                                    </button>
                                                ))}
                                                <button className="p-3 rounded-2xl border border-dashed border-white/10 hover:border-primary/40 hover:bg-primary/5 text-white/40 hover:text-primary transition-all flex items-center justify-center space-x-2">
                                                    <Plus className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Nouveau compte Zen</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 flex space-x-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold uppercase tracking-[0.2em] text-xs transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveMappings}
                                    disabled={isSaving || Object.keys(mappings).length === 0}
                                    className="flex-1 py-4 rounded-2xl bg-primary text-background font-bold uppercase tracking-[0.2em] text-xs transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center space-x-2 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Synchronisation...</span>
                                        </>
                                    ) : (
                                        <span>Terminer & Synchroniser</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
