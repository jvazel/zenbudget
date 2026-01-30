import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter } from 'lucide-react'
import { type Category } from '../../../services/categoryService'

interface TransactionFiltersProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    selectedCategoryIds: string[]
    setSelectedCategoryIds: (ids: string[] | ((prev: string[]) => string[])) => void
    categories: Category[]
    showFilters: boolean
    setShowFilters: (show: boolean) => void
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    selectedCategoryIds,
    setSelectedCategoryIds,
    categories,
    showFilters,
    setShowFilters
}) => {
    const clearFilters = () => {
        setSearchQuery('')
        setSelectedCategoryIds([])
    }

    const hasActiveFilters = searchQuery !== '' || selectedCategoryIds.length > 0

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center space-x-3">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">Transactions</p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-xl transition-all duration-300 ${showFilters || hasActiveFilters
                            ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                            : 'hover:bg-white/5 text-muted-foreground'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="overflow-hidden space-y-4 pb-2 px-2"
                    >
                        {/* Search Input */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher une transaction..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="relative w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-10 text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-white transition-all shadow-lg"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Category Chips */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => {
                                const isSelected = selectedCategoryIds.includes(cat.id)
                                return (
                                    <motion.button
                                        key={cat.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setSelectedCategoryIds((prev) =>
                                                prev.includes(cat.id)
                                                    ? prev.filter((id) => id !== cat.id)
                                                    : [...prev, cat.id]
                                            )
                                        }}
                                        className={`px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all border ${isSelected
                                                ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                                : 'bg-white/5 text-muted-foreground border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {cat.name}
                                    </motion.button>
                                )
                            })}
                        </div>

                        {/* Reset Logic */}
                        <AnimatePresence>
                            {hasActiveFilters && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex items-center justify-between"
                                >
                                    <button
                                        onClick={clearFilters}
                                        className="text-[10px] text-primary font-bold uppercase tracking-widest hover:text-primary/80 transition-colors flex items-center space-x-2 group"
                                    >
                                        <div className="w-4 h-4 rounded-full border border-primary/30 flex items-center justify-center group-hover:border-primary transition-colors">
                                            <X className="w-2 h-2" />
                                        </div>
                                        <span>Effacer les filtres</span>
                                    </button>

                                    <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest">
                                        {selectedCategoryIds.length > 0 ? `${selectedCategoryIds.length} catégorie(s)` : ''}
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
