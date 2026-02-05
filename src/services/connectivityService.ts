import { useState, useEffect } from 'react';

/**
 * Hook to monitor the network connectivity status.
 */
export function useOnline() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

/**
 * Service to check connectivity outside of React components.
 */
export const connectivityService = {
    isOnline: () => navigator.onLine,
};
