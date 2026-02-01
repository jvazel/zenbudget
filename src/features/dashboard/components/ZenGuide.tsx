import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Zap, Info } from 'lucide-react'
import { useProfile } from '../../../hooks/useProfile'

interface ZenGuideProps {
    transactionCount: number
}

export const ZenGuide: React.FC<ZenGuideProps> = ({ transactionCount }) => {
    const { profile, updateProfile } = useProfile()

    if (profile?.guide_dismissed || transactionCount >= 5) return null

    const handleDismiss = () => {
        updateProfile({ guide_dismissed: true })
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-3xl p-6 border border-primary/20 bg-primary/5 relative overflow-hidden group shadow-2xl"
            >
                {/* Background Glow */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all" />

                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start space-x-5">
                    <div className="p-3 bg-primary/20 rounded-2xl">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center space-x-2">
                                <span>Guide Zen</span>
                                <div className="h-1 w-1 bg-primary rounded-full" />
                            </h3>
                            <p className="text-xs text-white/60 leading-relaxed font-medium">
                                {transactionCount === 0
                                    ? "Bienvenue dans votre zone de calme. Importez vos premières transactions pour voir votre ZenGauge s'animer."
                                    : "Excellent début ! Le swipe est votre outil de sérénité. Validez vos transactions pour affiner votre Reste à Vivre."
                                }
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <div className="px-3 py-1.5 bg-white/5 rounded-full flex items-center space-x-2 border border-white/5">
                                <Zap className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Swipe Droite = Valider</span>
                            </div>
                            <div className="px-3 py-1.5 bg-white/5 rounded-full flex items-center space-x-2 border border-white/5">
                                <Info className="w-3 h-3 text-primary" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Bleu = ZenGauge</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
