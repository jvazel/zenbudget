import React, { useEffect, useState } from 'react'
import { Zap, ZapOff, ArrowRight, Shield } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'

export const EnergyLeaks: React.FC = () => {
    const [leaks, setLeaks] = useState<{ name: string, amount: number, annualImpact: number, occurrences: number }[]>([])
    const [loading, setLoading] = useState(true)
    const [showAll, setShowAll] = useState(false)

    useEffect(() => {
        const load = async () => {
            const data = await transactionService.getEnergyLeaks()
            setLeaks(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return null

    return (
        <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center space-x-2">
                <ZapOff className="w-4 h-4 text-orange-400" />
                <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Fuites d'Énergie</h2>
            </div>

            <p className="text-xs text-muted-foreground mb-4 opacity-80">
                Ces dépenses récurrentes drainent silencieusement votre budget.
            </p>

            <div className="space-y-3">
                {leaks.length > 0 ? leaks.slice(0, showAll ? undefined : 3).map((leak, i) => {
                    const isHighImpact = leak.annualImpact > 100
                    return (
                        <div
                            key={i}
                            className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 group
                                ${isHighImpact
                                    ? 'bg-orange-500/5 border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.05)]'
                                    : 'bg-white/5 border-white/5 hover:border-orange-500/30 hover:bg-orange-500/5'
                                }`}
                        >
                            <div className="flex items-center space-x-3 min-w-0">
                                <div className={`p-2 rounded-xl transition-colors ${isHighImpact ? 'bg-orange-500/10' : 'bg-white/5 group-hover:bg-orange-500/10'}`}>
                                    <Zap className={`w-4 h-4 text-orange-400 ${isHighImpact ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold truncate max-w-[120px] text-white/90">{leak.name}</p>
                                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-bold">
                                        {leak.occurrences}x / mois
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-sm font-mono font-bold ${isHighImpact ? 'text-orange-400' : 'text-orange-400/80'}`}>
                                    -{leak.annualImpact.toLocaleString('fr-FR')}€
                                </p>
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">/ an</p>
                            </div>
                        </div>
                    )
                }) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-[#06b6d4]/10 flex items-center justify-center mb-1">
                            <Shield className="w-6 h-6 text-[#06b6d4]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-white/60">Aucune fuite détectée</p>
                            <p className="text-[10px] text-[#06b6d4] font-bold uppercase tracking-widest mt-1">Votre budget est blindé</p>
                        </div>
                    </div>
                )}
            </div>

            {leaks.length > 3 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full py-3 mt-2 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-white transition-colors flex items-center justify-center space-x-2"
                >
                    <span>{showAll ? 'Voir moins' : 'Voir toutes les récurrences'}</span>
                    <ArrowRight className={`w-3 h-3 transition-transform ${showAll ? '-rotate-90' : ''}`} />
                </button>
            )}
        </div>
    )
}
