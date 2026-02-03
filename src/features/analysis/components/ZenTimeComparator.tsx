import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Hourglass } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'

export const ZenTimeComparator: React.FC = () => {
    const [history, setHistory] = useState<{ month: string, fullMonth: string, amount: number, isCurrent: boolean }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await transactionService.getMonthlyHistory(6)
            setHistory(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return null

    const hasData = history.length > 0 && history.some(h => h.amount > 0)
    const maxAmount = hasData ? Math.max(...history.map(h => h.amount)) * 1.2 : 100

    // Calculate "Zen Average" (average of best 3 months - lowest expenses)
    const sortedAmounts = [...history].sort((a, b) => a.amount - b.amount)
    const zenAverage = sortedAmounts.length > 0
        ? sortedAmounts.slice(0, 3).reduce((acc, curr) => acc + curr.amount, 0) / Math.min(3, sortedAmounts.length)
        : 0

    const currentMonth = history.find(h => h.isCurrent)
    const isZen = currentMonth && currentMonth.amount <= zenAverage * 1.1

    return (
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <TrendingUp className={`w-4 h-4 ${hasData ? (isZen ? 'text-[#06b6d4]' : 'text-orange-400') : 'text-white/20'}`} />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Voyage Temporel</h2>
                </div>
                {hasData && currentMonth && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${isZen ? 'bg-[#06b6d4]/10 text-[#06b6d4]' : 'bg-orange-500/10 text-orange-400'}`}>
                        {isZen ? 'Vitesse de croisière' : 'Légère turbulence'}
                    </span>
                )}
            </div>

            <div className="relative h-48 w-full">
                {!hasData ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 opacity-60">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                            <Hourglass className="w-5 h-5 text-white/20" />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-medium text-white/40">Machine à remonter le temps...</p>
                            <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">En attente de données historiques</p>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-end justify-between px-2 gap-2 relative">
                        {/* Ghost Line (Zen Average) */}
                        <div
                            className="absolute left-0 right-0 border-t border-dashed border-[#06b6d4]/30 pointer-events-none flex items-end justify-end pr-2 z-0"
                            style={{ bottom: `${(zenAverage / maxAmount) * 100}%` }}
                        >
                            <span className="text-[8px] text-[#06b6d4]/50 mb-1 transform translate-y-full backdrop-blur-sm px-1 rounded">Moyenne Zen</span>
                        </div>

                        {history.map((h, i) => {
                            const heightPercent = maxAmount > 0 ? (h.amount / maxAmount) * 100 : 0

                            return (
                                <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group relative z-10">
                                    {/* Bar */}
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${heightPercent}%` }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        className={`w-full min-w-[8px] max-w-[24px] rounded-t-lg relative transition-all duration-300 ${h.isCurrent
                                            ? (isZen ? 'bg-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.3)]')
                                            : 'bg-white/5 group-hover:bg-white/20'
                                            }`}
                                    >
                                        {/* Tooltip on Hover */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:-translate-y-1 bg-[#0f172a]/90 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl pointer-events-none whitespace-nowrap z-20 shadow-xl">
                                            {h.amount.toLocaleString('fr-FR')}€
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0f172a]/90 rotate-45 border-r border-b border-white/10"></div>
                                        </div>
                                    </motion.div>

                                    {/* Label */}
                                    <span className={`mt-3 text-[9px] uppercase font-bold tracking-wider ${h.isCurrent ? 'text-white scale-110' : 'text-white/30'}`}>
                                        {h.month}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {hasData && (
                <p className="text-xs text-muted-foreground text-center italic opacity-60">
                    Comparaison sur 6 mois. La ligne pointillée représente votre équilibre idéal.
                </p>
            )}
        </div>
    )
}
