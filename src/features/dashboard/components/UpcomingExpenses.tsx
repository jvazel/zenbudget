import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Zap, ShoppingBag, Coffee, Car, Home, Heart, Sparkles, Tag, TrendingUp, LayoutList } from 'lucide-react'
import { projectionService, type ProjectedTransaction } from '../../../services/projectionService'
import { calculationService } from '../../../services/calculationService'

const ICON_MAP: Record<string, any> = {
    Tag,
    ShoppingBag,
    Coffee,
    Car,
    Home,
    Heart,
    Sparkles,
    Zap,
    TrendingUp
}

export const UpcomingExpenses: React.FC = () => {
    const [projections, setProjections] = useState<ProjectedTransaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [view, setView] = useState<'list' | 'calendar'>('list')

    useEffect(() => {
        loadProjections()
    }, [])

    const loadProjections = async () => {
        setIsLoading(true)
        const data = await projectionService.getUpcomingProjections()
        setProjections(data)
        setIsLoading(false)
    }

    const groups = {
        today: projections.filter(p => p.days_until === 0),
        thisWeek: projections.filter(p => p.days_until > 0 && p.days_until <= 7),
        later: projections.filter(p => p.days_until > 7)
    }

    // Calendar helper: generates next 28 days (4 weeks)
    const calendarDays = Array.from({ length: 28 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return {
            date,
            dayOfMonth: date.getDate(),
            dayOfWeek: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            isToday: i === 0,
            projections: projections.filter(p => p.days_until === i)
        }
    })

    if (isLoading) {
        return (
            <div className="glass rounded-3xl p-6 h-[200px] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center space-y-4">
                    <CalendarIcon className="w-8 h-8 text-white/10" />
                    <div className="h-2 w-24 bg-white/10 rounded-full" />
                </div>
            </div>
        )
    }

    const renderProjection = (proj: ProjectedTransaction, index: number, isCompact = false) => {
        const IconComponent = ICON_MAP[proj.category_icon] || Zap
        const progress = Math.max(0, Math.min(100, (1 - proj.days_until / 30) * 100))

        return (
            <motion.div
                key={proj.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group relative overflow-hidden ${isCompact ? 'p-3' : ''}`}
            >
                {/* Progress Background */}
                <div
                    className="absolute bottom-0 left-0 h-[2px] bg-primary/20 transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                />

                <div className="flex items-center space-x-4 relative z-10">
                    <div
                        className="p-2.5 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${proj.category_color}22` }}>
                        <IconComponent
                            className="w-4 h-4"
                            style={{ color: proj.category_color }} />
                    </div>
                    <div>
                        <p className={`font-bold text-white tracking-tight ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                            {proj.description}
                        </p>
                        <p className="text-[10px] font-medium opacity-40 uppercase tracking-tighter mt-0.5" title={proj.due_date}>
                            {proj.days_until === 0 ? 'Aujourd\'hui' :
                                proj.days_until === 1 ? 'Demain' :
                                    `Dans ${proj.days_until} jours`}
                        </p>
                    </div>
                </div>
                <div className="text-right relative z-10">
                    <p className={`font-bold text-white ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
                        {proj.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                    </p>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">Prévu</p>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="glass rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-xl shadow-lg shadow-primary/5">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="hidden sm:block">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Calendrier Zen</h3>
                    </div>
                </div>

                <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/5">
                    <button
                        onClick={() => setView('list')}
                        className={`p-1.5 rounded-lg transition-all ${view === 'list' ? 'bg-primary text-background shadow-lg' : 'text-white/40 hover:text-white'}`}
                        title="Vue Liste"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`p-1.5 rounded-lg transition-all ${view === 'calendar' ? 'bg-primary text-background shadow-lg' : 'text-white/40 hover:text-white'}`}
                        title="Vue Calendrier"
                    >
                        <CalendarIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-8 overflow-y-auto max-h-[700px] pr-2 scrollbar-none custom-scrollbar pb-4">
                <AnimatePresence mode="wait">
                    {projections.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-12 space-y-2">
                            <p className="text-xs text-white/20 font-medium text-balance">Aucune échéance détectée pour le moment.</p>
                        </motion.div>
                    ) : view === 'list' ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Section: Aujourd'hui */}
                            {groups.today.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 px-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                        <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Aujourd'hui</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {groups.today.map((proj, i) => renderProjection(proj, i))}
                                    </div>
                                </div>
                            )}

                            {/* Section: Cette Semaine */}
                            {groups.thisWeek.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-1">Cette Semaine</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {groups.thisWeek.map((proj, i) => renderProjection(proj, i))}
                                    </div>
                                </div>
                            )}

                            {/* Section: Plus tard */}
                            {groups.later.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-1">Plus tard ce mois-ci</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                                        {groups.later.map((proj, i) => renderProjection(proj, i, true))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* Month Indicator (Inner) */}
                            <div className="flex items-center justify-center space-x-2 py-1 bg-white/5 rounded-2xl border border-white/5 mx-auto w-fit px-4">
                                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                    {(() => {
                                        const startMonth = calendarDays[0].date.toLocaleDateString('fr-FR', { month: 'long' })
                                        const endMonth = calendarDays[27].date.toLocaleDateString('fr-FR', { month: 'long' })
                                        return startMonth === endMonth ? startMonth : `${startMonth} / ${endMonth}`
                                    })()}
                                </span>
                            </div>

                            <div className="grid grid-cols-7 gap-1.5">
                                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                                    <div key={d} className="text-[8px] font-bold text-white/20 text-center uppercase pb-2 tracking-widest">{d}</div>
                                ))}
                                {calendarDays.map((cd, i) => (
                                    <div
                                        key={i}
                                        className={`aspect-square p-1.5 border border-white/5 rounded-xl flex flex-col items-center justify-between transition-all relative overflow-hidden group ${cd.isToday ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/20' : 'bg-white/5 hover:bg-white/10'}`}
                                    >
                                        <span className={`text-[9px] font-bold ${cd.isToday ? 'text-primary' : 'text-white/30'}`}>{cd.dayOfMonth}</span>

                                        <div className="mt-0.5 flex flex-wrap justify-center gap-0.5 max-h-[50%] overflow-hidden">
                                            {cd.projections.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                                                    style={{ backgroundColor: p.category_color }}
                                                    title={`${p.description}: ${p.amount}€`}
                                                />
                                            ))}
                                        </div>

                                        {cd.projections.length > 0 && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        )}

                                        {cd.projections.length > 0 && (
                                            <div className="text-[7px] font-black text-white/40 mt-auto truncate w-full text-center leading-none">
                                                {calculationService.sumTransactions(cd.projections).toFixed(0)}€
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4 px-2 border-t border-white/5">
                                {Array.from(new Set(projections.map(p => p.category_id))).map(catId => {
                                    const p = projections.find(proj => proj.category_id === catId)
                                    if (!p) return null
                                    return (
                                        <div key={catId} className="flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.category_color }} />
                                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{p.category_name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
