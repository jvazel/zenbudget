import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coins, Zap } from 'lucide-react'

interface FeedProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (amount: number) => void
    projectTitle: string
}

export const FeedProjectModal: React.FC<FeedProjectModalProps> = ({ isOpen, onClose, onSuccess, projectTitle }) => {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || isNaN(parseFloat(amount))) return

        setLoading(true)
        // Simulate tiny network delay for feel
        await new Promise(resolve => setTimeout(resolve, 300))

        onSuccess(parseFloat(amount))
        setLoading(false)
        onClose()
        setAmount('')
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
                        className="fixed inset-x-4 top-[20%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm glass rounded-[40px] border border-white/10 p-8 z-[101] shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-white">Alimenter</h2>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 line-clamp-1">{projectTitle}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Montant à ajouter (€)</label>
                                <div className="relative">
                                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono text-lg"
                                        placeholder="50.00"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl font-bold uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-xl shadow-cyan-500/20"
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 fill-current" />
                                        <span>Valider</span>
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
