import React from 'react'
import { motion } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface ZenGaugeProps {
    value: number // Reste à vivre
    total: number // Budget total mensuel
    className?: string
}

export const ZenGauge: React.FC<ZenGaugeProps> = ({ value, total, className }) => {
    const percentage = Math.min(Math.max((value / total) * 100, 0), 100)
    const isCritical = percentage < 10
    const radius = 80
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <svg className="w-64 h-64 transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-white/5"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="url(#zen-gradient)"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                />
                <defs>
                    <linearGradient id="zen-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isCritical ? "#f97316" : "#06b6d4"} className="transition-all duration-1000" />
                        <stop offset="100%" stopColor={isCritical ? "#ef4444" : "#3b82f6"} className="transition-all duration-1000" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                        "text-4xl font-mono font-bold tracking-tighter transition-colors duration-1000",
                        isCritical ? "text-red-400" : "text-white"
                    )}
                >
                    {value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}€
                </motion.span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">
                    Reste à Vivre
                </span>
            </div>

            {/* Outer Glow */}
            <div className={cn(
                "absolute inset-0 blur-3xl rounded-full -z-10 animate-pulse transition-colors duration-1000",
                isCritical ? "bg-red-500/20" : "bg-primary/5"
            )} />
        </div>
    )
}
