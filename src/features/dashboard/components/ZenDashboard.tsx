import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZenGauge } from './ZenGauge'
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Plus, ChevronLeft, ChevronRight, Calendar, RotateCcw, AlertTriangle, Sparkles, Check } from 'lucide-react'
import { ProjectCard } from './ProjectCard'
import { UpcomingExpenses } from './UpcomingExpenses'
import { BalanceProjection } from './BalanceProjection'
import { ZenGuide } from './ZenGuide'
import { OverdraftAlert } from './OverdraftAlert'
import { ProjectModal } from './ProjectModal'
import { FeedProjectModal } from './FeedProjectModal'
import { BankConnectionSection } from './BankConnectionSection'
import { TransactionModal } from './TransactionModal'
import { transactionService } from '../../../services/transactionService'
import { savingsService, type SavingsGoal } from '../../../services/savingsService'
import { bankingService, type BankAccount } from '../../../services/bankingService'
import { type Transaction, ICON_MAP } from '../../inbox/components/TransactionCard'
import { supabase } from '../../../lib/supabase'
import { useDateStore } from '../../../stores/useDateStore'
import { TransactionFilters } from './TransactionFilters'
import { categoryService, type Category } from '../../../services/categoryService'
import { AccountMappingModal } from './AccountMappingModal'
import { SimulationPanel } from './SimulationPanel'
import { ZenInsightsPanel } from './ZenInsightsPanel'
import { InstallPwaPrompt } from './InstallPwaPrompt'
import { useZenAnalysis } from '../../../hooks/useZenAnalysis'
import { Brain } from 'lucide-react'

const TransactionItem: React.FC<{ transaction: Transaction; onToggleCheck: (e: React.MouseEvent) => void }> = ({ transaction, onToggleCheck }) => {
    const IconComponent = transaction.category_icon ? (ICON_MAP[transaction.category_icon] || (transaction.amount > 0 ? ArrowUpRight : ArrowDownRight)) : (transaction.amount > 0 ? ArrowUpRight : ArrowDownRight)
    const isAnomaly = transaction.anomaly?.isAnomaly

    return (
        <div
            className={`p-4 bg-white/5 hover:bg-white/10 border rounded-2xl flex items-center justify-between transition-all group cursor-pointer active:scale-[0.98] ${isAnomaly
                ? 'border-red-500/30 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                : 'border-white/5 hover:border-white/20'
                }`}
        >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: transaction.category_color ? `${transaction.category_color}15` : (transaction.amount > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)') }}
                >
                    <IconComponent
                        className="w-5 h-5"
                        style={{ color: transaction.category_color || (transaction.amount > 0 ? '#22c55e' : 'rgba(255, 255, 255, 0.4)') }}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-bold truncate">{transaction.description}</p>
                        {isAnomaly && (
                            <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                title={`+${Math.round(transaction.anomaly?.difference || 0)}% par rapport à d'habitude`}
                                className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-0.5 rounded-full border border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)] shrink-0"
                            >
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-[10px] font-bold tracking-tight">ZENALERT</span>
                            </motion.div>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
                        <span>{transaction.date}</span>
                        <span className="opacity-20">•</span>
                        <span style={{ color: transaction.category_color || 'inherit' }} className="font-semibold truncate">{transaction.predicted_category}</span>
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-end w-32 border-l border-white/5 ml-4 pl-4 shrink-0">
                <p className={`text-sm font-mono font-bold flex items-center space-x-2 ${transaction.amount > 0 ? 'text-green-500' : (isAnomaly ? 'text-red-500' : '')}`}>
                    {isAnomaly && <Sparkles className="w-3 h-3 animate-pulse text-red-400" />}
                    <span>{transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</span>
                </p>
            </div>

            <button
                onClick={onToggleCheck}
                className={`ml-4 p-2 rounded-xl border transition-all ${transaction.is_checked ? 'bg-green-500/20 border-green-500/30 text-green-500' : 'bg-white/5 border-white/5 text-white/10 hover:text-white/40 hover:bg-white/10'}`}
                title={transaction.is_checked ? "Transaction pointée" : "Pointer la transaction"}
            >
                <Check className={`w-4 h-4 ${transaction.is_checked ? 'scale-110' : 'scale-90 opacity-40'}`} />
            </button>
        </div>
    )
}

export const ZenDashboard: React.FC = () => {
    const { selectedDate, nextMonth, prevMonth, setDate, resetToToday } = useDateStore()

    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [totals, setTotals] = useState({ income: 0, expenses: 0, rav: 0 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)
    const [editingProject] = useState<SavingsGoal | null>(null)
    const [feedingProject, setFeedingProject] = useState<SavingsGoal | null>(null)
    const [isFeedModalOpen, setIsFeedModalOpen] = useState(false)

    // Filter State
    const [filters, setFilters] = useState({
        search: '',
        categoryId: 'all',
        checkStatus: 'all' as 'all' | 'checked' | 'unchecked'
    })

    const handleOpenTransactionModal = (t: any = null) => {
        setEditingTransaction(t)
        setIsModalOpen(true)
    }

    const loadDashboardData = async (date: Date) => {
        try {
            const stats = await transactionService.getDashboardStats(date)
            setTotals(stats)

            const recent = await transactionService.getValidatedTransactions(date)
            setRecentTransactions(recent)

            const savings = await savingsService.getSavingsGoals()
            setSavingsGoals(savings)
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        }
    }

    const loadCategories = async () => {
        try {
            const cats = await categoryService.getCategories()
            console.log('Categories loaded:', cats)
            setCategories(cats || [])
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    const [isSimulationPanelOpen, setIsSimulationPanelOpen] = useState(false)
    const [isZenPanelOpen, setIsZenPanelOpen] = useState(false)
    const { insights, unreadCount, dismissInsight, markAsRead } = useZenAnalysis(selectedDate)

    const handleInsightAction = (insight: any) => {
        setIsZenPanelOpen(false); // Close panel
        markAsRead(insight.id);

        if (insight.ruleId === 'budget-overflow') {
            // Filter by category
            const categoryName = insight.metadata?.category;
            if (categoryName) {
                // Try to find category ID
                const cat = categories.find(c => c.name === categoryName || c.name.toLowerCase() === categoryName.toLowerCase());
                if (cat) {
                    setFilters(prev => ({ ...prev, categoryId: cat.id }));
                    // Maybe scroll to transactions? 
                } else {
                    setFilters(prev => ({ ...prev, search: categoryName }));
                }
            }
        } else if (insight.ruleId === 'subscription-spike') {
            const subName = insight.metadata?.subscription;
            if (subName) {
                setFilters(prev => ({ ...prev, search: subName }));
            }
        } else if (insight.ruleId === 'savings-opportunity') {
            // Open Feed Project Modal? Or just highlight projects?
            // Since we don't know WHICH project, maybe just scroll to projects?
            // For now, do nothing special, user is on dashboard.
        }
    }

    const [mappingData, setMappingData] = useState<{ accounts: BankAccount[], sessionId: string, connectionId: string } | null>(null)
    const [isMappingModalOpen, setIsMappingModalOpen] = useState(false)

    const handleFinalizeBankConnection = async (code: string) => {
        try {
            const { accounts, sessionId } = await bankingService.finalizeConnection(code)

            // Get the connection we just finalized to get its ID
            const connections = await bankingService.getActiveConnections()
            const currentConn = connections.find(c => c.requisition_id === sessionId)

            if (currentConn) {
                setMappingData({
                    accounts,
                    sessionId,
                    connectionId: currentConn.id
                })
                setIsMappingModalOpen(true)
            }

            // Clean URL
            window.history.replaceState({}, document.title, "/dashboard")
            // Refresh data
            loadDashboardData(selectedDate)
        } catch (err) {
            console.error('Failed to finalize bank connection:', err)
        }
    }

    useEffect(() => {
        loadDashboardData(selectedDate)
        loadCategories()

        // Handle Bank Connection Callback (Enable Banking returns ?code=...)
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const isCallback = params.get('banking_callback')

        if (isCallback && code) {
            handleFinalizeBankConnection(code)
        }

        const channel = supabase
            .channel('dashboard-updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadDashboardData(selectedDate))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals' }, () => loadDashboardData(selectedDate))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => loadCategories())
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [selectedDate])

    const changeMonth = (delta: number) => { delta > 0 ? nextMonth() : prevMonth() }

    const isCurrentMonth = () => {
        const now = new Date()
        return selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear()
    }

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

    const openFeedModal = (goal: SavingsGoal) => {
        setFeedingProject(goal)
        setIsFeedModalOpen(true)
    }

    const performFeedProject = async (amount: number) => {
        if (!feedingProject) return
        await savingsService.updateSavingsAmount(feedingProject.id, amount)
    }

    const handleToggleCheck = async (e: React.MouseEvent, transaction: Transaction) => {
        e.stopPropagation()
        const newChecked = !transaction.is_checked

        // Optimistic UI update
        setRecentTransactions(prev => prev.map(t =>
            t.id === transaction.id ? { ...t, is_checked: newChecked } : t
        ))

        try {
            await transactionService.toggleTransactionCheck(transaction.id, newChecked)
        } catch (error) {
            // Revert on error
            setRecentTransactions(prev => prev.map(t =>
                t.id === transaction.id ? { ...t, is_checked: !newChecked } : t
            ))
            console.error('Failed to toggle check:', error)
        }
    }

    const filteredTransactions = recentTransactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase())
        const matchesCategory = filters.categoryId === 'all' || t.category_id === filters.categoryId
        const matchesCheck = filters.checkStatus === 'all' ||
            (filters.checkStatus === 'checked' ? t.is_checked : !t.is_checked)

        return matchesSearch && matchesCategory && matchesCheck
    })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-32">
            {/* Left Column: Stats & History */}
            <div className="lg:col-span-2 space-y-8">
                {/* Month Switcher \u0026 Header */}
                <div className={`relative flex items-center justify-between px-2 transition-all duration-300 ${!isCurrentMonth() ? 'bg-primary/5 rounded-3xl p-2 animate-pulse-slow' : ''}`}>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsZenPanelOpen(true)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all relative group"
                            title="Zen Insights"
                        >
                            <Brain className={`w-5 h-5 ${unreadCount > 0 ? 'text-primary' : 'text-white/40 group-hover:text-white'}`} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </button>
                        <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/40 hover:text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsPickerOpen(!isPickerOpen)} className="flex items-center space-x-3 px-6 py-2 hover:bg-white/5 rounded-full transition-all group">
                            <Calendar className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-[0.2em]">
                                {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </span>
                        </button>
                        {isPickerOpen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-1/2 -translate-x-1/2 mt-4 glass border border-white/10 rounded-3xl p-4 grid grid-cols-3 gap-2 z-[60] shadow-2xl w-64">
                                {months.map((m, i) => (
                                    <button key={m} onClick={() => { setDate(new Date(selectedDate.getFullYear(), i, 1)); setIsPickerOpen(false); }} className={`py-2 text-[10px] uppercase font-bold tracking-widest rounded-xl transition-colors ${selectedDate.getMonth() === i ? 'bg-primary text-background' : 'hover:bg-white/5'}`}>
                                        {m.slice(0, 3)}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/40 hover:text-white">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                    {!isCurrentMonth() && (
                        <motion.button initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} onClick={resetToToday} className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-primary text-background px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center space-x-1 shadow-lg hover:scale-105 transition-transform">
                            <RotateCcw className="w-3 h-3" />
                            <span>Aujourd'hui</span>
                        </motion.button>
                    )}
                </div>

                {/* Central Gauge */}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center py-4">
                    <ZenGauge value={totals.rav} total={totals.income || 1} />
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass p-5 rounded-3xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-green-500/10 rounded-xl"><TrendingUp className="w-4 h-4 text-green-500" /></div>
                            <span className="text-[10px] text-green-500 font-bold">+12%</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Entrées</p>
                            <p className="text-xl font-mono font-bold">{totals.income.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</p>
                        </div>
                    </motion.div>
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass p-5 rounded-3xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-primary/10 rounded-xl"><Wallet className="w-4 h-4 text-primary" /></div>
                            <ArrowDownRight className="w-4 h-4 text-white/20" />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dépenses</p>
                            <p className="text-xl font-mono font-bold">{totals.expenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€</p>
                        </div>
                    </motion.div>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col space-y-4 px-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Historique des flux</h3>
                            <span className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">{filteredTransactions.length} transaction(s)</span>
                        </div>

                        <TransactionFilters
                            search={filters.search}
                            onSearchChange={(search) => setFilters(prev => ({ ...prev, search }))}
                            categoryId={filters.categoryId}
                            onCategoryChange={(categoryId) => setFilters(prev => ({ ...prev, categoryId }))}
                            checkStatus={filters.checkStatus}
                            onCheckStatusChange={(checkStatus) => setFilters(prev => ({ ...prev, checkStatus }))}
                            categories={categories}
                        />
                    </div>
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredTransactions.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass p-12 rounded-3xl text-center space-y-4 cursor-pointer hover:bg-white/5 transition-colors group"
                                    onClick={() => handleOpenTransactionModal()}
                                >
                                    <Plus className="w-12 h-12 text-primary mx-auto group-hover:scale-110 transition-transform" />
                                    <p className="text-sm text-white/40">Aucune transaction ce mois-ci.<br /><span className="text-primary text-xs font-bold uppercase tracking-widest mt-2 block">Cliquez pour ajouter</span></p>
                                </motion.div>
                            ) : (
                                filteredTransactions.map((tx, idx) => (
                                    <motion.div
                                        key={tx.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{
                                            delay: idx * 0.03,
                                            duration: 0.3,
                                            ease: "easeOut"
                                        }}
                                        layout
                                        onClick={() => handleOpenTransactionModal(tx)}
                                    >
                                        <TransactionItem
                                            transaction={tx}
                                            onToggleCheck={(e) => handleToggleCheck(e, tx)}
                                        />
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="space-y-6 pt-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Mes Projets Zen</h3>
                        <button onClick={() => setIsProjectModalOpen(true)} className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline flex items-center space-x-1">
                            <Plus className="w-3 h-3" />
                            <span>Nouveau</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savingsGoals.map(goal => (
                            <ProjectCard key={goal.id} title={goal.title} current={goal.current_amount} target={goal.target_amount} category={goal.category} onFeed={(e) => { e.stopPropagation(); openFeedModal(goal); }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column: Upcoming & Vision */}
            <div className="space-y-8 lg:col-span-1">
                <ZenGuide transactionCount={recentTransactions.length} />
                <OverdraftAlert />
                <BalanceProjection onOpenSimulation={() => setIsSimulationPanelOpen(true)} />
                <UpcomingExpenses />
                <BankConnectionSection />
            </div>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleOpenTransactionModal()}
                className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-16 h-16 bg-primary text-background rounded-full shadow-2xl flex items-center justify-center z-[100] ring-4 ring-primary/20 hover:ring-primary/40 transition-all"
                title="Ajouter une transaction"
            >
                <Plus className="w-8 h-8" />
            </motion.button>

            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => loadDashboardData(selectedDate)} transaction={editingTransaction} />
            <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSuccess={() => loadDashboardData(selectedDate)} project={editingProject} />
            <FeedProjectModal isOpen={isFeedModalOpen} onClose={() => setIsFeedModalOpen(false)} onSuccess={performFeedProject} projectTitle={feedingProject?.title || ''} />

            <AccountMappingModal
                isOpen={isMappingModalOpen}
                onClose={() => setIsMappingModalOpen(false)}
                bankAccounts={mappingData?.accounts || []}
                sessionId={mappingData?.sessionId || ''}
                connectionId={mappingData?.connectionId || ''}
                onSuccess={() => loadDashboardData(selectedDate)}
            />

            <SimulationPanel
                isOpen={isSimulationPanelOpen}
                onClose={() => setIsSimulationPanelOpen(false)}
            />

            <ZenInsightsPanel
                isOpen={isZenPanelOpen}
                onClose={() => setIsZenPanelOpen(false)}
                insights={insights}
                onDismiss={dismissInsight}
                onAction={handleInsightAction}
            // onMarkAsRead={markAsRead}
            />

            <InstallPwaPrompt />
        </div>
    )
}
