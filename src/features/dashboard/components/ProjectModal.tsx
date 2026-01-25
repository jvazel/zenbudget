import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Trash2, Target, Briefcase, Heart } from 'lucide-react'
import { type SavingsGoal, savingsService } from '../../../services/savingsService'

interface ProjectModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    project?: SavingsGoal | null
}



export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSuccess, project }) => {
    const [title, setTitle] = useState('')
    const [targetAmount, setTargetAmount] = useState('')
    const [category, setCategory] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (project) {
            setTitle(project.title)
            setTargetAmount(project.target_amount.toString())
            setCategory(project.category)
        } else {
            setTitle('')
            setTargetAmount('')
            setCategory('')
        }
    }, [project, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const goalData = {
                title,
                target_amount: parseFloat(targetAmount),
                current_amount: project ? project.current_amount : 0,
                category: category || 'General'
            }

            if (project) {
                await savingsService.updateSavingsGoal(project.id, goalData)
            } else {
                await savingsService.createSavingsGoal(goalData)
            }
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error saving project:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!project || !confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return
        setLoading(true)
        try {
            await savingsService.deleteSavingsGoal(project.id)
            onSuccess()
            onClose()
        } catch (error) {
            console.error('Error deleting project:', error)
        } finally {
            setLoading(false)
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
                                {project ? 'Modifier le projet' : 'Nouveau projet Zen'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Titre du projet</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            required
                                            type="text"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Ex: Voyage au Japon"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Objectif (€)</label>
                                    <div className="relative">
                                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            step="0.01"
                                            value={targetAmount}
                                            onChange={e => setTargetAmount(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                            placeholder="5000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest px-1">Catégorie</label>
                                    <div className="relative">
                                        <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                        <input
                                            type="text"
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="Ex: Voyage, Auto, Maison..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                {project && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="px-6 py-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center border border-red-500/10"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-5 bg-primary text-background rounded-2xl font-bold uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            <span>{project ? 'Enregistrer' : 'Créer le projet'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
