import { useState, useEffect } from 'react';
import { zenAnalystService } from '../services/zenAnalyst/zenAnalystService';
import type { ZenInsight, AnalysisContext } from '../services/zenAnalyst/types';
import { transactionService } from '../services/transactionService';

export function useZenAnalysis(currentDate: Date) {
    const [insights, setInsights] = useState<ZenInsight[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const runAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // Fetch necessary data for context
            // In a real app, this might come from other stores to avoid refetching
            // For now, we fetch current month transactions + some history implicitly via service
            const transactions = await transactionService.getAllValidatedTransactions();
            const { data: { user } } = await import('../lib/supabase').then(m => m.supabase.auth.getUser());

            const context: AnalysisContext = {
                userId: user?.id || 'anon',
                currentDate: currentDate,
                transactions: transactions
            };

            const results = await zenAnalystService.analyze(context);
            setInsights(results);
            setUnreadCount(results.filter(i => !i.isRead).length);
        } catch (error) {
            console.error('ZenAnalysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        runAnalysis();
        // Re-run when date changes or potentially when transactions change (we can add more triggers later)
    }, [currentDate]);

    const markAsRead = (id: string) => {
        setInsights(prev => prev.map(i => i.id === id ? { ...i, isRead: true } : i));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const dismissInsight = (id: string) => {
        setInsights(prev => {
            const newInsights = prev.filter(i => i.id !== id);
            setUnreadCount(newInsights.filter(i => !i.isRead).length);
            return newInsights;
        });
    };

    return {
        insights,
        unreadCount,
        isAnalyzing,
        runAnalysis,
        markAsRead,
        dismissInsight
    };
}
