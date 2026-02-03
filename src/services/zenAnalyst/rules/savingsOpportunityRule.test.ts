import { describe, it, expect } from 'vitest';
import { savingsOpportunityRule } from './savingsOpportunityRule';
import { AnalysisContext } from '../types';

const createTx = (amount: number, dateStr: string) => ({
    id: `tx-${Math.random()}`,
    description: 'Mock',
    amount,
    date: dateStr,
    raw_date: new Date(dateStr).toISOString(),
    predicted_category: 'Divers',
    status: 'validated' as const,
    category_color: '#000',
    category_icon: '',
    category_id: ''
});

describe('Savings Opportunity Rule', () => {
    it('should NOT trigger before the 25th', () => {
        const context: AnalysisContext = {
            userId: 'u1',
            currentDate: new Date('2026-05-20'), // 20th
            transactions: [
                createTx(2000, '2026-05-01'), // Income
                createTx(-1000, '2026-05-05'), // Exp
            ] // Net +1000
        };
        expect(savingsOpportunityRule.condition(context)).toBe(false);
    });

    it('should NOT trigger if surplus is low (< 200)', () => {
        const context: AnalysisContext = {
            userId: 'u1',
            currentDate: new Date('2026-05-26'), // 26th
            transactions: [
                createTx(2000, '2026-05-01'),
                createTx(-1900, '2026-05-05'),
            ] // Net +100
        };
        expect(savingsOpportunityRule.condition(context)).toBe(false);
    });

    it('should NOT trigger if deficit', () => {
        const context: AnalysisContext = {
            userId: 'u1',
            currentDate: new Date('2026-05-26'), // 26th
            transactions: [
                createTx(2000, '2026-05-01'),
                createTx(-2500, '2026-05-05'),
            ] // Net -500
        };
        expect(savingsOpportunityRule.condition(context)).toBe(false);
    });

    it('should TRIGGER if surplus is high after 25th', () => {
        const context: AnalysisContext = {
            userId: 'u1',
            currentDate: new Date('2026-05-26'), // 26th
            transactions: [
                createTx(3000, '2026-05-01'),
                createTx(-1500, '2026-05-05'),
            ] // Net +1500
        };
        expect(savingsOpportunityRule.condition(context)).toBe(true);

        const insight = savingsOpportunityRule.execute(context);
        expect(insight.type).toBe('success');
        expect(insight.message).toContain('1500.00€');
    });
});
