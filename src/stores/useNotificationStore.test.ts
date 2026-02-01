import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNotificationStore } from './useNotificationStore'

describe('useNotificationStore', () => {
    beforeEach(() => {
        const { notifications } = useNotificationStore.getState()
        notifications.forEach(n => useNotificationStore.getState().removeNotification(n.id))
        vi.useFakeTimers()
    })

    it('should add a notification', () => {
        useNotificationStore.getState().addNotification({
            message: 'Test message',
            type: 'success'
        })

        const { notifications } = useNotificationStore.getState()
        expect(notifications).toHaveLength(1)
        expect(notifications[0].message).toBe('Test message')
    })

    it('should remove a notification manually', () => {
        useNotificationStore.getState().addNotification({
            message: 'Test',
            type: 'info'
        })
        const id = useNotificationStore.getState().notifications[0].id

        useNotificationStore.getState().removeNotification(id)
        expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })

    it('should automatically remove notification after duration', () => {
        useNotificationStore.getState().addNotification({
            message: 'Auto remove',
            type: 'warning',
            duration: 1000
        })

        expect(useNotificationStore.getState().notifications).toHaveLength(1)

        vi.advanceTimersByTime(1100)

        expect(useNotificationStore.getState().notifications).toHaveLength(0)
    })

    it('should keep max 3 notifications', () => {
        const store = useNotificationStore.getState()
        store.addNotification({ message: '1', type: 'info' })
        store.addNotification({ message: '2', type: 'info' })
        store.addNotification({ message: '3', type: 'info' })
        store.addNotification({ message: '4', type: 'info' })

        expect(useNotificationStore.getState().notifications).toHaveLength(3)
        expect(useNotificationStore.getState().notifications[2].message).toBe('4')
    })
})
