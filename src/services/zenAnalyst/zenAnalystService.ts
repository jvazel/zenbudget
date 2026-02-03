import type { AnalystRule, AnalysisContext, ZenInsight } from './types';
import { budgetOverflowRule } from './rules/budgetOverflowRule';
import { subscriptionSpikeRule } from './rules/subscriptionSpikeRule';
import { savingsOpportunityRule } from './rules/savingsOpportunityRule';

class ZenAnalystService {
    private rules: AnalystRule[] = [];

    constructor() {
        this.registerRule(budgetOverflowRule);
        this.registerRule(subscriptionSpikeRule);
        this.registerRule(savingsOpportunityRule);
    }

    /**
     * Register a new rule to the engine.
     * Internal/Static rules are registered here.
     */
    registerRule(rule: AnalystRule) {
        // Prevent duplicates
        if (!this.rules.find(r => r.id === rule.id)) {
            this.rules.push(rule);
        }
    }

    /**
     * Get all registered rules.
     */
    getRules(): AnalystRule[] {
        return this.rules;
    }

    /**
     * Run the analysis engine against the provided context.
     * Returns a list of generated insights.
     */
    async analyze(context: AnalysisContext): Promise<ZenInsight[]> {
        const insights: ZenInsight[] = [];

        for (const rule of this.rules) {
            try {
                const rulesMatch = await rule.condition(context);
                if (rulesMatch) {
                    const insight = await rule.execute(context);
                    insights.push(insight);
                }
            } catch (error) {
                console.error(`Error executing rule ${rule.name}:`, error);
                // Fail silently for individual rules so we don't crash the whole analysis
            }
        }

        return insights;
    }
}

export const zenAnalystService = new ZenAnalystService();
