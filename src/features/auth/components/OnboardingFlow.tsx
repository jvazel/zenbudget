import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, User, Wallet, ArrowRight, CheckCircle2, ChevronRight, Zap, Coffee, Moon, Sun } from 'lucide-react'
import { useProfile } from '../../../hooks/useProfile'

interface OnboardingFlowProps {
    onComplete: () => void
}

const AVATARS = [
    { id: 'zap', icon: Zap, color: '#06b6d4', label: 'Énergie' },
    { id: 'coffee', icon: Coffee, color: '#f59e0b', label: 'Pause' },
    { id: 'moon', icon: Moon, color: '#8b5cf6', label: 'Nuit' },
    { id: 'sun', icon: Sun, color: '#fbbf24', label: 'Jour' },
]

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
    const [step, setStep] = useState(0)
    const { updateProfile } = useProfile()

    const [name, setName] = useState('')
    const [income, setIncome] = useState('')
    const [avatar, setAvatar] = useState('zap')

    const nextStep = () => setStep(s => s + 1)

    const handleFinish = async () => {
        await updateProfile({
            full_name: name,
            avatar_url: avatar,
            base_monthly_income: Number(income) || 0
        })
        onComplete()
    }

    const containerVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 }
    }

    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0a0a0b]/80 backdrop-blur-xl p-4">
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full max-w-lg glass rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden"
            >
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step-0"
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-8 text-center"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight font-outfit">Bienvenue dans votre ZenBudget</h1>
                                <p className="text-white/60 text-lg leading-relaxed">
                                    Commençons votre voyage vers la sérénité financière. Juste quelques réglages pour calibrer votre cockpit.
                                </p>
                            </div>
                            <button
                                onClick={nextStep}
                                className="w-full bg-primary text-background rounded-2xl py-5 font-bold uppercase tracking-widest flex items-center justify-center space-x-2 group hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                <span>Commencer</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <div className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Étape 1 sur 2</div>
                                <h2 className="text-3xl font-bold font-outfit">Qui pilote ?</h2>
                                <p className="text-white/40 text-sm">Donnez un nom à votre avatar Zen.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Votre nom complet"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-primary/50 transition-all text-lg font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {AVATARS.map((av) => (
                                        <button
                                            key={av.id}
                                            onClick={() => setAvatar(av.id)}
                                            className={`flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all border ${avatar === av.id ? 'bg-primary/10 border-primary shadow-lg' : 'bg-white/5 border-transparent hover:border-white/10'
                                                }`}
                                        >
                                            <av.icon className="w-6 h-6" style={{ color: av.color }} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter text-white/40">{av.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                disabled={!name}
                                onClick={nextStep}
                                className="w-full bg-primary text-background rounded-2xl py-5 font-bold uppercase tracking-widest flex items-center justify-center space-x-2 disabled:opacity-50 disabled:grayscale transition-all"
                            >
                                <span>Continuer</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            variants={stepVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <div className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Dernière Étape</div>
                                <h2 className="text-3xl font-bold font-outfit">Votre Élixir de Base</h2>
                                <p className="text-white/40 text-sm">Quel est votre revenu mensuel habituel ? Cela servira à calibrer votre ZenGauge.</p>
                            </div>

                            <div className="relative">
                                <Wallet className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20" />
                                <input
                                    type="number"
                                    autoFocus
                                    placeholder="2500"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-8 pl-16 pr-20 focus:outline-none focus:border-primary/50 transition-all text-4xl font-mono font-bold"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/20">€</span>
                            </div>

                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start space-x-4">
                                <div className="p-2 bg-primary/20 rounded-xl mt-0.5">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed">
                                    Vous pourrez modifier ce montant à tout moment ou laisser la détection automatique s'en charger lors de vos imports.
                                </p>
                            </div>

                            <button
                                onClick={handleFinish}
                                className="w-full bg-primary text-background rounded-2xl py-5 font-bold uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-primary/30"
                            >
                                <span>Entrer dans le Cockpit</span>
                                <Sparkles className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex justify-center space-x-2 mt-12">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-primary' : 'w-2 bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
