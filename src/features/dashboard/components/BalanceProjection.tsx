import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { projectionService, type BalancePoint } from '../../../services/projectionService'

export const BalanceProjection: React.FC = () => {
    const [history, setHistory] = useState<BalancePoint[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        setIsLoading(true)
        const data = await projectionService.getProjectedBalanceHistory()
        setHistory(data)
        setIsLoading(false)
    }

    if (isLoading) {
        return (
            <div className="glass rounded-3xl p-6 h-[220px] animate-pulse flex flex-col justify-center items-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full" />
                <div className="h-2 w-32 bg-white/5 rounded-full" />
            </div>
        )
    }

    if (history.length === 0) return null

    const balances = history.map(h => h.balance)
    const min = Math.min(...balances)
    const max = Math.max(...balances)
    const range = max - min || 1

    // Final balance vs Initial
    const finalBalance = history[history.length - 1].balance
    const initialBalance = history[0].balance
    const isPositiveTrend = finalBalance >= initialBalance

    // Chart dimensions
    const width = 300
    const height = 80
    const padding = 10

    // Generate SVG path points using quadratic Bezier for smoothness
    const xPositions = history.map((_, i) => (i / (history.length - 1)) * (width - padding * 2) + padding)
    const yPositions = history.map(h => height - padding - ((h.balance - min) / range) * (height - padding * 2))

    const getBezierPath = () => {
        if (yPositions.length < 2) return ""
        let path = `M ${xPositions[0]},${yPositions[0]}`
        for (let i = 0; i < xPositions.length - 1; i++) {
            const xMid = (xPositions[i] + xPositions[i + 1]) / 2
            const yMid = (yPositions[i] + yPositions[i + 1]) / 2
            path += ` Q ${xPositions[i]},${yPositions[i]} ${xMid},${yMid}`
        }
        path += ` T ${xPositions[xPositions.length - 1]},${yPositions[xPositions.length - 1]}`
        return path
    }

    const bezierPath = getBezierPath()

    return (
        <div className="glass rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl ${isPositiveTrend ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                        {isPositiveTrend ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">ZenVision</h3>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Évolution à J+30</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-sm font-mono font-bold ${finalBalance >= 0 ? 'text-white' : 'text-primary'}`}>
                        {finalBalance.toLocaleString('fr-FR', { minimumFractionDigits: 0 })}€
                    </p>
                    <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Prévu</p>
                </div>
            </div>

            <div className="relative h-24 flex items-end pt-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Gradient Fill */}
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={isPositiveTrend ? '#22c55e' : '#ec4899'} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={isPositiveTrend ? '#22c55e' : '#ec4899'} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Background Grid Line (Current Balance) */}
                    <line
                        x1="0" y1={height - padding - ((initialBalance - min) / range) * (height - padding * 2)}
                        x2={width} y2={height - padding - ((initialBalance - min) / range) * (height - padding * 2)}
                        className="stroke-white/5 stroke-1 stroke-dasharray-4"
                    />

                    {/* Area path */}
                    <path
                        d={`${bezierPath} L ${width - padding},${height} L ${padding},${height} Z`}
                        fill="url(#chartGradient)"
                    />

                    {/* Line path */}
                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        fill="none"
                        stroke={isPositiveTrend ? '#22c55e' : '#ec4899'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={bezierPath}
                    />

                    {/* End point dot */}
                    <motion.circle
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.5 }}
                        cx={(width - padding)}
                        cy={height - padding - ((finalBalance - min) / range) * (height - padding * 2)}
                        r="4"
                        fill={isPositiveTrend ? '#22c55e' : '#ec4899'}
                        className="shadow-xl"
                    />
                </svg>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="flex items-center space-x-2 text-white/20">
                    <span className="text-[10px] font-bold">AUJOURD'HUI</span>
                    <ArrowRight className="w-2 h-2" />
                    <span className="text-[10px] font-bold">J+30</span>
                </div>
                <div className="flex items-center space-x-1 text-[10px] font-bold">
                    <span className="text-white/20">DELTA:</span>
                    <span className={finalBalance - initialBalance >= 0 ? 'text-green-500/60' : 'text-primary'}>
                        {finalBalance - initialBalance > 0 ? '+' : ''}
                        {Math.round(finalBalance - initialBalance)}€
                    </span>
                </div>
            </div>
        </div>
    )
}
