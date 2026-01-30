import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, User as UserIcon, LayoutDashboard, Inbox, Settings, BarChart3 } from 'lucide-react'
import { TransactionStack } from './features/inbox/components/TransactionStack'
import { useAuth } from './features/auth/AuthContext'
import { ZenLoginForm } from './features/auth/ZenLoginForm'
import { PartnerInvite } from './features/sharing/components/PartnerInvite'
import { ZenDashboard } from './features/dashboard/components/ZenDashboard'
import { CategoryManager } from './features/dashboard/components/CategoryManager'
import { ZenAnalysis } from './features/analysis/components/ZenAnalysis'
import { ZenToastContainer } from './features/dashboard/components/ZenToastContainer'
import './App.css'

function App() {
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'inbox' | 'dashboard' | 'settings' | 'analysis'>('inbox')

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary font-bold tracking-widest uppercase text-xs"
        >
          ZenBudget...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center pt-24 pb-32 px-6 overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header with User Info */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-8 left-8 right-8 flex justify-between items-center z-50 pointer-events-none"
      >
        <div className="flex items-center space-x-2 text-white/40 text-xs font-bold uppercase tracking-tighter">
        </div>

        {user && (
          <div className="flex items-center space-x-4 pointer-events-auto">
            <div className="flex items-center space-x-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 glass">
              <UserIcon className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-white/60 font-medium truncate max-w-[100px]">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center space-y-4 relative z-10 mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-2">
          zen<span className="text-primary">budget</span>
        </h1>
        <p className="max-w-md mx-auto text-muted-foreground text-sm uppercase tracking-[0.3em] font-bold opacity-80 text-center">
          {user ? (
            activeTab === 'inbox' ? 'Le Rituel Quotidien' :
              activeTab === 'dashboard' ? 'Pilotage Serein' :
                activeTab === 'analysis' ? 'Analyse de Sérénité' :
                  'Paramètres'
          ) : 'Sérénité Partagée'}
        </p>
      </motion.div>

      {/* Main Content Area */}
      <div className={`w-full relative z-20 flex flex-col items-center transition-all duration-500 ${(activeTab === 'dashboard' || activeTab === 'analysis') ? 'max-w-7xl' : 'max-w-lg'}`}>
        {!user ? (
          <ZenLoginForm />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'inbox' && (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full flex flex-col items-center space-y-12"
              >
                <TransactionStack onComplete={() => setActiveTab('dashboard')} />
                <PartnerInvite />
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full flex justify-center"
              >
                <ZenDashboard />
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full"
              >
                <ZenAnalysis />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <CategoryManager />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Nav */}
      {user && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 glass rounded-full p-2 border border-white/10 flex space-x-2 z-50 shadow-2xl shadow-black/50"
        >
          <button
            onClick={() => setActiveTab('inbox')}
            className={`p-4 rounded-full transition-all flex items-center space-x-3 ${activeTab === 'inbox' ? "bg-primary text-background font-bold px-6" : "text-white/40 hover:text-white"}`}
          >
            <Inbox className="w-6 h-6" />
            {activeTab === 'inbox' && <span className="text-xs uppercase tracking-widest">Inbox</span>}
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`p-4 rounded-full transition-all flex items-center space-x-3 ${activeTab === 'dashboard' ? "bg-primary text-background font-bold px-6" : "text-white/40 hover:text-white"}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            {activeTab === 'dashboard' && <span className="text-xs uppercase tracking-widest">Dash</span>}
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`p-4 rounded-full transition-all flex items-center space-x-3 ${activeTab === 'analysis' ? "bg-primary text-background font-bold px-6" : "text-white/40 hover:text-white"}`}
          >
            <BarChart3 className="w-6 h-6" />
            {activeTab === 'analysis' && <span className="text-xs uppercase tracking-widest">Analyse</span>}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`p-4 rounded-full transition-all flex items-center space-x-3 ${activeTab === 'settings' ? "bg-primary text-background font-bold px-6" : "text-white/40 hover:text-white"}`}
          >
            <Settings className="w-6 h-6" />
            {activeTab === 'settings' && <span className="text-xs uppercase tracking-widest">Setup</span>}
          </button>
        </motion.div>
      )}

      <ZenToastContainer />
    </div>
  )
}

export default App
