import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Zap, ShoppingBag, Coffee, Car, Home, Heart, Sparkles, Tag, TrendingUp } from 'lucide-react'
import { projectionService, type ProjectedTransaction } from '../../../services/projectionService'

const ICON_MAP: Record<string, any> = {
    Tag,
    ShoppingBag,
    Coffee,
    Car,
    Home,
    Heart,
    Sparkles,
    Zap,
    TrendingUp
}

export const UpcomingExpenses: React.FC = () => {
    const [projections, setProjections] = useState<ProjectedTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadProjections()
    }, [])

    const loadProjections = async () => {
        setIsLoading(true)
        const data = await projectionService.getUpcomingProjections()
        setProjections(data)
        setIsLoading(false)
    }

    if (isLoading) {
        return (
            <div className="glass rounded-3xl p-6 h-[200px] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <Calendar className="w-8 h-8 text-white/10" />
                    <div className="h-2 w-24 bg-white/10 rounded-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="glass rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Échéances Prochaines</h3>
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter px-2 py-1 bg-white/5 rounded-full">
                    30 Jours
                </span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-none">
                <AnimatePresence mode="popLayout">
                    {projections.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 space-y-2">
                            <p className="text-xs text-white/20 font-medium">Aucune échéance détectée.</p>
                            <p className="text-[10px] text-white/10 tracking-tight leading-relaxed px-4">
                                Activez l'auto-validation sur vos transactions pour voir vos projections ici.
                            </p>
                        </motion.div>
                    ) : (
                        projections.map((proj, index) => {
                            const IconComponent = ICON_MAP[proj.category_icon] || Zap
                            return (
                                <motion.div
                                    key={proj.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className="p-2.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: `${proj.category_color}22` }}>
                                            <IconComponent
                                                className="w-4 h-4"
                                                style={{ color: proj.category_color }} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white tracking-tight">{proj.description}</p>
                                            <p className="text-[10px] font-medium opacity-40 uppercase tracking-tighter mt-0.5">
                                                {proj.days_until === 0 ? 'Aujourd\'hui' :
                                                    proj.days_until === 1 ? 'Demain' :
                                                        `Dans ${proj.days_until} jours`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-white">
                                            {proj.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                                        </p>
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Prévu</p>
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
