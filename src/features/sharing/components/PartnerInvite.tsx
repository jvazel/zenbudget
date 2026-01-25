import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Users, Check, Copy, Clock, Loader2 } from 'lucide-react'
import { sharingService } from '../../../services/sharingService'

export const PartnerInvite: React.FC = () => {
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreateInvite = async () => {
        setLoading(true)
        setError(null)
        try {
            const newToken = await sharingService.createInviteToken()
            setToken(newToken)
        } catch (err: any) {
            setError(err.message || "Échec de la génération du jeton. Réessayez.")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (!token) return
        navigator.clipboard.writeText(token)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            {!token ? (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateInvite}
                    disabled={loading}
                    className="w-full glass rounded-3xl p-6 flex items-center justify-between group transition-all hover:bg-white/5 border border-white/10"
                >
                    <div className="flex items-center space-x-4 text-left">
                        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold">Inviter un Partenaire</p>
                            <p className="text-xs text-muted-foreground">Ouvrez une fenêtre de 24h</p>
                        </div>
                    </div>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5 text-white/20 group-hover:text-primary transition-colors" />}
                </motion.button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-3xl p-6 space-y-4 border border-primary/20 bg-primary/5"
                >
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary">
                        <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Expire dans 24h</span>
                        </div>
                        <button
                            onClick={() => setToken(null)}
                            className="hover:underline opacity-50 hover:opacity-100 transition-opacity"
                        >
                            Nouveau
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 bg-black/20 rounded-2xl p-4 border border-white/5">
                        <code className="flex-1 font-mono text-lg font-bold text-center">{token}</code>
                        <button
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-primary" />}
                        </button>
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center">Partagez ce code avec votre conjoint pour piloter ensemble.</p>
                </motion.div>
            )}

            {error && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-red-400 font-bold uppercase tracking-wider text-center px-4"
                >
                    ⚠️ {error}
                </motion.p>
            )}
        </div>
    )
}
