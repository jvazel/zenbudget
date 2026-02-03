import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { calculationService } from './calculationService'
import { projectionService, type BalancePoint } from './projectionService'
import { transactionService } from './transactionService'

export interface SimulationEvent {
    id: string
    description: string
    amount: number
    date: string
    type: 'one-off' | 'recurring'
    frequency?: 'monthly' | 'weekly'
}

export interface SimulationScenario {
    id: string
    name: string
    events: SimulationEvent[]
}

interface SimulationState {
    scenarios: SimulationScenario[]
    activeScenarioId: string | null
    isSimulationMode: boolean
    addScenario: (name: string) => void
    removeScenario: (id: string) => void
    addEventToScenario: (scenarioId: string, event: Omit<SimulationEvent, 'id'>) => void
    removeEventFromScenario: (scenarioId: string, eventId: string) => void
    setActiveScenario: (id: string | null) => void
    toggleSimulationMode: (enabled: boolean) => void
}

export const useSimulationStore = create<SimulationState>()(
    persist(
        (set) => ({
            scenarios: [
                { id: 'default', name: 'Nouveau Scénario', events: [] }
            ],
            activeScenarioId: 'default',
            isSimulationMode: false,
            addScenario: (name) => set((state) => ({
                scenarios: [...state.scenarios, { id: crypto.randomUUID(), name, events: [] }]
            })),
            removeScenario: (id) => set((state) => ({
                scenarios: state.scenarios.filter(s => s.id !== id),
                activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId
            })),
            addEventToScenario: (scenarioId, event) => set((state) => ({
                scenarios: state.scenarios.map(s =>
                    s.id === scenarioId
                        ? { ...s, events: [...s.events, { ...event, id: crypto.randomUUID() }] }
                        : s
                )
            })),
            removeEventFromScenario: (scenarioId, eventId) => set((state) => ({
                scenarios: state.scenarios.map(s =>
                    s.id === scenarioId
                        ? { ...s, events: s.events.filter(e => e.id !== eventId) }
                        : s
                )
            })),
            setActiveScenario: (id) => set({ activeScenarioId: id }),
            toggleSimulationMode: (enabled) => set({ isSimulationMode: enabled }),
        }),
        { name: 'zen-simulation-storage' }
    )
)

export const simulationService = {
    /**
     * Projects a scenario over a given timeframe.
     */
    async getSimulatedBalanceHistory(days: number = 365): Promise<BalancePoint[]> {
        const state = useSimulationStore.getState()
        const scenario = state.scenarios.find(s => s.id === state.activeScenarioId)

        const currentBalance = await transactionService.getTotalBalance()
        const normalProjections = await projectionService.getUpcomingProjections()

        // Convert recurring simulation events into a flat list of one-off events for the calculation engine
        const simulationEvents: { amount: number, date: string }[] = []

        if (scenario) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const endDate = new Date(today)
            endDate.setDate(today.getDate() + days)

            const formatLocal = (d: Date) => {
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return `${year}-${month}-${day}`
            }

            scenario.events.forEach(event => {
                const startDate = new Date(event.date)
                startDate.setHours(0, 0, 0, 0)

                if (event.type === 'one-off') {
                    if (startDate >= today && startDate <= endDate) {
                        simulationEvents.push({ amount: event.amount, date: event.date })
                    }
                } else if (event.type === 'recurring') {
                    let currentDate = new Date(startDate)

                    // Cap loops to avoid infinite recursion
                    let loops = 0
                    while (currentDate <= endDate && loops < 1000) {
                        loops++
                        if (currentDate >= today) {
                            simulationEvents.push({
                                amount: event.amount,
                                date: formatLocal(currentDate)
                            })
                        }

                        if (event.frequency === 'weekly') {
                            currentDate.setDate(currentDate.getDate() + 7)
                        } else {
                            currentDate.setMonth(currentDate.getMonth() + 1)
                        }
                    }
                }
            })
        }

        return calculationService.projectBalanceHistory(currentBalance, normalProjections, days, simulationEvents)
    }
}
