import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Calendar, ArrowRight, Zap } from 'lucide-react'
import { projectionService, type ProjectionAlert } from '../../../services/projectionService'

export const OverdraftAlert: React.FC = () => {
    const [alerts, setAlerts] = useState<ProjectionAlert[]>([])

    useEffect(() => {
        const loadAlerts = async () => {
            const data = await projectionService.getProjectedAlerts()
            setAlerts(data)
        }
        loadAlerts()
    }, [])

    if (alerts.length === 0) return null

    const alert = alerts[0] // Show the first/most critical one

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="relative overflow-hidden bg-red-500/10 border border-red-500/20 rounded-3xl p-6 space-y-4"
            >
                {/* Background Decoration */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />

                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-500 rounded-xl shadow-lg shadow-red-500/20">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Alerte Découvert</h3>
                            <p className="text-[10px] text-red-400 font-bold uppercase tracking-tighter">ZenVision Prediction</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs text-white/70 leading-relaxed">
                        Attention, votre solde risque de devenir négatif le <span className="text-white font-bold">{new Date(alert.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span> suite à vos prochaines échéances.
                    </p>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-white/40 uppercase">
                            <Calendar className="w-3 h-3" />
                            <span>Prévu le {alert.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] font-bold text-red-500 uppercase">
                            <Zap className="w-3 h-3" />
                            <span>Est: {alert.amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })}€</span>
                        </div>
                    </div>
                </div>

                <button className="w-full bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-500/10 group">
                    <span>Voir les solutions d'optimisation</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </AnimatePresence>
    )
}
