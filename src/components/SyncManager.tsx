import React, { useEffect, useRef } from 'react';
import { useOnline } from '../services/connectivityService';
import { useOfflineStore } from '../stores/useOfflineStore';
import { transactionService } from '../services/transactionService';
import { useNotificationStore } from '../stores/useNotificationStore';

export const SyncManager: React.FC = () => {
    const isOnline = useOnline();
    const { syncQueue, removeFromQueue } = useOfflineStore();
    const { addNotification } = useNotificationStore();
    const isProcessing = useRef(false);

    useEffect(() => {
        const processQueue = async () => {
            if (!isOnline || syncQueue.length === 0 || isProcessing.current) return;

            isProcessing.current = true;
            console.log(`Processing sync queue with ${syncQueue.length} items...`);

            // Process one by one to avoid overwhelming or handle conflicts
            for (const action of syncQueue) {
                try {
                    const status = action.action === 'validate' ? 'validated' : 'ignored';
                    await transactionService.updateTransactionStatus(action.transactionId, status);
                    removeFromQueue(action.id);
                } catch (error) {
                    console.error(`Failed to sync action ${action.id}:`, error);
                    // If it's a 404 (transaction gone), remove it anyway
                    if ((error as any)?.status === 404) {
                        removeFromQueue(action.id);
                    }
                    // Stop processing the rest if it's a network error during sync
                    break;
                }
            }

            if (syncQueue.length > 0) {
                addNotification({
                    message: "Synchronisation terminée. Vos actions hors-ligne ont été envoyées. 🧘",
                    type: 'success'
                });
            }

            isProcessing.current = false;
        };

        processQueue();
    }, [isOnline, syncQueue.length, removeFromQueue, addNotification]);

    return null; // Logic-only component
};
