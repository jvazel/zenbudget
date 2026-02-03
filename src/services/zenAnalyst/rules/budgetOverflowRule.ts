import type { AnalysisContext, AnalystRule, ZenInsight } from '../types';

export const budgetOverflowRule: AnalystRule = {
    id: 'budget-overflow',
    name: 'Gardien du Dérapage',
    description: 'Alerte si les dépenses d\'une catégorie dépassent 70% de la moyenne habituelle avant le 15 du mois.',

    condition: (context: AnalysisContext): boolean => {
        const { currentDate } = context;
        const currentDay = currentDate.getDate();

        // Only active during the first half of the month (Days 1-14)
        if (currentDay >= 15) return false;

        return hasViolation(context);
    },

    execute: (context: AnalysisContext): ZenInsight => {
        const violation = getFirstViolation(context);

        if (!violation) {
            // Should not happen if condition passed, but typesafety
            return {
                id: `overflow-${Date.now()}`,
                type: 'info',
                title: 'Analyse terminée',
                message: 'Rien à signaler.',
                ruleId: 'budget-overflow',
                createdAt: new Date(),
                isRead: false
            };
        }

        return {
            id: `overflow-${Date.now()}`,
            type: 'warning',
            title: 'Attention au dérapage 📉',
            message: `Vous avez déjà consommé ${Math.round(violation.percentage)}% de votre budget habituel pour "${violation.category}".`,
            ruleId: 'budget-overflow',
            metadata: {
                category: violation.category,
                currentAmount: violation.currentAmount,
                averageAmount: violation.averageAmount
            },
            createdAt: new Date(),
            isRead: false,
            actionLabel: 'Voir les dépenses',
        };
    }
};

// Helper function to extract Logic
function getMetrics(context: AnalysisContext) {
    const { currentDate, transactions } = context;
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // 1. Group by Category & Month
    const spendingByCategoryAndMonth: Record<string, Record<string, number>> = {};

    transactions.forEach(t => {
        if (t.amount >= 0) return; // Ignore income

        const rawDate = (t as any).raw_date || t.date;
        // Try to robustly parse date
        let d = new Date(rawDate);
        if (isNaN(d.getTime())) {
            // Fallback for DD/MM/YYYY
            const parts = t.date.split('/');
            if (parts.length === 3) d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        if (isNaN(d.getTime())) return;

        const catName = t.predicted_category || 'Inconnu';
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`; // e.g. "2026-1"

        if (!spendingByCategoryAndMonth[catName]) spendingByCategoryAndMonth[catName] = {};
        if (!spendingByCategoryAndMonth[catName][monthKey]) spendingByCategoryAndMonth[catName][monthKey] = 0;

        spendingByCategoryAndMonth[catName][monthKey] += Math.abs(t.amount);
    });

    const results: { category: string, current: number, average: number, percentage: number }[] = [];
    const currentMonthKey = `${currentYear}-${currentMonth}`;

    for (const cat in spendingByCategoryAndMonth) {
        const monthsData = spendingByCategoryAndMonth[cat];
        const current = monthsData[currentMonthKey] || 0;

        // Calculate Average from previous months
        let totalHistory = 0;
        let monthsCount = 0;

        for (const mKey in monthsData) {
            if (mKey !== currentMonthKey) {
                totalHistory += monthsData[mKey];
                monthsCount++;
            }
        }

        const average = monthsCount > 0 ? totalHistory / monthsCount : 0;

        if (average > 100) { // Noise filter: ignore small budgets (< 100€)
            const percentage = (current / average) * 100;
            results.push({ category: cat, current, average, percentage });
        }
    }

    return results;
}

function hasViolation(context: AnalysisContext): boolean {
    const metrics = getMetrics(context);
    // Threshold: > 70%
    return metrics.some(m => m.percentage > 70);
}

function getFirstViolation(context: AnalysisContext) {
    const metrics = getMetrics(context);
    const violation = metrics.find(m => m.percentage > 70);

    if (violation) {
        return {
            category: violation.category,
            currentAmount: violation.current,
            averageAmount: violation.average,
            percentage: violation.percentage
        };
    }
    return null;
}
