import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DateState {
    selectedDate: Date
    setDate: (date: Date) => void
    nextMonth: () => void
    prevMonth: () => void
    resetToToday: () => void
}

export const useDateStore = create<DateState>()(
    persist(
        (set) => ({
            selectedDate: new Date(),
            setDate: (date) => set({ selectedDate: date }),
            nextMonth: () => set((state) => {
                const d = new Date(state.selectedDate)
                d.setMonth(d.getMonth() + 1)
                return { selectedDate: d }
            }),
            prevMonth: () => set((state) => {
                const d = new Date(state.selectedDate)
                d.setMonth(d.getMonth() - 1)
                return { selectedDate: d }
            }),
            resetToToday: () => set({ selectedDate: new Date() }),
        }),
        {
            name: 'zen-date-store',
            merge: (persistedState: any, currentState) => {
                // Handle Date hydration from string
                const restoredDate = persistedState.selectedDate
                    ? new Date(persistedState.selectedDate)
                    : new Date()

                return {
                    ...currentState,
                    ...persistedState,
                    selectedDate: !isNaN(restoredDate.getTime()) ? restoredDate : new Date()
                }
            }
        }
    )
)
