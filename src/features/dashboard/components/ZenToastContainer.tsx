import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, Sparkles, X } from 'lucide-react'
import { useNotificationStore, type NotificationType } from '../../../stores/useNotificationStore'

const ICON_MAP: Record<NotificationType, any> = {
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
    zen: Sparkles
}

const COLOR_MAP: Record<NotificationType, string> = {
    success: 'text-green-400',
    warning: 'text-amber-400',
    info: 'text-primary',
    zen: 'text-primary'
}

const BG_MAP: Record<NotificationType, string> = {
    success: 'bg-green-500/10 border-green-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
    info: 'bg-primary/10 border-primary/20',
    zen: 'bg-primary/20 border-primary/30'
}

export const ZenToastContainer: React.FC = () => {
    const { notifications, removeNotification } = useNotificationStore()

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:left-auto md:right-8 md:translate-x-0 z-[200] flex flex-col items-center md:items-end space-y-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((n) => {
                    const Icon = ICON_MAP[n.type]
                    return (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 20 }}
                            layout
                            className={`pointer-events-auto flex items-center space-x-4 p-4 pr-3 rounded-2xl glass border ${BG_MAP[n.type]} min-w-[300px] max-w-sm shadow-2xl`}
                        >
                            <div className={`p-2 rounded-xl bg-white/5 ${COLOR_MAP[n.type]}`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1">
                                <p className="text-[11px] font-bold text-white uppercase tracking-wider leading-tight">
                                    {n.type === 'zen' ? 'Moment Zen' : n.type === 'success' ? 'Succès' : 'Notification'}
                                </p>
                                <p className="text-xs text-white/60 font-medium">
                                    {n.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeNotification(n.id)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/20 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}
