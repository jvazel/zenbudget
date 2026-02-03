import React from 'react'
import { motion } from 'framer-motion'
import { Target, Zap } from 'lucide-react'

interface ProjectCardProps {
    title: string
    current: number
    target: number
    category: string
    icon?: React.ReactNode
    onFeed?: (e: React.MouseEvent) => void
    onClick?: () => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ title, current, target, category, icon, onFeed, onClick }) => {
    const percentage = Math.min((current / target) * 100, 100)

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={onClick}
            className="glass rounded-3xl p-6 border border-white/5 space-y-4 group transition-all hover:bg-white/5 cursor-pointer"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                        {icon || <Target className="w-5 h-5 text-primary" />}
                    </div>
                    <div>
                        <p className="text-sm font-bold">{title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{category}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 text-primary">
                    <Zap className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-bold">{Math.round(percentage)}%</span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-white/40">{current.toLocaleString()}€</span>
                    <span className="text-white/60">Objectif {target.toLocaleString()}€</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                </div>
            </div>

            <button
                onClick={onFeed}
                className="w-full py-2 text-[10px] font-bold text-white/20 uppercase tracking-widest hover:text-primary transition-colors"
            >
                Alimenter le projet
            </button>
        </motion.div>
    )
}
