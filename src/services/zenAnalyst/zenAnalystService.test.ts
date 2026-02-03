import { describe, it, expect, vi, beforeEach } from 'vitest';
import { zenAnalystService } from './zenAnalystService';
import { AnalystRule, AnalysisContext, ZenInsight } from './types';

// Mock Context
const mockContext: AnalysisContext = {
    userId: 'test-user',
    transactions: [],
    currentDate: new Date(),
};

describe('ZenAnalystService', () => {
    beforeEach(() => {
        // Reset rules (hacky since it's a singleton, but functional for tests)
        (zenAnalystService as any).rules = [];
    });

    it('should register a rule correctly', () => {
        const rule: AnalystRule = {
            id: 'test-rule',
            name: 'Test Rule',
            description: 'A test rule',
            condition: () => false,
            execute: () => ({} as ZenInsight),
        };

        zenAnalystService.registerRule(rule);
        expect(zenAnalystService.getRules()).toContain(rule);
    });

    it('should execute a rule when condition is met', async () => {
        const expectedInsight: ZenInsight = {
            id: 'insight-1',
            type: 'info',
            title: 'Test Insight',
            message: 'This is a test',
            ruleId: 'test-rule-exec',
            createdAt: new Date(),
            isRead: false,
        };

        const rule: AnalystRule = {
            id: 'test-rule-exec',
            name: 'Test Exec Rule',
            description: 'Executes',
            condition: () => true, // Always true
            execute: () => expectedInsight,
        };

        zenAnalystService.registerRule(rule);
        const results = await zenAnalystService.analyze(mockContext);

        expect(results).toHaveLength(1);
        expect(results[0]).toBe(expectedInsight);
    });

    it('should not execute a rule when condition is false', async () => {
        const rule: AnalystRule = {
            id: 'test-rule-fail',
            name: 'Test Fail Rule',
            description: 'Should not execute',
            condition: () => false,
            execute: () => ({} as ZenInsight),
        };

        zenAnalystService.registerRule(rule);
        const results = await zenAnalystService.analyze(mockContext);

        expect(results).toHaveLength(0);
    });

    it('should handle errors gracefully during rule execution', async () => {
        const rule: AnalystRule = {
            id: 'error-rule',
            name: 'Error Rule',
            description: 'Throws error',
            condition: () => { throw new Error('Rule Failed'); },
            execute: () => ({} as ZenInsight),
        };

        // Silence console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        zenAnalystService.registerRule(rule);
        const results = await zenAnalystService.analyze(mockContext);

        expect(results).toHaveLength(0);
        expect(consoleSpy).toHaveBeenCalled();

        consoleSpy.mockRestore();
    });
});
