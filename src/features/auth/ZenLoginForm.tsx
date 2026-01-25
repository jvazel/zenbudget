import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, Mail, Lock, Loader2, Users, ArrowLeft, Sparkles, UserPlus, AlertCircle } from 'lucide-react'
import { sharingService } from '../../services/sharingService'
import { useAuth } from './AuthContext'
import { isConfigured } from '../../lib/supabase'

type AuthMode = 'login' | 'signup' | 'join'

export const ZenLoginForm: React.FC = () => {
    const { signInDemo } = useAuth()
    const [mode, setMode] = useState<AuthMode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [shareToken, setShareToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
            setError(error.message)
        } else {
            setMessage('Compte créé ! Consultez vos emails pour confirmer.')
            setMode('login')
        }
        setLoading(false)
    }

    const handleJoinSession = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await sharingService.joinSession(shareToken)
            setMessage('Session rejointe ! Connectez-vous maintenant.')
            setMode('login')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm glass rounded-[40px] p-10 space-y-8 shadow-2xl border border-white/10"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">
                    {mode === 'join' ? 'Rejoindre le Duo' : mode === 'signup' ? 'Créer un Compte' : 'Bienvenue'}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {mode === 'join' ? 'Entrez le code partagé par votre conjoint.' :
                        mode === 'signup' ? 'Commencez votre voyage vers la sérénité.' :
                            'Entrez dans votre zone de calme financier.'}
                </p>
            </div>

            {!isConfigured && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-amber-500 text-xs">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                        <p className="font-bold uppercase tracking-wider">Connexion Réelle Désactivée</p>
                        <p className="opacity-80 leading-relaxed">
                            Les identifiants Supabase ne sont pas configurés. Utilisez le <strong>Mode Démo</strong> pour explorer ou configurez votre fichier <code>.env</code>.
                        </p>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {mode === 'join' ? (
                    <motion.form
                        key="join"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onSubmit={handleJoinSession}
                        className="space-y-4"
                    >
                        <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder="Code de Partage (ex: abc123)"
                                value={shareToken}
                                onChange={(e) => setShareToken(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs text-center font-medium animate-shake">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-background rounded-2xl py-4 font-bold shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Rejoindre la Session</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="w-full flex items-center justify-center space-x-2 text-xs text-white/40 hover:text-white transition-colors pt-2"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            <span>Retour à la connexion</span>
                        </button>
                    </motion.form>
                ) : (
                    <motion.form
                        key={mode}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onSubmit={mode === 'login' ? handleLogin : handleSignUp}
                        className="space-y-4"
                    >
                        <div className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    required
                                />
                            </div>
                            {mode === 'signup' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="relative"
                                >
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="password"
                                        placeholder="Confirmer le mot de passe"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 transition-all text-sm"
                                        required
                                    />
                                </motion.div>
                            )}
                        </div>

                        {error && <p className="text-red-500 text-xs text-center font-medium animate-shake">{error}</p>}
                        {message && <p className="text-green-500 text-xs text-center font-medium">{message}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-background rounded-2xl py-5 font-bold uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                    <span>{mode === 'login' ? 'Se connecter' : 'Créer un compte'}</span>
                                </>
                            )}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {mode !== 'join' && (
                <>
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-white/20"><span className="bg-background px-4">Ou</span></div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            disabled={loading}
                            className="w-full bg-white/5 border border-white/5 text-white/60 rounded-2xl py-4 font-semibold hover:bg-white/10 transition-colors text-sm"
                        >
                            {mode === 'login' ? 'Pas encore de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
                        </button>

                        {mode === 'login' && (
                            <>
                                <button
                                    onClick={signInDemo}
                                    className="w-full bg-primary/10 border border-primary/20 text-primary rounded-2xl py-4 font-bold flex items-center justify-center space-x-2 hover:bg-primary/20 transition-all shadow-lg shadow-primary/5 text-sm uppercase tracking-widest"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>Mode Démo</span>
                                </button>

                                <button
                                    onClick={() => setMode('join')}
                                    className="w-full text-[10px] text-white/40 hover:text-white font-bold uppercase tracking-[0.2em] pt-2 transition-colors"
                                >
                                    Rejoindre une session
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    )
}
