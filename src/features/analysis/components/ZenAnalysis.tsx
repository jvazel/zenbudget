import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, FileText, TrendingUp, Wallet, CheckCircle2 } from 'lucide-react'
import { transactionService } from '../../../services/transactionService'
import { type Transaction } from '../../inbox/components/TransactionCard'
import { ICON_MAP } from '../../inbox/components/TransactionCard'
import { useScrollLock } from '../../../hooks/useScrollLock'

export const ZenAnalysis: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [showDetails, setShowDetails] = useState(false)

    // Lock body scroll when modal is open
    useScrollLock(showDetails)

    useEffect(() => {
        const loadData = async () => {
            const allTransactions = await transactionService.getValidatedTransactions(new Date())
            setTransactions(allTransactions)
            setLoading(false)
        }
        loadData()
    }, [])

    // Logic: ZenAlert (Anomalies)
    const anomalies = transactions.filter(t => {
        if (t.amount > 0) return false
        const catTransactions = transactions.filter(other => other.predicted_category === t.predicted_category && other.amount < 0)
        if (catTransactions.length < 2) return false
        const avg = catTransactions.reduce((acc, curr) => acc + Math.abs(curr.amount), 0) / catTransactions.length
        return Math.abs(t.amount) > avg * 1.5
    })

    // Logic: ZenContracts (Recurring)
    const recurring = transactions.reduce((acc, t) => {
        if (t.amount > 0) return acc
        const key = t.description.split(' ')[0]
        if (!acc[key]) acc[key] = { items: [], total: 0 }
        acc[key].items.push(t)
        acc[key].total += Math.abs(t.amount)
        return acc
    }, {} as Record<string, { items: Transaction[], total: number }>)

    const subscriptions = Object.entries(recurring).filter(([_, data]) => data.items.length >= 2)

    // Diagnostic & Analytical Variables
    const hasData = transactions.length > 0
    const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0)
    const displayIncome = hasData ? income : 2800
    const suggestedSavings = displayIncome * 0.1

    if (loading) return <div className="text-center p-20 opacity-40 italic text-xs">Analyse en cours...</div>

    const modalContent = (
        <AnimatePresence>
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
                    onClick={() => setShowDetails(false)}
                    style={{ pointerEvents: 'auto' }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass w-full max-w-md max-h-[85vh] rounded-[40px] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.04]">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-white">Source de données</h2>
                                <p className="text-xs text-muted-foreground uppercase opacity-40 font-bold tracking-widest mt-1">
                                    {transactions.length} transactions validées
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/20 hover:text-white"
                            >
                                <TrendingUp className="w-6 h-6 rotate-180 opacity-50" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar min-h-[350px]">
                            {transactions.length > 0 ? (
                                transactions.map(t => (
                                    <div key={t.id} className="p-5 bg-white/5 rounded-[24px] flex justify-between items-center border border-white/5 group hover:bg-white/10 transition-all hover:scale-[1.01]">
                                        <div className="flex flex-col space-y-1.5 min-w-0">
                                            <span className="text-sm font-bold truncate pr-3 text-white/90">{t.description}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{t.predicted_category}</span>
                                                <span className="text-[10px] opacity-20">•</span>
                                                <span className="text-[10px] opacity-40 font-mono">{t.date}</span>
                                            </div>
                                        </div>
                                        <span className={`text-base font-mono font-bold whitespace-nowrap ${t.amount < 0 ? 'text-red-400' : 'text-primary'}`}>
                                            {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 opacity-40 italic text-sm">
                                    Aucune transaction validée trouvée.
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-white/[0.02] border-t border-white/5">
                            <button
                                onClick={() => setShowDetails(false)}
                                className="w-full py-5 bg-primary text-background rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Terminer l'analyse
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return (
        <div className="w-full max-w-lg space-y-8 pb-32">
            {/* Diagnostic Header (Clickable) */}
            <div className="text-right px-4">
                <button
                    onClick={() => setShowDetails(true)}
                    className="group flex items-center space-x-2 ml-auto hover:opacity-100 transition-opacity"
                    style={{ opacity: 0.4 }}
                >
                    <span className="text-[8px] text-white uppercase font-mono tracking-tighter">
                        {transactions.length} transactions analysées
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] group-hover:animate-pulse" />
                </button>
            </div>

            {/* Portal for Modal */}
            {createPortal(modalContent, document.body)}

            {/* ZenAlert Section */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 px-2">
                    <AlertCircle className="w-4 h-4 text-[#06b6d4]" />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">ZenAlert</h2>
                </div>
                <div className="glass rounded-3xl p-6 border border-white/5 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Analyse des anomalies et des variations de dépenses.
                    </p>

                    {anomalies.length > 0 ? (
                        <div className="space-y-3">
                            {anomalies.map(t => (
                                <div key={t.id} className="p-4 bg-red-500/5 rounded-2xl border border-red-500/20 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-500/10 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{t.description}</p>
                                            <p className="text-[10px] text-red-500/60 uppercase font-bold">Dépense inhabituelle</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono font-bold text-red-500">-{Math.abs(t.amount)}€</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-[#06b6d4]/10 rounded-xl">
                                    <CheckCircle2 className="w-4 h-4 text-[#06b6d4]" />
                                </div>
                                <span className="text-xs font-medium">Tout semble serein ce mois-ci.</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ZenContracts Section */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 px-2">
                    <FileText className="w-4 h-4 text-[#06b6d4]" />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">ZenContracts</h2>
                </div>
                <div className="glass rounded-3xl p-6 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-tight opacity-60">Potentiel de renégociation</p>
                    <div className="space-y-3">
                        {subscriptions.length > 0 ? subscriptions.map(([key, data]) => (
                            <div key={key} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-[#06b6d4]/30 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white/5 rounded-xl">
                                        {data.items[0].category_icon && ICON_MAP[data.items[0].category_icon] ?
                                            React.createElement(ICON_MAP[data.items[0].category_icon], { className: "w-4 h-4 opacity-40" }) :
                                            <FileText className="w-4 h-4 opacity-40" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{data.items[0].description}</p>
                                        <p className="text-[10px] text-muted-foreground tracking-widest uppercase font-bold h-[10px] overflow-hidden">Récurrent • {data.items.length}x</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-mono font-bold">{data.items[0].amount.toLocaleString('fr-FR')}€</p>
                                    <p className="text-[9px] text-[#06b6d4]/60 font-bold uppercase tracking-tighter">/ mois</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 text-center">
                                <p className="text-[10px] text-muted-foreground italic mb-2">Aucun abonnement détecté automatiquement.</p>
                                <p className="text-[9px] text-white/30 uppercase font-bold">Astuce: Valide plus de transactions dans l'Inbox</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ZenTrends Section */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 px-2">
                    <TrendingUp className="w-4 h-4 text-[#06b6d4]" />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">ZenTrends</h2>
                </div>
                <div className="glass rounded-3xl p-6 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-12 text-center">Évolution mensuelle de vos flux.</p>

                    <div style={{ width: '100%', padding: '0 10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px 0', height: '160px' }}>
                            <tbody>
                                <tr>
                                    {[40, 65, 45, 85, 55, 75].map((h, i) => (
                                        <td key={i} style={{ verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '10px' }}>
                                            <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#06cced', marginBottom: '4px', fontFamily: 'monospace' }}>
                                                {h * 12}€
                                            </div>
                                            <div style={{
                                                width: '100%',
                                                minWidth: '24px',
                                                height: `${h}px`,
                                                backgroundColor: '#06b6d4',
                                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '4px 4px 0 0',
                                                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)'
                                            }} />
                                            <div style={{ marginTop: '8px', fontSize: '9px', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.3)', textTransform: 'uppercase' }}>
                                                {5 - i === 0 ? 'M' : `M-${5 - i}`}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ZenSavings Section */}
            <section className="space-y-4">
                <div className="flex items-center space-x-2 px-2">
                    <Wallet className="w-4 h-4 text-[#06b6d4]" />
                    <h2 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">ZenSavings</h2>
                </div>
                <div className="glass rounded-3xl p-8 border border-white/5 bg-[#06b6d4]/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Wallet className="w-24 h-24 text-[#06b6d4]" />
                    </div>
                    <div className="text-center space-y-4 relative z-10">
                        <p className="text-[10px] text-[#06b6d4] font-bold uppercase tracking-[0.3em]">Projection de Sérénité</p>
                        <p className="text-4xl font-mono font-bold tracking-tighter">{suggestedSavings.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</p>
                        <p className="text-[10px] text-muted-foreground italic max-w-[200px] mx-auto leading-relaxed">
                            Basé sur vos revenus {hasData ? `de ce mois (${displayIncome.toLocaleString('fr-FR')}€)` : 'habituels'}, nous vous suggérons d\'épargner 10% pour vos projets futurs.
                        </p>
                        <button
                            className="mt-6 px-8 py-3 bg-[#06b6d4] text-background rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-[#06b6d4]/20 hover:scale-105 transition-transform"
                        >
                            Épargner maintenant
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
