import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZenGauge } from './ZenGauge'
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import { ProjectCard } from './ProjectCard'
import { ProjectModal } from './ProjectModal'
import { FeedProjectModal } from './FeedProjectModal'
import { TransactionModal } from './TransactionModal'
import { transactionService } from '../../../services/transactionService'
import { savingsService, type SavingsGoal } from '../../../services/savingsService'
import { type Transaction, ICON_MAP } from '../../inbox/components/TransactionCard'
import { useAuth } from '../../auth/AuthContext'

import { supabase } from '../../../lib/supabase'
import { ChevronLeft, ChevronRight, Calendar, Search, Filter, X, Minus } from 'lucide-react'
import { categoryService, type Category } from '../../../services/categoryService'

export const ZenDashboard: React.FC = () => {
    const { user } = useAuth()

    // Peristence logic: init from localStorage
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const saved = localStorage.getItem('zen_selected_month')
        return saved ? new Date(saved) : new Date()
    })

    const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [totals, setTotals] = useState({ income: 0, expenses: 0, rav: 0 })
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)
    const [editingProject, setEditingProject] = useState<SavingsGoal | null>(null)
    const [feedingProject, setFeedingProject] = useState<SavingsGoal | null>(null)
    const [isFeedModalOpen, setIsFeedModalOpen] = useState(false)

    // Visibility State
    const [showTransactions, setShowTransactions] = useState(true)
    const [showProjects, setShowProjects] = useState(true)

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)

    const openEditModal = (t: any) => {
        setEditingTransaction(t)
        setIsModalOpen(true)
    }

    const openNewModal = () => {
        setEditingTransaction(null)
        setIsModalOpen(true)
    }

    const openNewProjectModal = () => {
        setEditingProject(null)
        setIsProjectModalOpen(true)
    }

    const openEditProjectModal = (project: SavingsGoal) => {
        setEditingProject(project)
        setIsProjectModalOpen(true)
    }

    const loadDashboardData = async (date: Date) => {
        const stats = await transactionService.getDashboardStats(date)
        setTotals(stats)

        const recent = await transactionService.getValidatedTransactions(date)
        setRecentTransactions(recent)

        const savings = await savingsService.getSavingsGoals()
        const cats = await categoryService.getCategories()
        setCategories(cats)

        let finalSavings = [...savings]

        // DEMO MODE INITIALIZATION
        if (user?.id === 'demo-user') {
            const demoProject = {
                id: 'demo-house-project',
                owner_id: 'demo-user',
                title: 'Achat maison',
                category: 'Maison',
                target_amount: 10000,
                current_amount: 2500, // Starting with some savings for visual appeal
                created_at: new Date().toISOString()
            }

            // Deduplicate based on ID or Title
            if (!finalSavings.some(s => s.id === demoProject.id || s.title === demoProject.title)) {
                finalSavings.push(demoProject)
            }
        }
        setSavingsGoals(finalSavings)
    }

    useEffect(() => {
        loadDashboardData(selectedDate)
        localStorage.setItem('zen_selected_month', selectedDate.toISOString())

        // Real-time Subscription
        const channel = supabase
            .channel('dashboard-total-updates')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'transactions'
            }, () => loadDashboardData(selectedDate))
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'savings_goals'
            }, () => loadDashboardData(selectedDate))
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedDate])

    const changeMonth = (delta: number) => {
        const newDate = new Date(selectedDate)
        newDate.setMonth(newDate.getMonth() + delta)
        setSelectedDate(newDate)
    }

    const selectMonth = (monthIndex: number) => {
        const newDate = new Date(selectedDate)
        newDate.setMonth(monthIndex)
        setSelectedDate(newDate)
        setIsPickerOpen(false)
    }

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

    const openFeedModal = (goal: SavingsGoal) => {
        setFeedingProject(goal)
        setIsFeedModalOpen(true)
    }

    const performFeedProject = async (amount: number) => {
        if (!feedingProject) return

        try {
            // Handle Demo Project locally
            if (feedingProject.id === 'demo-house-project') {
                setSavingsGoals(prev => prev.map(g => {
                    if (g.id === feedingProject.id) {
                        return { ...g, current_amount: g.current_amount + amount }
                    }
                    return g
                }))
            } else {
                await savingsService.updateSavingsAmount(feedingProject.id, amount)
            }
        } catch (e) {
            console.error('Failed to add savings')
        }
    }

    return (
        <div className="w-full max-w-lg space-y-12 pb-32">
            {/* Month Switcher */}
            <div className="relative flex items-center justify-between px-2">
                <button
                    onClick={() => changeMonth(-1)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/40 hover:text-white"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsPickerOpen(!isPickerOpen)}
                        className="flex items-center space-x-3 px-6 py-2 hover:bg-white/5 rounded-full transition-all group"
                    >
                        <Calendar className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em]">
                            {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                        </span>
                    </button>

                    {isPickerOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-4 glass border border-white/10 rounded-3xl p-4 grid grid-cols-3 gap-2 z-[60] shadow-2xl w-64"
                        >
                            {months.map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => selectMonth(i)}
                                    className={`py-2 text-[10px] uppercase font-bold tracking-widest rounded-xl transition-colors ${selectedDate.getMonth() === i ? 'bg-primary text-background' : 'hover:bg-white/5'}`}
                                >
                                    {m.slice(0, 3)}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                <button
                    onClick={() => changeMonth(1)}
                    className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-white/40 hover:text-white"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Central Gauge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center py-4"
            >
                <ZenGauge value={totals.rav} total={totals.income || 1} />
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-5 rounded-3xl border border-white/5 space-y-3"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <span className="text-[10px] text-green-500 font-bold">+12%</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Entrées</p>
                        <p className="text-xl font-mono font-bold">
                            {totals.income.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass p-5 rounded-3xl border border-white/5 space-y-3"
                >
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <Wallet className="w-4 h-4 text-primary" />
                        </div>
                        <ArrowDownRight className="w-4 h-4 text-white/20" />
                    </div>
                    <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Dépenses</p>
                        <p className="text-xl font-mono font-bold">
                            {totals.expenses.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Dynamic Activity Section */}
            <div className="space-y-4">
                <div className="flex flex-col space-y-4 px-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowTransactions(!showTransactions)}
                                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                            >
                                {showTransactions ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </button>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Transactions</p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2 rounded-xl transition-colors ${showFilters || searchQuery || selectedCategoryIds.length > 0 ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground'}`}
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showTransactions && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-4">
                                    {showFilters && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pb-2"
                                        >
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher une transaction..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            setSelectedCategoryIds(prev =>
                                                                prev.includes(cat.id)
                                                                    ? prev.filter(id => id !== cat.id)
                                                                    : [...prev, cat.id]
                                                            )
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedCategoryIds.includes(cat.id)
                                                            ? 'bg-primary text-background border-primary'
                                                            : 'bg-white/5 text-muted-foreground border-white/5 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                            </div>

                                            {(searchQuery || selectedCategoryIds.length > 0) && (
                                                <button
                                                    onClick={() => {
                                                        setSearchQuery('')
                                                        setSelectedCategoryIds([])
                                                    }}
                                                    className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline"
                                                >
                                                    Effacer les filtres
                                                </button>
                                            )}
                                        </motion.div>
                                    )}

                                    <div className="glass rounded-3xl overflow-hidden border border-white/5">
                                        {(() => {
                                            const filtered = recentTransactions.filter(t => {
                                                const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase())
                                                const matchesCategory = selectedCategoryIds.length === 0 ||
                                                    (t.category_id && selectedCategoryIds.includes(t.category_id)) ||
                                                    (selectedCategoryIds.some(id => categories.find(c => c.id === id)?.name === t.predicted_category))
                                                return matchesSearch && matchesCategory
                                            })

                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="p-8 text-center text-xs text-muted-foreground italic">
                                                        {searchQuery || selectedCategoryIds.length > 0
                                                            ? "Aucun résultat pour ces filtres."
                                                            : "Aucune activité récente pour le moment."}
                                                    </div>
                                                )
                                            }

                                            return filtered.map(t => (
                                                <div
                                                    key={t.id}
                                                    onClick={() => openEditModal(t)}
                                                    className="p-4 border-b last:border-0 border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div
                                                            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors duration-500"
                                                            style={{ backgroundColor: t.category_color ? `${t.category_color}15` : (t.amount > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)') }}
                                                        >
                                                            {(() => {
                                                                const IconComponent = t.category_icon ? (ICON_MAP[t.category_icon] || (t.amount > 0 ? ArrowUpRight : ArrowDownRight)) : (t.amount > 0 ? ArrowUpRight : ArrowDownRight)
                                                                return (
                                                                    <IconComponent
                                                                        className="w-5 h-5 transition-colors duration-500"
                                                                        style={{ color: t.category_color || (t.amount > 0 ? '#22c55e' : 'rgba(255, 255, 255, 0.4)') }}
                                                                    />
                                                                )
                                                            })()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">{t.description}</p>
                                                            <p className="text-[10px] text-muted-foreground flex items-center space-x-1">
                                                                <span>{t.date}</span>
                                                                <span className="opacity-20">•</span>
                                                                <span style={{ color: t.category_color || 'inherit' }} className="font-semibold">{t.predicted_category}</span>
                                                                {t.validated_by && t.validated_by !== user?.id && (
                                                                    <>
                                                                        <span className="opacity-20">•</span>
                                                                        <span className="text-primary font-bold uppercase tracking-tighter">
                                                                            Validé par {t.validated_by_name?.split(' ')[0] || 'Partner'}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm font-mono font-bold ${t.amount > 0 ? 'text-green-500' : ''}`}>
                                                        {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                                                    </p>
                                                </div>
                                            ))
                                        })()}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div >
            </div>
            {/* Projects Section */}
            <div className="space-y-6 pt-6">
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowProjects(!showProjects)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                        >
                            {showProjects ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </button>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Mes Projets Zen</p>
                    </div>
                    <button
                        onClick={openNewProjectModal}
                        className="text-[10px] text-primary font-bold uppercase tracking-widest cursor-pointer hover:underline flex items-center space-x-1"
                    >
                        <Plus className="w-3 h-3" />
                        <span>Nouveau</span>
                    </button>
                </div>

                <AnimatePresence>
                    {showProjects && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                                {savingsGoals.length > 0 ? (
                                    savingsGoals.map(goal => (
                                        <div key={goal.id} onClick={() => openEditProjectModal(goal)} className="cursor-pointer">
                                            <ProjectCard
                                                title={goal.title}
                                                current={goal.current_amount}
                                                target={goal.target_amount}
                                                category={goal.category}
                                                onFeed={(e) => {
                                                    e.stopPropagation()
                                                    openFeedModal(goal)
                                                }}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full glass rounded-3xl p-8 border border-white/5 text-center text-xs text-muted-foreground italic">
                                        Aucun projet d'épargne défini.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openNewModal}
                className="fixed bottom-28 right-8 w-16 h-16 bg-primary text-background rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center z-40"
            >
                <Plus className="w-8 h-8" />
            </motion.button>

            <TransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {/* Realtime refreshes automatically */ }}
                transaction={editingTransaction}
            />

            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSuccess={() => {/* Realtime refreshes automatically */ }}
                project={editingProject}
            />

            <FeedProjectModal
                isOpen={isFeedModalOpen}
                onClose={() => setIsFeedModalOpen(false)}
                onSuccess={performFeedProject}
                projectTitle={feedingProject?.title || ''}
            />
        </div>
    )
}
