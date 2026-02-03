import { type Transaction } from '../../features/inbox/components/TransactionCard';

export type ZenInsightType = 'warning' | 'info' | 'success';

export interface ZenInsight {
    id: string;
    type: ZenInsightType;
    title: string;
    message: string;
    ruleId: string;
    metadata?: Record<string, any>; // For context like transaction IDs, amounts, etc.
    createdAt: Date;
    isRead: boolean;
    actionLabel?: string;
    actionLink?: string; // Could be a route or a deep link
}

export interface AnalysisContext {
    userId: string;
    transactions: Transaction[]; // History to analyze
    currentDate: Date;
    // We might add UserProfile or Balances here later
}

export interface AnalystRule {
    id: string;
    name: string;
    description: string;
    condition: (context: AnalysisContext) => boolean | Promise<boolean>;
    execute: (context: AnalysisContext) => ZenInsight | Promise<ZenInsight>;
}
