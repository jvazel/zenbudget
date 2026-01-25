import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
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

    const maxAmount = Math.max(...history.map(h => h.amount)) * 1.2
    // Calculate "Zen Average" (average of best 3 months - lowest expenses)
    const sortedAmounts = [...history].sort((a, b) => a.amount - b.amount)
    const zenAverage = sortedAmounts.slice(0, 3).reduce((acc, curr) => acc + curr.amount, 0) / 3

    const currentMonth = history.find(h => h.isCurrent)
    const isZen = currentMonth && currentMonth.amount <= zenAverage * 1.1

    return (
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <TrendingUp className={`w-4 h-4 ${isZen ? 'text-[#06b6d4]' : 'text-orange-400'}`} />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Voyage Temporel</h2>
                </div>
                {currentMonth && (
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${isZen ? 'bg-[#06b6d4]/10 text-[#06b6d4]' : 'bg-orange-500/10 text-orange-400'}`}>
                        {isZen ? 'Vitesse de croisière' : 'Légère turbulence'}
                    </span>
                )}
            </div>

            <div className="relative h-48 w-full flex items-end justify-between px-2 gap-2">
                {/* Ghost Line (Zen Average) */}
                <div
                    className="absolute left-0 right-0 border-t border-dashed border-[#06b6d4]/30 pointer-events-none flex items-end justify-end pr-2"
                    style={{ bottom: `${(zenAverage / maxAmount) * 100}%` }}
                >
                    <span className="text-[8px] text-[#06b6d4]/50 mb-1 transform translate-y-full">Moyenne Zen</span>
                </div>

                {history.map((h, i) => {
                    const heightPercent = (h.amount / maxAmount) * 100


                    return (
                        <div key={i} className="flex flex-col items-center justify-end h-full flex-1 group relative">
                            {/* Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercent}%` }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className={`w-full min-w-[8px] max-w-[24px] rounded-t-lg relative ${h.isCurrent
                                    ? (isZen ? 'bg-[#06b6d4]' : 'bg-orange-400')
                                    : 'bg-white/5 group-hover:bg-white/10'
                                    }`}
                            >
                                {/* Tooltip on Hover */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                                    {h.amount.toLocaleString('fr-FR')}€
                                </div>
                            </motion.div>

                            {/* Label */}
                            <span className={`mt-2 text-[9px] uppercase font-bold ${h.isCurrent ? 'text-white' : 'text-white/30'}`}>
                                {h.month}
                            </span>
                        </div>
                    )
                })}
            </div>

            <p className="text-xs text-muted-foreground text-center italic opacity-60">
                Comparaison sur 6 mois. La ligne pointillée représente votre équilibre idéal.
            </p>
        </div>
    )
}
