import React, { useEffect, useState } from 'react'
import { Wallet, Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'

export const ZenSavings: React.FC = () => {
    const [potential, setPotential] = useState<{ surplus: number, optimizable: number, total: number } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await transactionService.getSavingsPotential()
            setPotential(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading || !potential) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 px-2">
                <Wallet className="w-4 h-4 text-primary" />
                <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">ZenSavings</h2>
            </div>

            <div className="glass rounded-[40px] p-8 border border-white/5 bg-[#06b6d4]/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                    <Wallet className="w-48 h-48 text-[#06b6d4]" />
                </div>

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <p className="text-[10px] text-[#06b6d4] font-bold uppercase tracking-[0.3em]">Potentiel de Sérénité</p>
                        <div className="flex items-baseline justify-center space-x-2">
                            <span className="text-5xl font-mono font-bold tracking-tighter text-white">
                                {potential.total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}€
                            </span>
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-40">/ mois</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-1">
                            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-40 leading-none">Surplus Actuel</p>
                            <p className="text-lg font-mono font-bold text-white">
                                {potential.surplus.toLocaleString('fr-FR')}€
                            </p>
                        </div>
                        <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 space-y-1">
                            <div className="flex items-center space-x-1">
                                <p className="text-[9px] text-primary uppercase font-bold tracking-widest leading-none">Optimisable</p>
                                <Sparkles className="w-2.5 h-2.5 text-primary" />
                            </div>
                            <p className="text-lg font-mono font-bold text-primary">
                                +{potential.optimizable.toLocaleString('fr-FR')}€
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="mt-1 p-1.5 bg-green-500/10 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                                "En optimisant vos abonnements et en réduisant vos fuites d'énergie, vous pourriez atteindre votre objectif **Vacances 2026** avec **2 mois d'avance**."
                            </p>
                        </div>

                        <button className="w-full py-4 bg-primary text-background rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2">
                            <span>Appliquer aux Objectifs</span>
                            <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
