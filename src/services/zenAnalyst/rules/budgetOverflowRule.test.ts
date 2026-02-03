import { describe, it, expect } from 'vitest';
import { budgetOverflowRule } from './budgetOverflowRule';
import { AnalysisContext } from '../types';

// Helper to create mock transaction
const createTx = (amount: number, category: string, dateStr: string) => ({
    id: `tx-${Math.random()}`,
    description: 'Mock',
    amount,
    date: dateStr, // "YYYY-MM-DD" or similar ISO
    raw_date: new Date(dateStr).toISOString(),
    predicted_category: category,
    status: 'validated' as const,
    category_color: '#000',
    category_icon: '',
    category_id: ''
});

describe('Budget Overflow Rule', () => {
    it('should NOT trigger if we are past the 15th of the month', () => {
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-02-16T10:00:00Z'), // 16th
            transactions: []
        };
        expect(budgetOverflowRule.condition(context)).toBe(false);
    });

    it('should NOT trigger if spending is low (< 70% of average)', () => {
        // Average = 1000 (Prev month)
        // Current = 500 (50%)
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-02-10T10:00:00Z'), // 10th
            transactions: [
                // History (Jan)
                createTx(-1000, 'Alimentation', '2026-01-15'),
                // Current (Feb)
                createTx(-500, 'Alimentation', '2026-02-05'),
            ]
        };
        expect(budgetOverflowRule.condition(context)).toBe(false);
    });

    it('should TRIGGER if spending is high (> 70% of average) early in month', () => {
        // Average = 1000
        // Current = 750 (75%)
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-02-10T10:00:00Z'), // 10th
            transactions: [
                // History (Jan)
                createTx(-1000, 'Alimentation', '2026-01-15'),
                // Current (Feb)
                createTx(-750, 'Alimentation', '2026-02-05'),
            ]
        };
        expect(budgetOverflowRule.condition(context)).toBe(true);

        // Check message
        const insight = budgetOverflowRule.execute(context) as any; // Cast to access promise result if needed, but here sync
        // Note: Rule interface allows Promise, but implementation is Sync here.
        // Wait... execute return type is ZenInsight | Promise<ZenInsight>

        // In our implementation it returns ZenInsight directly.
        expect(insight.type).toBe('warning');
        expect(insight.message).toContain('75%');
        expect(insight.message).toContain('Alimentation');
    });

    it('should ignore categories with small average budget (< 100€)', () => {
        // Average = 50
        // Current = 40 (80%) -> Should technically trigger % wise, but filter stops it
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-02-10T10:00:00Z'),
            transactions: [
                createTx(-50, 'Petits Plaisirs', '2026-01-15'),
                createTx(-40, 'Petits Plaisirs', '2026-02-05'),
            ]
        };
        expect(budgetOverflowRule.condition(context)).toBe(false);
    });
});
