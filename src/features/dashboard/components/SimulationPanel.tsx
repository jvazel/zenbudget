import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, Zap, TrendingUp, AlertCircle } from 'lucide-react'
import { useSimulationStore, type SimulationEvent } from '../../../services/simulationService'

export const SimulationPanel: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const {
        scenarios,
        activeScenarioId,
        isSimulationMode,
        addEventToScenario,
        removeEventFromScenario,
        toggleSimulationMode
    } = useSimulationStore()

    const [newEvent, setNewEvent] = useState<Omit<SimulationEvent, 'id'>>({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'one-off',
        frequency: 'monthly'
    })

    const activeScenario = scenarios.find(s => s.id === activeScenarioId)

    const handleAddEvent = () => {
        if (!activeScenarioId || !newEvent.description) return
        addEventToScenario(activeScenarioId, newEvent)
        setNewEvent({ ...newEvent, description: '', amount: 0 })
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[110]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white/[0.02] backdrop-blur-3xl border-l border-white/10 z-[120] p-8 shadow-2xl flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    <span>Laboratoire ZenVision</span>
                                </h2>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">Simulations "Et si..."</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 scrollbar-none space-y-8">
                            {/* Simulation Mode Toggle */}
                            <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Mode Simulation</h3>
                                        <p className="text-[10px] text-primary/60 font-medium uppercase tracking-tighter">Écrase la réalité sur le graphique</p>
                                    </div>
                                    <button
                                        onClick={() => toggleSimulationMode(!isSimulationMode)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isSimulationMode ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <motion.div
                                            animate={{ x: isSimulationMode ? 24 : 0 }}
                                            className="w-4 h-4 bg-white rounded-full shadow-lg"
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Add Event Form */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Ajouter un événement</h3>
                                <div className="space-y-3 p-4 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-white/40 uppercase ml-1">Description</label>
                                        <input
                                            type="text"
                                            value={newEvent.description}
                                            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                            placeholder="Ex: Achat Appartement, Bonus..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-white/40 uppercase ml-1">Montant (€)</label>
                                            <input
                                                type="number"
                                                value={newEvent.amount}
                                                onChange={e => setNewEvent({ ...newEvent, amount: parseFloat(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-white/40 uppercase ml-1">Date</label>
                                            <input
                                                type="date"
                                                value={newEvent.date}
                                                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setNewEvent({ ...newEvent, type: 'one-off' })}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${newEvent.type === 'one-off' ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                                        >
                                            Une fois
                                        </button>
                                        <button
                                            onClick={() => setNewEvent({ ...newEvent, type: 'recurring' })}
                                            className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${newEvent.type === 'recurring' ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                                        >
                                            Récurrent
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddEvent}
                                        disabled={!newEvent.description}
                                        className="w-full bg-primary/20 hover:bg-primary/30 disabled:opacity-30 disabled:hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl transition-all flex items-center justify-center space-x-2 mt-2"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Injecter dans le futur</span>
                                    </button>
                                </div>
                            </div>

                            {/* Active Events List */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-1">Événements Actifs</h3>
                                <div className="space-y-3">
                                    {activeScenario?.events.length === 0 ? (
                                        <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Aucun événement simulé</p>
                                        </div>
                                    ) : (
                                        activeScenario?.events.map((event) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={event.id}
                                                className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-lg ${event.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                                        {event.amount > 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{event.description}</p>
                                                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                                                            {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                                            {event.type === 'recurring' && ' • Mensuel'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <p className={`text-xs font-mono font-bold ${event.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {event.amount > 0 ? '+' : ''}{event.amount}€
                                                    </p>
                                                    <button
                                                        onClick={() => removeEventFromScenario(activeScenarioId!, event.id)}
                                                        className="p-1.5 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-red-500/40 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center space-x-3 text-white/20">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-[10px] font-bold leading-tight">Ces simulations sont isolées et n'impactent pas vos transactions réelles stockées en base de données.</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
