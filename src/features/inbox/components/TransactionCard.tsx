import React from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'
import { Zap, X, Check, ShoppingBag, Coffee, Car, Home, Heart, Sparkles, Tag, TrendingUp } from 'lucide-react'

export const ICON_MAP: Record<string, any> = {
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
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface Transaction {
    id: string
    description: string
    amount: number
    predicted_category: string
    category_color?: string
    category_icon?: string
    date: string
    raw_date?: string
    status?: 'pending' | 'validated' | 'ignored'
    category_id?: string
    validated_by?: string
    validated_by_name?: string
}

interface TransactionCardProps {
    transaction: Transaction
    onSwipe: (direction: 'left' | 'right') => void
    isFront: boolean
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
    transaction,
    onSwipe,
    isFront
}) => {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-25, 25])
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])
    const checkScale = useTransform(x, [50, 150], [0.5, 1.2])
    const xIconOpacity = useTransform(x, [-150, -50], [1, 0])
    const checkIconOpacity = useTransform(x, [50, 150], [0, 1])

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe('right')
        } else if (info.offset.x < -100) {
            onSwipe('left')
        }
    }

    return (
        <motion.div
            style={{ x, rotate, opacity }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05 }}
            className={cn(
                "absolute inset-0 cursor-grab active:cursor-grabbing touch-none",
                !isFront && "pointer-events-none"
            )}
        >
            <div className="w-full h-full glass rounded-3xl p-8 flex flex-col justify-between shadow-2xl border border-white/10 overflow-hidden relative">

                {/* Swipe Indicators */}
                <motion.div
                    style={{ opacity: checkIconOpacity, scale: checkScale }}
                    className="absolute top-6 right-6 bg-green-500/20 p-4 rounded-full border border-green-500/50 z-30"
                >
                    <Check className="w-8 h-8 text-green-500" />
                </motion.div>

                <motion.div
                    style={{ opacity: xIconOpacity }}
                    className="absolute top-6 left-6 bg-red-500/20 p-4 rounded-full border border-red-500/50 z-30"
                >
                    <X className="w-8 h-8 text-red-500" />
                </motion.div>

                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Transaction Prédite</p>
                        <h3 className="text-2xl font-bold tracking-tight">{transaction.description}</h3>
                    </div>
                    <div
                        className="p-3 rounded-2xl shadow-inner transition-colors duration-500"
                        style={{ backgroundColor: transaction.category_color ? `${transaction.category_color}33` : 'var(--color-primary-20)' }}
                    >
                        {(() => {
                            const IconComponent = transaction.category_icon ? (ICON_MAP[transaction.category_icon] || Zap) : Zap
                            return (
                                <IconComponent
                                    className="w-6 h-6 transition-colors duration-500"
                                    style={{ color: transaction.category_color || 'var(--color-primary)' }}
                                />
                            )
                        })()}
                    </div>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                    <div>
                        <p className="text-4xl font-mono font-bold tracking-tighter">
                            {transaction.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                        </p>
                        <p
                            className="text-sm font-semibold tracking-wide mt-1 transition-colors duration-500"
                            style={{ color: transaction.category_color || 'var(--color-primary-80)' }}
                        >
                            {transaction.predicted_category}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mb-1">Date</p>
                        <p className="text-xs font-medium opacity-60">{transaction.date}</p>
                    </div>
                </div>

                {/* Action hints */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-8 opacity-20 text-[10px] font-bold uppercase tracking-widest">
                    <span>← Ignorer</span>
                    <span>Valider →</span>
                </div>
            </div>
        </motion.div>
    )
}
