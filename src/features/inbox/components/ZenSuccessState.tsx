import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Sparkles } from 'lucide-react'

export const ZenSuccessState: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col items-center justify-center space-y-6 text-center"
        >
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative"
            >
                <div className="p-8 bg-primary/10 rounded-full border border-primary/20 text-primary mb-2 relative z-10">
                    <Zap className="w-16 h-16 fill-current" />
                </div>
                {/* Decorative Sparkles */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                        rotate: [0, 90, 180]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-4 -right-4 text-primary/40"
                >
                    <Sparkles className="w-8 h-8" />
                </motion.div>
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full -z-10 animate-pulse" />
            </motion.div>

            <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
            >
                <h2 className="text-4xl font-bold tracking-tight text-white">Inbox Zero !</h2>
                <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold">Esprit Calme • Budget Clair</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-[10px] text-primary font-bold uppercase tracking-widest animate-pulse"
            >
                Redirection vers le Dashboard...
            </motion.div>
        </motion.div>
    )
}
