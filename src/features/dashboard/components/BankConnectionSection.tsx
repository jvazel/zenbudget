import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark, Search, Plus, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { bankingService, type BankInstitution } from '../../../services/bankingService'

export const BankConnectionSection: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [banks, setBanks] = useState<BankInstitution[]>([])
    const [isLoadingBanks, setIsLoadingBanks] = useState(false)
    const [activeConnections, setActiveConnections] = useState<any[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        loadConnections()
    }, [])

    const loadConnections = async () => {
        try {
            const data = await bankingService.getActiveConnections()
            setActiveConnections(data)
        } catch (err) {
            console.error('Failed to load connections:', err)
        }
    }

    const handleSearchBanks = async () => {
        if (!searchQuery) return
        setIsLoadingBanks(true)
        try {
            const data = await bankingService.listInstitutions()
            const filtered = data.filter(b =>
                b.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setBanks(filtered)
        } catch (err) {
            console.error('Failed to search banks:', err)
        } finally {
            setIsLoadingBanks(false)
        }
    }

    const handleConnectBank = async (bank: BankInstitution) => {
        try {
            const redirectUrl = window.location.origin + '/dashboard?banking_callback=true'
            const link = await bankingService.createConnectionLink(bank.id, redirectUrl)
            // Redirect user to bank
            window.location.href = link
        } catch (err) {
            console.error('Failed to create bank link:', err)
        }
    }

    const handleManualSync = async () => {
        setIsRefreshing(true)
        try {
            for (const conn of activeConnections) {
                // sessionId is stored in requisition_id for Enable Banking linked connections
                const sessionId = conn.requisition_id

                for (const bankAcc of conn.bank_accounts) {
                    // bankAcc.account_id is the internal UUID
                    // bankAcc.external_id is the Enable Banking account name/id
                    const txs = await bankingService.syncTransactions(bankAcc.account_id, bankAcc.external_id, sessionId)
                    await bankingService.saveTransactions(txs, bankAcc.account_id)
                }
            }
            // Notify parent to refresh if needed (usually handled by Supabase Realtime)
        } catch (err) {
            console.error('Sync failed:', err)
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Synchronisation Bancaire</h3>
                {activeConnections.length > 0 && (
                    <button
                        onClick={handleManualSync}
                        disabled={isRefreshing}
                        className={`p-2 hover:bg-white/5 rounded-xl transition-all ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
                    >
                        <RefreshCw className="w-4 h-4 text-primary/60" />
                    </button>
                )}
            </div>

            {activeConnections.length === 0 && !isConnecting ? (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsConnecting(true)}
                    className="glass p-6 rounded-3xl border border-dashed border-white/10 hover:border-primary/30 transition-all cursor-pointer group"
                >
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Landmark className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Connecter votre banque</p>
                            <p className="text-[10px] text-muted-foreground">Plus d'import manuel, tout est automatique.</p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {activeConnections.map(conn => (
                        <div key={conn.id} className="glass p-4 rounded-3xl border border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold">Banque Connectée</p>
                                    <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">ID: {conn.institution_id}</p>
                                </div>
                            </div>
                            <div className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-full uppercase tracking-widest">
                                Actif
                            </div>
                        </div>
                    ))}

                    {!isConnecting && (
                        <button
                            onClick={() => setIsConnecting(true)}
                            className="w-full py-3 glass rounded-2xl border border-white/5 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest transition-all text-muted-foreground flex items-center justify-center space-x-2"
                        >
                            <Plus className="w-3 h-3" />
                            <span>Ajouter un compte</span>
                        </button>
                    )}
                </div>
            )}

            <AnimatePresence>
                {isConnecting && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="glass p-6 rounded-3xl border border-primary/20 space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider">Choisir votre banque</h4>
                            <button onClick={() => setIsConnecting(false)} className="p-1 hover:bg-white/10 rounded-lg">
                                <X className="w-4 h-4 text-white/40" />
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchBanks()}
                                placeholder="Nom de la banque (ex: Bourso...)"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {banks.map(bank => (
                                <button
                                    key={bank.id}
                                    onClick={() => handleConnectBank(bank)}
                                    className="w-full p-3 hover:bg-white/5 rounded-2xl flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center space-x-3">
                                        {bank.logo ? (
                                            <img src={bank.logo} alt={bank.name} className="w-6 h-6 rounded-lg bg-white" />
                                        ) : (
                                            <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center">
                                                <Landmark className="w-3 h-3 text-white/40" />
                                            </div>
                                        )}
                                        <span className="text-xs font-medium">{bank.name}</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-white/0 group-hover:text-primary transition-all" />
                                </button>
                            ))}
                            {isLoadingBanks && (
                                <div className="text-center py-4">
                                    <RefreshCw className="w-5 h-5 text-primary/40 animate-spin mx-auto" />
                                </div>
                            )}
                            {banks.length === 0 && !isLoadingBanks && searchQuery && (
                                <div className="text-center py-4 text-muted-foreground">
                                    <AlertCircle className="w-5 h-5 mx-auto mb-2 opacity-20" />
                                    <p className="text-[10px] uppercase font-bold tracking-widest">Aucune banque trouvée</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
