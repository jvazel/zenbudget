import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap, Settings2, Sparkles } from 'lucide-react'
import { projectionService, type BalancePoint } from '../../../services/projectionService'
import { simulationService, useSimulationStore } from '../../../services/simulationService'

export const BalanceProjection: React.FC<{ onOpenSimulation: () => void }> = ({ onOpenSimulation }) => {
    const [history, setHistory] = useState<BalancePoint[]>([])
    const [simulatedHistory, setSimulatedHistory] = useState<BalancePoint[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [timeframe, setTimeframe] = useState<30 | 90 | 365>(30)

    const { isSimulationMode } = useSimulationStore()

    useEffect(() => {
        loadData()
    }, [timeframe, isSimulationMode])

    const loadData = async () => {
        setIsLoading(true)
        try {
            // Always load real history
            const realData = await projectionService.getProjectedBalanceHistory()
            setHistory(realData)

            if (isSimulationMode) {
                const simData = await simulationService.getSimulatedBalanceHistory(timeframe)
                setSimulatedHistory(simData)
            } else {
                setSimulatedHistory([])
            }
        } catch (error) {
            console.error('Failed to load projection data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const activeHistory = isSimulationMode ? simulatedHistory : history
    if (isLoading) {
        return (
            <div className="glass rounded-3xl p-6 h-[220px] animate-pulse flex flex-col justify-center items-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-full" />
                <div className="h-2 w-32 bg-white/5 rounded-full" />
            </div>
        )
    }

    if (activeHistory.length === 0) return null

    const balances = activeHistory.map(h => h.balance)
    const realBalances = history.map(h => h.balance)

    // Calculate min/max across both to keep scale consistent
    const allBalances = [...balances, ...realBalances]
    const min = Math.min(...allBalances)
    const max = Math.max(...allBalances)
    const range = (max - min) || 1

    const finalBalance = activeHistory[activeHistory.length - 1].balance
    const initialBalance = activeHistory[0].balance
    const isPositiveTrend = finalBalance >= initialBalance

    const width = 300
    const height = 80
    const padding = 10

    const getPathPoints = (data: BalancePoint[]) => {
        if (data.length < 2) return ""
        const xPos = data.map((_, i) => (i / (data.length - 1)) * (width - padding * 2) + padding)
        const yPos = data.map(h => height - padding - ((h.balance - min) / range) * (height - padding * 2))

        let path = `M ${xPos[0]},${yPos[0]}`
        for (let i = 0; i < xPos.length - 1; i++) {
            const xMid = (xPos[i] + xPos[i + 1]) / 2
            const yMid = (yPos[i] + yPos[i + 1]) / 2
            path += ` Q ${xPos[i]},${yPos[i]} ${xMid},${yMid}`
        }
        path += ` T ${xPos[xPos.length - 1]},${yPos[xPos.length - 1]}`
        return path
    }

    const realPath = getPathPoints(history)
    const simPath = getPathPoints(simulatedHistory)

    return (
        <div className="glass rounded-3xl p-6 space-y-4 overflow-hidden relative">
            {isSimulationMode && (
                <div className="absolute top-0 right-0 p-1 px-3 bg-primary/20 backdrop-blur-md rounded-bl-2xl border-l border-b border-primary/20">
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Simulé</span>
                </div>
            )}

            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl transition-colors ${isPositiveTrend ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                        {isPositiveTrend ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">ZenVision</h3>
                            {isSimulationMode ? <Zap className="w-3 h-3 text-primary animate-pulse" /> : <Sparkles className="w-3 h-3 text-white/20" />}
                        </div>
                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">
                            Projection à J+{timeframe}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                        <p className={`text-sm font-mono font-bold ${finalBalance >= 0 ? 'text-white' : 'text-primary'}`}>
                            {Math.round(finalBalance).toLocaleString('fr-FR')}€
                        </p>
                        <p className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Prévu</p>
                    </div>

                    <button
                        onClick={onOpenSimulation}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 group"
                    >
                        <Settings2 className="w-3.5 h-3.5 text-white/40 group-hover:text-primary transition-colors" />
                    </button>
                </div>
            </div>

            <div className="relative h-24 flex items-end pt-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={isPositiveTrend ? '#22c55e' : '#ec4899'} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={isPositiveTrend ? '#22c55e' : '#ec4899'} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Reference Line (Today) */}
                    <line
                        x1={padding} y1="0"
                        x2={padding} y2={height}
                        className="stroke-white/5 stroke-1 stroke-dasharray-4"
                    />

                    {/* Area path (Simulated or Real) */}
                    <path
                        d={`${isSimulationMode ? simPath : realPath} L ${width - padding},${height} L ${padding},${height} Z`}
                        fill="url(#chartGradient)"
                        className="transition-all duration-700"
                    />

                    {/* Real Path (Shadow when simulation is active) */}
                    {isSimulationMode && (
                        <path
                            d={realPath}
                            fill="none"
                            stroke="white"
                            strokeOpacity="0.05"
                            strokeWidth="1.5"
                            strokeDasharray="4 2"
                        />
                    )}

                    {/* Main Path */}
                    <motion.path
                        key={isSimulationMode ? 'sim' : 'real'}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        fill="none"
                        stroke={isSimulationMode ? '#ec4899' : (isPositiveTrend ? '#22c55e' : '#ec4899')}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={isSimulationMode ? simPath : realPath}
                    />
                </svg>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
                    {[30, 90, 365].map(t => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t as any)}
                            className={`px-2 py-1 text-[8px] font-black rounded-md transition-all ${timeframe === t ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                        >
                            {t === 365 ? '1 AN' : `${t} J`}
                        </button>
                    ))}
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
