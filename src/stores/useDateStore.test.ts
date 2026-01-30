/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDateStore } from './useDateStore'
import { act } from '@testing-library/react'

describe('useDateStore', () => {
    beforeEach(() => {
        localStorage.clear()
        useDateStore.setState({ selectedDate: new Date('2026-01-01') }) // Merge update
        vi.useFakeTimers().setSystemTime(new Date('2026-01-01'))
    })

    const getStore = () => useDateStore.getState()

    it('initializes with current date (mocked)', () => {
        // Because we set state in beforeEach, verify that first.
        // But "initial" state comes from create() and persist.
        // Let's reset purely.
        useDateStore.persist.clearStorage()
        // Re-init by calling a usage? No, zustand store is singleton. 
        // Force reset
        act(() => {
            useDateStore.persist.rehydrate()
            useDateStore.getState().resetToToday()
        })
        expect(getStore().selectedDate.toISOString()).toContain('2026-01-01')
    })

    it('nextMonth increments month', () => {
        act(() => getStore().nextMonth())
        const d = getStore().selectedDate
        expect(d.getMonth()).toBe(1) // Feb
        expect(d.getFullYear()).toBe(2026)
    })

    it('prevMonth decrements month', () => {
        act(() => getStore().prevMonth()) // Back to Dec 2025
        const d = getStore().selectedDate
        expect(d.getMonth()).toBe(11)
        expect(d.getFullYear()).toBe(2025)
    })

    it('setDate sets arbitrary date', () => {
        const target = new Date('2025-05-15')
        act(() => getStore().setDate(target))
        expect(getStore().selectedDate.getTime()).toBe(target.getTime())
    })

    it('persist state to localStorage', () => {
        const target = new Date('2030-01-01')
        act(() => getStore().setDate(target))

        // Check localStorage
        const stored = localStorage.getItem('zen-date-store')
        expect(stored).toBeTruthy()
        const parsed = JSON.parse(stored!)
        expect(parsed.state.selectedDate).toBe(target.toISOString())
    })

    it('hydration restores Date object from string', () => {
        // Manually set localStorage
        const savedDate = new Date('2040-10-10')
        localStorage.setItem('zen-date-store', JSON.stringify({
            state: { selectedDate: savedDate.toISOString() },
            version: 0
        }))

        // Trigger rehydrate (mocking reload)
        useDateStore.persist.rehydrate()

        expect(getStore().selectedDate).toBeInstanceOf(Date)
        expect(getStore().selectedDate.getFullYear()).toBe(2040)
    })
})
