import React, { useEffect, useState } from 'react'
import { Zap, ZapOff, ArrowRight } from 'lucide-react'
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
                {leaks.length > 0 ? leaks.slice(0, showAll ? undefined : 3).map((leak, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-orange-500/30 transition-all hover:bg-orange-500/5">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-orange-500/10 transition-colors">
                                <Zap className="w-4 h-4 text-orange-400 opacity-60 group-hover:opacity-100" />
                            </div>
                            <div>
                                <p className="text-xs font-bold truncate max-w-[120px]">{leak.name}</p>
                                <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-bold">
                                    {leak.occurrences}x / mois
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-mono font-bold text-orange-400">-{leak.annualImpact.toLocaleString('fr-FR')}€</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">/ an</p>
                        </div>
                    </div>
                )) : (
                    <div className="p-6 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                        <p className="text-xs text-muted-foreground italic">Aucune fuite détectée.</p>
                        <p className="text-[10px] text-[#06b6d4] mt-2 font-bold uppercase tracking-widest">Votre coque est étanche !</p>
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
