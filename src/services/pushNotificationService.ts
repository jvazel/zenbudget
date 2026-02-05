import { supabase } from '../lib/supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BGFosdxKK97js__DIcPfwS_sRdDtWoymvWyLUys'; // Fallback if env missing

export const pushNotificationService = {
    /**
     * Convert Base64 VAPID key to Uint8Array for the browser
     */
    urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    /**
     * Check if push notifications are supported and allowed
     */
    async checkPermission() {
        if (!('Notification' in window)) return 'unsupported';
        return Notification.permission;
    },

    /**
     * Request permission and subscribe to push notifications
     */
    async subscribeUser() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Workers non supportés');
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            throw new Error('Permission de notification refusée');
        }

        const registration = await navigator.serviceWorker.ready;

        // Check if subscription already exists
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const subscribeOptions = {
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            };
            subscription = await registration.pushManager.subscribe(subscribeOptions);
        }

        // Save to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Utilisateur non connecté');

        const subObj = subscription.toJSON();
        const p256dh = subObj.keys?.p256dh;
        const auth = subObj.keys?.auth;

        if (!p256dh || !auth) throw new Error('Données de souscription invalides');

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                subscription: subObj,
                p256dh,
                auth
            }, { onConflict: 'user_id, p256dh' });

        if (error) throw error;

        return subscription;
    },

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribeUser() {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            const subObj = subscription.toJSON();
            const p256dh = subObj.keys?.p256dh;

            await subscription.unsubscribe();

            // Remove from Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user && p256dh) {
                await supabase
                    .from('push_subscriptions')
                    .delete()
                    .match({ user_id: user.id, p256dh });
            }
        }
    }
};
