import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, Plus, Trash2, X, Sparkles, ShoppingBag, Coffee, Car, Home, Heart } from 'lucide-react'
import { categoryService, type Category } from '../../../services/categoryService'

const PRESET_ICONS = [
    { name: 'Tag', icon: Tag },
    { name: 'ShoppingBag', icon: ShoppingBag },
    { name: 'Coffee', icon: Coffee },
    { name: 'Car', icon: Car },
    { name: 'Home', icon: Home },
    { name: 'Heart', icon: Heart },
    { name: 'Sparkles', icon: Sparkles },
]

const PRESET_COLORS = [
    '#14b8a6', // primary teal
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#f43f5e', // rose
    '#f59e0b', // amber
    '#10b981', // emerald
]

export const CategoryManager: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [newCategory, setNewCategory] = useState({
        name: '',
        icon: 'Tag',
        color: PRESET_COLORS[0],
        type: 'expense' as 'income' | 'expense'
    })

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        setIsLoading(true)
        const data = await categoryService.getCategories()
        setCategories(data)
        setIsLoading(false)
    }

    const handleCreateOrUpdate = async () => {
        if (!newCategory.name.trim()) return

        if (editingCategory) {
            const updated = await categoryService.updateCategory(editingCategory.id, newCategory)
            if (updated) {
                setCategories(categories.map(c => c.id === updated.id ? updated : c))
                setEditingCategory(null)
                setNewCategory({ name: '', icon: 'Tag', color: PRESET_COLORS[0], type: 'expense' })
                setIsAdding(false)
            }
        } else {
            const created = await categoryService.createCategory(newCategory)
            if (created) {
                setCategories([...categories, created])
                setNewCategory({ name: '', icon: 'Tag', color: PRESET_COLORS[0], type: 'expense' })
                setIsAdding(false)
            }
        }
    }

    const startEditing = (category: Category) => {
        setEditingCategory(category)
        setNewCategory({
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type
        })
        setIsAdding(true)
    }

    const cancelAdding = () => {
        setIsAdding(false)
        setEditingCategory(null)
        setNewCategory({ name: '', icon: 'Tag', color: PRESET_COLORS[0], type: 'expense' })
    }

    const handleDelete = async (id: string) => {
        const success = await categoryService.deleteCategory(id)
        if (success) {
            setCategories(categories.filter(c => c.id !== id))
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-8">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-xl font-bold text-white">Gestion des Catégories</h3>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={isAdding ? cancelAdding : () => setIsAdding(true)}
                    className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary"
                >
                    {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </motion.button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass p-6 rounded-3xl border border-white/10 space-y-4 shadow-2xl"
                    >
                        {/* Type Selection */}
                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                            <button
                                type="button"
                                onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${newCategory.type === 'expense' ? 'bg-primary text-background' : 'text-white/40 hover:text-white'}`}
                            >
                                Dépense
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${newCategory.type === 'income' ? 'bg-primary text-background' : 'text-white/40 hover:text-white'}`}
                            >
                                Revenu
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2">Nom de la catégorie</label>
                            <input
                                type="text"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                placeholder="E.g. Loisirs, Courses..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2">Icône & Couleur</label>
                            <div className="flex flex-wrap gap-2">
                                {PRESET_ICONS.map(({ name, icon: Icon }) => (
                                    <button
                                        key={name}
                                        onClick={() => setNewCategory({ ...newCategory, icon: name })}
                                        className={`p-3 rounded-xl border transition-all ${newCategory.icon === name ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {PRESET_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewCategory({ ...newCategory, color })}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform ${newCategory.color === color ? 'scale-110 border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreateOrUpdate}
                            disabled={!newCategory.name.trim()}
                            className="w-full py-4 bg-primary text-background rounded-2xl font-bold mt-4 shadow-lg shadow-primary/20 disabled:opacity-50 uppercase tracking-[0.2em] text-xs"
                        >
                            {editingCategory ? 'Mettre à jour' : 'Créer la Catégorie'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-12 opacity-50 text-xs uppercase tracking-[0.2em]">Chargement...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 glass rounded-3xl border border-white/5">
                        <p className="text-muted-foreground text-sm italic">Aucune catégorie encore.</p>
                    </div>
                ) : (
                    categories.map((category) => {
                        const IconComponent = PRESET_ICONS.find(i => i.name === category.icon)?.icon || Tag
                        return (
                            <motion.div
                                key={category.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between group"
                            >
                                <div className="flex items-center space-x-4">
                                    <div
                                        className="p-3 rounded-xl"
                                        style={{ backgroundColor: `${category.color}22` }}
                                    >
                                        <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm font-bold text-white">{category.name}</p>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${category.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'}`}>
                                                {category.type === 'income' ? 'Revenu' : 'Dépense'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Budget Dynamique</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEditing(category)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                                        <Plus className="w-4 h-4 rotate-45 group-hover:rotate-0 transition-transform" />
                                    </button>
                                    <button onClick={() => handleDelete(category.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
