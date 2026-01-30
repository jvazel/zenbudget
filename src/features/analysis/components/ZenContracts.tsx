import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, Calendar, CreditCard, ArrowRight } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'

interface Subscription {
    name: string
    amount: number
    occurrences: number
    lastDate: string
    categoryName: string
    categoryColor: string
}

export const ZenContracts: React.FC = () => {
    const [subs, setSubs] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await transactionService.getSubscriptions()
            setSubs(data)
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return <div className="animate-pulse flex space-x-4 p-8 glass rounded-3xl"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-white/10 rounded w-3/4"></div><div className="space-y-2"><div className="h-4 bg-white/10 rounded"></div></div></div></div>

    const monthlyTotal = subs.reduce((acc, s) => acc + s.amount, 0)
    const annualTotal = monthlyTotal * 12

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">ZenContracts</h2>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-40">Impact Fixe</p>
                    <p className="text-lg font-mono font-bold text-white leading-none">-{monthlyTotal.toLocaleString('fr-FR')}€<span className="text-[10px] opacity-40 ml-1">/ mois</span></p>
                </div>
            </div>

            <div className="glass rounded-[32px] p-8 border border-white/5 bg-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <CreditCard className="w-24 h-24 text-primary" />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em]">Charge Annuelle</p>
                        <p className="text-3xl font-mono font-bold text-white tracking-tighter">-{annualTotal.toLocaleString('fr-FR')}€</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                            <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Identifiés</p>
                            <p className="text-xs font-bold text-white">{subs.length} Contrats</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {subs.length > 0 ? subs.map((sub, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 glass rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all"
                    >
                        <div className="flex items-center space-x-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5"
                                style={{ backgroundColor: `${sub.categoryColor}10` }}
                            >
                                <Calendar className="w-5 h-5" style={{ color: sub.categoryColor }} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{sub.name}</h3>
                                <div className="flex items-center space-x-2">
                                    <span style={{ color: sub.categoryColor }} className="text-[10px] font-bold uppercase tracking-wider">{sub.categoryName}</span>
                                    <span className="text-[10px] text-muted-foreground opacity-30">•</span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Abonnement</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right flex items-center space-x-4">
                            <div>
                                <p className="text-sm font-mono font-bold">-{sub.amount.toLocaleString('fr-FR')}€</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">mensuel</p>
                            </div>
                            <button className="p-2 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10">
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>
                    </motion.div>
                )) : (
                    <div className="p-12 text-center glass border-dashed border-white/10 rounded-3xl opacity-40">
                        <p className="text-xs italic">Aucun abonnement récurrent identifié pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
