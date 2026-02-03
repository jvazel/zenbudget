import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export const InstallPwaPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#0f172a] border border-white/10 p-4 rounded-xl shadow-2xl z-[200] flex items-center justify-between"
                >
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <Download className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Installer l'application</h3>
                            <p className="text-xs text-white/60">Pour une expérience plus fluide.</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 hover:bg-white/5 rounded-lg text-white/40"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleInstall}
                            className="px-3 py-1.5 bg-primary text-background text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Installer
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
