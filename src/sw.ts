/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

export { };

// Listen for push events
self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const { title, message, icon, url } = data;

        const options = {
            body: message || 'Nouvelle mise à jour ZenBudget',
            icon: icon || '/pwa-192x192.png',
            badge: '/favicon.ico',
            data: { url: url || '/' },
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'Voir' },
                { action: 'close', title: 'Fermer' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(title || 'ZenBudget', options)
        );
    } catch (error) {
        console.error('Error handling push event:', error);
        // Fallback for simple text push
        event.waitUntil(
            self.registration.showNotification('ZenBudget', {
                body: event.data.text()
            })
        );
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // If a window client is already open, focus it
            for (const client of windowClients) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
