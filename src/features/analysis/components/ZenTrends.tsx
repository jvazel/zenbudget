import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'

interface TrendItem {
    name: string
    data: number[]
    trend: number
    isInflation: boolean
}

const Sparkline: React.FC<{ data: number[], color: string }> = ({ data, color }) => {
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const width = 80
    const height = 30
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        const y = height - ((v - min) / range) * height
        return `${x},${y}`
    }).join(' ')

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
            />
        </svg>
    )
}

export const ZenTrends: React.FC = () => {
    const [trends, setTrends] = useState<TrendItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await transactionService.getTrendData()
            setTrends(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return null

    return (
        <div className="glass rounded-[32px] p-8 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Zen Tendances</h2>
                </div>
                <div className="p-1 px-2 bg-white/5 rounded-full border border-white/10 flex items-center space-x-1">
                    <Info className="w-3 h-3 text-muted-foreground opacity-40" />
                    <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Analyse 6 mois</span>
                </div>
            </div>

            <div className="space-y-4">
                {trends.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="space-y-1 flex-1 min-w-0 pr-4">
                            <h3 className="text-sm font-bold truncate text-white/90">{item.name}</h3>
                            <div className="flex items-center space-x-2">
                                {item.trend > 0 ? (
                                    <TrendingUp className={`w-3 h-3 ${item.isInflation ? 'text-red-400' : 'text-orange-400'}`} />
                                ) : item.trend < 0 ? (
                                    <TrendingDown className="w-3 h-3 text-green-400" />
                                ) : (
                                    <Minus className="w-3 h-3 text-muted-foreground" />
                                )}
                                <span className={`text-[10px] font-bold tracking-tight ${item.trend > 5 ? 'text-red-400' : item.trend > 0 ? 'text-orange-400' : item.trend < 0 ? 'text-green-400' : 'text-muted-foreground'}`}>
                                    {item.trend > 0 ? '+' : ''}{item.trend.toFixed(1)}%
                                </span>
                                {item.isInflation && (
                                    <span className="text-[8px] bg-red-400/10 text-red-400 px-1.5 py-0.5 rounded-full border border-red-400/20 font-bold uppercase tracking-tighter animate-pulse">
                                        Inflation
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Sparkline
                                data={item.data}
                                color={item.trend > 5 ? '#f87171' : item.trend > 0 ? '#fbbf24' : '#4ade80'}
                            />
                            <div className="text-right min-w-[70px]">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-40 leading-none mb-1">Actuel</p>
                                <p className="text-sm font-mono font-bold text-white">
                                    {item.data[5].toLocaleString('fr-FR', { minimumFractionDigits: 1 })}€
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-[9px] text-muted-foreground leading-relaxed italic opacity-40 pt-4 border-t border-white/5">
                Basé sur l'évolution du prix moyen par transaction pour ces commerçants.
            </p>
        </div>
    )
}
