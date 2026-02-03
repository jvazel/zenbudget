import type { AnalysisContext, AnalystRule, ZenInsight } from '../types';
import type { Transaction } from '../../../features/inbox/components/TransactionCard';

export const subscriptionSpikeRule: AnalystRule = {
    id: 'subscription-spike',
    name: 'Anomalies Abonnements',
    description: 'Alerte si un abonnement récurrent augmente de plus de 10% par rapport au mois précédent.',

    condition: (context: AnalysisContext): boolean => {
        return hasSubscriptionSpike(context);
    },

    execute: (context: AnalysisContext): ZenInsight => {
        const spike = getFirstSpike(context);

        if (!spike) {
            return {
                id: `spike-empty-${Date.now()}`,
                type: 'info',
                title: 'Analyse terminée',
                message: 'Rien à signaler.',
                ruleId: 'subscription-spike',
                createdAt: new Date(),
                isRead: false
            };
        }

        const increasePercent = Math.round(((spike.currentAmount - spike.previousAmount) / spike.previousAmount) * 100);
        const increaseAmount = (spike.currentAmount - spike.previousAmount).toFixed(2);

        return {
            id: `spike-${Date.now()}`,
            type: 'warning',
            title: 'Hausse d\'abonnement détectée 📈',
            message: `Votre abonnement "${spike.name}" a augmenté de ${increaseAmount}€ (+${increasePercent}%).`,
            ruleId: 'subscription-spike',
            metadata: {
                subscription: spike.name,
                currentAmount: spike.currentAmount,
                previousAmount: spike.previousAmount,
                increasePercent
            },
            createdAt: new Date(),
            isRead: false,
            actionLabel: 'Vérifier',
            actionLink: '/dashboard' // Could link to specific transaction if UI supported it
        };
    }
};

interface Spike {
    name: string;
    currentAmount: number;
    previousAmount: number;
}

function getSpikes(context: AnalysisContext): Spike[] {
    const { currentDate, transactions } = context;
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // 1. Group by Description (Normalized)
    // Key: Normalized Description -> List of Transactions sorted by date DESC
    const chains: Record<string, Transaction[]> = {};

    transactions.forEach(t => {
        if (t.amount >= 0) return; // Ignore income

        // Normalize: lowercase, remove special chars, maybe handle "Netflix 01/24" vs "Netflix 02/24"
        // Simple normalization for now: lowercase and trim. 
        // Real-world might need fuzzy matching or "pattern" service.
        const key = t.description.toLowerCase().trim();

        if (!chains[key]) chains[key] = [];
        chains[key].push(t);
    });

    const spikes: Spike[] = [];

    // 2. Analyze chains
    for (const key in chains) {
        const chain = chains[key];
        // Sort by date descending (newest first)
        chain.sort((a, b) => {
            const dA = new Date((a as any).raw_date || a.date);
            const dB = new Date((b as any).raw_date || b.date);
            return dB.getTime() - dA.getTime();
        });

        // Need at least 2 occurrences to compare (Current + Previous)
        // And preferably 3 to establish recurrence, but requirements say "Recurrent". 
        // Let's ensure we have at least 3 occurrences in total history to call it a "Subscription"
        if (chain.length < 3) continue;

        // Find transaction for CURRENT month
        const currentTx = chain.find(t => {
            const d = new Date((t as any).raw_date || t.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (!currentTx) continue;

        // Find transaction for PREVIOUS month
        // We can't just take index+1 because there might be gaps or multiple tx in same month.
        // We look for strictly the previous month.
        const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
        const prevTx = chain.find(t => {
            const d = new Date((t as any).raw_date || t.date);
            return d.getMonth() === prevMonthDate.getMonth() && d.getFullYear() === prevMonthDate.getFullYear();
        });

        if (!prevTx) continue;

        const currentAmt = Math.abs(currentTx.amount);
        const prevAmt = Math.abs(prevTx.amount);

        // 3. Logic: Increase > 10%
        // Filter out small amounts noise (< 5€ differences maybe?) - keeping it simple for now as per plan
        if (prevAmt > 0 && currentAmt > prevAmt * 1.1) {
            spikes.push({
                name: currentTx.description, // Use original casing for display
                currentAmount: currentAmt,
                previousAmount: prevAmt
            });
        }
    }

    return spikes;
}

function hasSubscriptionSpike(context: AnalysisContext): boolean {
    const spikes = getSpikes(context);
    return spikes.length > 0;
}

function getFirstSpike(context: AnalysisContext): Spike | null {
    const spikes = getSpikes(context);
    return spikes.length > 0 ? spikes[0] : null;
}
