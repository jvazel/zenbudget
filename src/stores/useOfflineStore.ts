import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SyncAction {
    id: string;
    transactionId: string;
    action: 'validate' | 'ignore';
    timestamp: number;
}

interface OfflineState {
    syncQueue: SyncAction[];
    addSyncAction: (transactionId: string, action: 'validate' | 'ignore') => void;
    removeFromQueue: (id: string) => void;
    clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
    persist(
        (set) => ({
            syncQueue: [],
            addSyncAction: (transactionId, action) => set((state) => ({
                syncQueue: [
                    ...state.syncQueue,
                    {
                        id: crypto.randomUUID(),
                        transactionId,
                        action,
                        timestamp: Date.now(),
                    },
                ],
            })),
            removeFromQueue: (id) => set((state) => ({
                syncQueue: state.syncQueue.filter((a) => a.id !== id),
            })),
            clearQueue: () => set({ syncQueue: [] }),
        }),
        {
            name: 'zenbudget-offline-storage',
            storage: createJSONStorage(() => localStorage), // Simplification for now, works offline
        }
    )
);
