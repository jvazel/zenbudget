import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, TrendingDown, Calendar, AlertTriangle } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'
import type { Transaction } from '../../inbox/components/TransactionCard'

export const ZenFees = () => {
    const [data, setData] = useState<{
        totalMonthly: number,
        projectedAnnual: number,
        transactions: Transaction[]
    } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadFees = async () => {
            try {
                const fees = await transactionService.getBankingFees()
                setData(fees)
            } finally {
                setLoading(false)
            }
        }
        loadFees()
    }, [])

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <div className="text-white/20 text-xs tracking-widest uppercase animate-pulse">Analyse des frais en cours...</div>
        </div>
    )

    if (!data || data.transactions.length === 0) return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 border border-white/5 bg-white/[0.02] rounded-3xl flex flex-col items-center justify-center text-center space-y-4"
        >
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-green-500" />
            </div>
            <div>
                <h3 className="text-white font-medium">Aucun frais détecté</h3>
                <p className="text-white/40 text-sm mt-1">Votre banque semble être très zen ce mois-ci.</p>
            </div>
        </motion.div>
    )

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 glass border border-white/10 rounded-3xl space-y-2"
                >
                    <div className="flex items-center space-x-2 text-white/40 text-[10px] uppercase tracking-wider font-bold">
                        <Calendar className="w-3 h-3" />
                        <span>Impatience Mensuelle</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {data.totalMonthly.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <p className="text-xs text-white/40">Total des commissions et frais ce mois-ci.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 glass border border-white/10 rounded-3xl space-y-2 group"
                >
                    <div className="flex items-center space-x-2 text-primary/60 text-[10px] uppercase tracking-wider font-bold">
                        <TrendingDown className="w-3 h-3" />
                        <span>Impact Zen Annuel</span>
                    </div>
                    <div className="text-3xl font-bold text-primary group-hover:scale-105 transition-transform origin-left">
                        {data.projectedAnnual.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <p className="text-xs text-white/40">Ce que vous pourriez économiser en un an.</p>
                </motion.div>
            </div>

            <div className="space-y-3">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest px-1 flex items-center space-x-2">
                    <ShieldAlert className="w-3 h-3 text-primary" />
                    <span>Détail des Fuites d'Énergie</span>
                </h3>

                <div className="space-y-2">
                    {data.transactions.map((t, idx) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex justify-between items-center hover:bg-white/[0.05] transition-colors"
                        >
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-white">{t.description}</div>
                                <div className="text-[10px] text-white/30 uppercase tracking-tighter">{t.date}</div>
                            </div>
                            <div className="text-sm font-bold text-red-400">
                                {Math.abs(t.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start space-x-4">
                <div className="p-2 bg-primary/20 rounded-xl mt-1">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                </div>
                <div className="space-y-1">
                    <div className="text-xs font-bold text-primary uppercase">Conseil Zen</div>
                    <p className="text-[11px] text-white/60 leading-relaxed">
                        Ces frais récurrents peuvent souvent être négociés ou évités en changeant de formule.
                        Imaginez ce que vous pourriez faire avec {data.projectedAnnual.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € de plus par an !
                    </p>
                </div>
            </div>
        </div>
    )
}
