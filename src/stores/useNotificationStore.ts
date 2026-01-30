import { create } from 'zustand'

export type NotificationType = 'success' | 'info' | 'warning' | 'zen'

export interface ZenNotification {
    id: string
    message: string
    type: NotificationType
    icon?: string
    duration?: number
}

interface NotificationStore {
    notifications: ZenNotification[]
    addNotification: (notification: Omit<ZenNotification, 'id'>) => void
    removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newNotification = { ...notification, id }

        set((state) => ({
            notifications: [...state.notifications.slice(-2), newNotification] // Keep max 3
        }))

        if (notification.duration !== 0) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id)
                }))
            }, notification.duration || 4000)
        }
    },
    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        }))
}))
