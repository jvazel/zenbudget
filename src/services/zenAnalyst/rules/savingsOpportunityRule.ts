import type { AnalysisContext, AnalystRule, ZenInsight } from '../types';

const THRESHOLD_SURPLUS = 200; // Trigger if surplus > 200€
const TRIGGER_DAY = 25; // Trigger from 25th of month

export const savingsOpportunityRule: AnalystRule = {
    id: 'savings-opportunity',
    name: 'L\'Opportuniste',
    description: 'Suggère une épargne si un surplus important est détecté en fin de mois.',

    condition: (context: AnalysisContext): boolean => {
        const { currentDate } = context;

        // 1. Check Date: Only active at the end of the month
        if (currentDate.getDate() < TRIGGER_DAY) return false;

        // 2. Check Financial Flow
        const { income, expenses } = calculateMonthlyFlow(context);
        const surplus = income - expenses; // Expenses should be positive number representing outflow? 
        // Typically expenses are stored as negative numbers in transactions.
        // Let's standardise: Income > 0, Expenses < 0.
        // So Surplus = Income + Expenses (since expenses are negative)
        // Wait, let's verify helper.

        // If helper returns absolute values: Surplus = Income - Expenses.
        // Let's make helper return absolute values for clarity.

        return surplus > THRESHOLD_SURPLUS;
    },

    execute: (context: AnalysisContext): ZenInsight => {
        const { income, expenses } = calculateMonthlyFlow(context);
        const surplus = income - expenses;

        return {
            id: `savings-${Date.now()}`,
            type: 'success', // Positive vibe
            title: 'Opportunité d\'épargne 💰',
            message: `Bravo ! Vous avez un surplus de ${surplus.toFixed(2)}€ ce mois-ci. Pourquoi ne pas en épargner une partie ?`,
            ruleId: 'savings-opportunity',
            metadata: {
                income,
                expenses,
                surplus
            },
            createdAt: new Date(),
            isRead: false,
            actionLabel: 'Verser sur un projet',
            actionLink: '/dashboard' // In real app, open FeedProjectModal
        };
    }
};

function calculateMonthlyFlow(context: AnalysisContext): { income: number, expenses: number } {
    const { currentDate, transactions } = context;
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
        const rawDate = (t as any).raw_date || t.date;
        const d = new Date(rawDate);
        if (isNaN(d.getTime())) return;

        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            if (t.amount > 0) {
                income += t.amount;
            } else {
                expenses += Math.abs(t.amount);
            }
        }
    });

    return { income, expenses };
}
