import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Sparkles, CheckCircle2 } from 'lucide-react'
import { savingsService, type SavingsGoal } from '../../../services/savingsService'
import { useNotificationStore } from '../../../stores/useNotificationStore'

interface SavingsAllocationModalProps {
    isOpen: boolean
    onClose: () => void
    amount: number
    onAllocated: () => void
}

export const SavingsAllocationModal: React.FC<SavingsAllocationModalProps> = ({ isOpen, onClose, amount, onAllocated }) => {
    const [goals, setGoals] = useState<SavingsGoal[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
    const [isAllocating, setIsAllocating] = useState(false)
    const addNotification = useNotificationStore(state => state.addNotification)

    useEffect(() => {
        if (isOpen) {
            const loadGoals = async () => {
                setLoading(true)
                const data = await savingsService.getSavingsGoals()
                setGoals(data)
                setLoading(false)
            }
            loadGoals()
        }
    }, [isOpen])

    const handleAllocate = async () => {
        if (!selectedGoalId) return

        setIsAllocating(true)
        try {
            await savingsService.updateSavingsAmount(selectedGoalId, amount)
            addNotification({
                type: 'zen',
                message: `Impulsion Zen : ${amount.toLocaleString('fr-FR')}€ ajoutés à votre objectif !`,
                duration: 5000
            })
            onAllocated()
            onClose()
        } catch (error) {
            addNotification({
                type: 'warning',
                message: "Erreur lors de l'allocation. Réessayez plus tard.",
                duration: 4000
            })
        } finally {
            setIsAllocating(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass w-full max-w-md rounded-[40px] border border-white/10 flex flex-col overflow-hidden relative z-10 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-white">Allouer le Surplus</h2>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1">
                                    {amount.toLocaleString('fr-FR')}€ à réallouer
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/20 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px] custom-scrollbar">
                            {loading ? (
                                <div className="py-12 flex flex-col items-center space-y-4 opacity-40">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">Calcul des possibles...</span>
                                </div>
                            ) : goals.length > 0 ? (
                                goals.map(goal => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setSelectedGoalId(goal.id)}
                                        className={`w-full p-6 rounded-3xl border transition-all flex items-center justify-between group ${selectedGoalId === goal.id ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-2xl ${selectedGoalId === goal.id ? 'bg-primary text-background' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-white leading-none mb-1">{goal.title}</p>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-tighter">
                                                        {goal.current_amount.toLocaleString('fr-FR')}€ / {goal.target_amount.toLocaleString('fr-FR')}€
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {selectedGoalId === goal.id && (
                                            <motion.div layoutId="selection" className="text-primary">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="py-12 text-center space-y-4">
                                    <p className="text-sm text-white/40 italic">Aucun objectif d'épargne trouvé.</p>
                                    <button className="text-[10px] text-primary font-bold uppercase tracking-widest border-b border-primary/20 pb-0.5">
                                        Créer mon premier objectif
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white/[0.04] border-t border-white/5 space-y-4">
                            <button
                                disabled={!selectedGoalId || isAllocating}
                                onClick={handleAllocate}
                                className={`w-full py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 shadow-xl ${!selectedGoalId || isAllocating ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-primary text-background shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'}`}
                            >
                                {isAllocating ? (
                                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Confirmer l'Action Zen</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
