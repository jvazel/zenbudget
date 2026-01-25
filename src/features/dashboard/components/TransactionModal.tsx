import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Calendar, Tag, CreditCard, Loader2 } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'
import { categoryService } from '../../../services/categoryService'
import { useScrollLock } from '../../../hooks/useScrollLock'

interface TransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    transaction?: any // If provided, we are in edit mode
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSuccess, transaction }) => {
    useScrollLock(isOpen)
    const [type, setType] = useState<'expense' | 'income'>('expense')
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [categories, setCategories] = useState<any[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && transaction) {
            setType(transaction.amount > 0 ? 'income' : 'expense')
            setDescription(transaction.description)
            setAmount(Math.abs(transaction.amount).toString())
            // Need to handle date formatting if it's from localized string
            // For now assume transaction.date might need raw fetch if we want accuracy
            // But let's try to parse if possible or use a default
            const isoDate = transaction.raw_date ? new Date(transaction.raw_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            setDate(isoDate)
            setSelectedCategoryId(transaction.category_id || '')
        } else if (isOpen) {
            // Reset for new transaction
            setType('expense')
            setDescription('')
            setAmount('')
            setDate(new Date().toISOString().split('T')[0])
            setSelectedCategoryId('')
        }
    }, [isOpen, transaction])

    useEffect(() => {
        if (isOpen) {
            const loadCategories = async () => {
                const data = await categoryService.getCategoriesByType(type)
                setCategories(data)
                // Only auto-select if we don't have one selected or if we just switched types
                if (data.length > 0 && (!selectedCategoryId || !data.find(c => c.id === selectedCategoryId))) {
                    setSelectedCategoryId(data[0].id)
                }
            }
            loadCategories()
        }
    }, [isOpen, type])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!description || !amount || !selectedCategoryId) return

        setIsSubmitting(true)
        try {
            const params = {
                description,
                amount: parseFloat(amount),
                type,
                categoryId: selectedCategoryId,
                date
            }

            if (transaction?.id) {
                await transactionService.updateManualTransaction(transaction.id, params)
            } else {
                await transactionService.createManualTransaction(params)
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            console.error(err)
            setError(err.message || "Erreur lors de l'enregistrement")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md glass rounded-[40px] border border-white/10 p-8 z-[101] shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {transaction ? 'Modifier la Transaction' : 'Nouvelle Transaction'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center font-medium animate-shake">
                                    {error}
                                </div>
                            )}

                            {/* Type Toggle */}
                            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'expense' ? 'bg-primary text-background shadow-lg' : 'text-white/40 hover:text-white'}`}
                                >
                                    Dépense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${type === 'income' ? 'bg-primary text-background shadow-lg' : 'text-white/40 hover:text-white'}`}
                                >
                                    Revenu
                                </button>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Libellé</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="text"
                                        required
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="ex: Courses Monoprix..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Montant (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                    />
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            type="date"
                                            required
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Catégorie</label>
                                <div className="relative">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <select
                                        required
                                        value={selectedCategoryId}
                                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="bg-background">{cat.name}</option>
                                        ))}
                                        {categories.length === 0 && <option value="" disabled>Aucune catégorie</option>}
                                    </select>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary text-background rounded-2xl py-5 font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        {transaction ? null : <Plus className="w-5 h-5" />}
                                        <span>{transaction ? 'Enregistrer les modifications' : 'Ajouter'}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
