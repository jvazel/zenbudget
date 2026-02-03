import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertTriangle, Info, CheckCircle, ArrowRight } from 'lucide-react';
import type { ZenInsight } from '../../../services/zenAnalyst/types';

interface ZenInsightsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    insights: ZenInsight[];
    onDismiss: (id: string) => void;
    onAction?: (insight: ZenInsight) => void;
}

export const ZenInsightsPanel: React.FC<ZenInsightsPanelProps> = ({ isOpen, onClose, insights, onDismiss, onAction }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0f172a] border-l border-white/10 shadow-2xl z-[100] p-6 overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                    Zen Insights
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {insights.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50">
                                <CheckCircle className="w-12 h-12 text-green-500/50" />
                                <p className="text-sm">Tout est calme.<br />Aucune anomalie détectée.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {insights.map(insight => (
                                    <InsightCard
                                        key={insight.id}
                                        insight={insight}
                                        onDismiss={() => onDismiss(insight.id)}
                                        onAction={() => onAction?.(insight)}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const InsightCard: React.FC<{ insight: ZenInsight; onDismiss: () => void; onAction?: () => void }> = ({ insight, onDismiss, onAction }) => {
    const icons = {
        warning: AlertTriangle,
        info: Info,
        success: Sparkles
    };

    const colors = {
        warning: 'text-red-400 bg-red-400/10 border-red-400/20',
        info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        success: 'text-green-400 bg-green-400/10 border-green-400/20'
    };

    const Icon = icons[insight.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-2xl border ${colors[insight.type]} relative group`}
        >
            <button
                onClick={onDismiss}
                className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20 rounded-full"
            >
                <X className="w-3 h-3" />
            </button>

            <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-xl shrink-0 ${colors[insight.type].split(' ')[1]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-bold">{insight.title}</h3>
                    <p className="text-xs opacity-80 leading-relaxed">{insight.message}</p>

                    {insight.actionLabel && (
                        <button
                            onClick={onAction}
                            className="text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 mt-3 hover:underline text-primary"
                        >
                            <span>{insight.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
