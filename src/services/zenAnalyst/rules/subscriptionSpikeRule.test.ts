import { describe, it, expect } from 'vitest';
import { subscriptionSpikeRule } from './subscriptionSpikeRule';
import { AnalysisContext } from '../types';

// Helper to create mock transaction
const createTx = (description: string, amount: number, dateStr: string) => ({
    id: `tx-${Math.random()}`,
    description,
    amount, // Negative for expense
    date: dateStr,
    raw_date: new Date(dateStr).toISOString(),
    predicted_category: 'Abonnements',
    status: 'validated' as const,
    category_color: '#000',
    category_icon: '',
    category_id: ''
});

describe('Subscription Spike Rule', () => {
    it('should NOT trigger if NOT recurring (less than 3 in history)', () => {
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-03-10'),
            transactions: [
                createTx('Netflix', -20, '2026-03-01'), // Current (High)
                createTx('Netflix', -10, '2026-02-01'), // Previous
                // Missing 3rd occurrence
            ]
        };
        // It triggers only if chain length >= 3
        expect(subscriptionSpikeRule.condition(context)).toBe(false);
    });

    it('should NOT trigger if price is stable', () => {
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-03-10'),
            transactions: [
                createTx('Netflix', -15, '2026-03-01'),
                createTx('Netflix', -15, '2026-02-01'),
                createTx('Netflix', -15, '2026-01-01'),
            ]
        };
        expect(subscriptionSpikeRule.condition(context)).toBe(false);
    });

    it('should NOT trigger if price increase is small (< 10%)', () => {
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-03-10'),
            transactions: [
                createTx('Netflix', -10.5, '2026-03-01'), // +5%
                createTx('Netflix', -10.0, '2026-02-01'),
                createTx('Netflix', -10.0, '2026-01-01'),
            ]
        };
        expect(subscriptionSpikeRule.condition(context)).toBe(false);
    });

    it('should TRIGGER if price increases significantly (> 10%)', async () => {
        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-03-10'),
            transactions: [
                createTx('Netflix', -15.0, '2026-03-01'), // +50% vs Feb
                createTx('Netflix', -10.0, '2026-02-01'),
                createTx('Netflix', -10.0, '2026-01-01'),
            ]
        };
        expect(subscriptionSpikeRule.condition(context)).toBe(true);

        const insight = await subscriptionSpikeRule.execute(context) as any;
        expect(insight.type).toBe('warning');
        expect(insight.message).toContain('Netflix');
        expect(insight.message).toContain('5.00€');
    });

    it('should rely on PREVIOUS month specifically, not just any previous tx', () => {
        // Case: Paid in Jan (-10), Skipped Feb, Paid in Mar (-15)
        // Should NOT trigger because we compare Mar vs Feb specifically 
        // (If we compared against Jan it would trigger, but business logic says "Month over Month")
        // NOTE: The implementation finds prevMonthDate strictly.

        const context: AnalysisContext = {
            userId: 'user-1',
            currentDate: new Date('2026-03-10'),
            transactions: [
                createTx('Netflix', -15.0, '2026-03-01'),
                createTx('Netflix', -10.0, '2026-01-01'), // Jan
                createTx('Netflix', -10.0, '2025-12-01'), // Dec
            ]
        };
        // Expect false because "February" tx is missing
        expect(subscriptionSpikeRule.condition(context)).toBe(false);
    });
});
