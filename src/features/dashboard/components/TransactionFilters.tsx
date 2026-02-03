import React from 'react'
import { Search, X, Filter, Check } from 'lucide-react'
import { type Category } from '../../../services/categoryService'
import { motion, AnimatePresence } from 'framer-motion'

interface TransactionFiltersProps {
    search: string
    onSearchChange: (value: string) => void
    categoryId: string
    onCategoryChange: (id: string) => void
    checkStatus: 'all' | 'checked' | 'unchecked'
    onCheckStatusChange: (status: 'all' | 'checked' | 'unchecked') => void
    categories: Category[]
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    search,
    onSearchChange,
    categoryId,
    onCategoryChange,
    checkStatus,
    onCheckStatusChange,
    categories
}) => {
    const hasActiveFilters = search !== '' || categoryId !== 'all' || checkStatus !== 'all'

    const clearFilters = () => {
        onSearchChange('')
        onCategoryChange('all')
        onCheckStatusChange('all')
    }

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative flex-1 group w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Rechercher une transaction..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/30 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <select
                        value={categoryId}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full md:w-48 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 appearance-none cursor-pointer hover:bg-white/10 transition-all text-white/60 font-medium"
                    >
                        <option value="all" className="bg-[#0f172a] text-white">
                            Toutes catégories {categories.length > 0 ? `(${categories.length})` : ''}
                        </option>
                        {categories && categories.length > 0 ? (
                            categories.map(cat => (
                                <option key={cat.id} value={cat.id} className="bg-[#0f172a] text-white">
                                    {cat.name}
                                </option>
                            ))
                        ) : (
                            <option disabled className="bg-[#0f172a] text-white/20 italic">
                                Chargement...
                            </option>
                        )}
                    </select>
                    <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                </div>

                <div className="relative flex-1 md:flex-none">
                    <select
                        value={checkStatus}
                        onChange={(e) => onCheckStatusChange(e.target.value as any)}
                        className="w-full md:w-40 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/30 appearance-none cursor-pointer hover:bg-white/10 transition-all text-white/60 font-medium"
                    >
                        <option value="all" className="bg-[#0f172a] text-white">Tous états</option>
                        <option value="checked" className="bg-[#0f172a] text-white">Pointées</option>
                        <option value="unchecked" className="bg-[#0f172a] text-white">Non pointées</option>
                    </select>
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
                </div>

                <AnimatePresence>
                    {hasActiveFilters && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={clearFilters}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group flex items-center justify-center text-primary"
                            title="Réinitialiser les filtres"
                        >
                            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
