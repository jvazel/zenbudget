# Project Context: ZenBudget

Ce document est la mémoire centrale de **zenbudget**. Il permet à tout agent IA de reprendre le projet exactement là où il s'est arrêté.

## 🎯 Vision & Essence
ZenBudget n'est pas un outil de comptabilité, c'est une application de **sérénité financière**.
*   **Métaphore** : Un cockpit d'avion calme au-dessus d'un océan la nuit.
*   **Design System** : "Ocean Calm" (Fond #0a0a0b, Accents Cyan/Primary, Glassmorphism, animations fluides).
*   **Core Loop** : Swipe des transactions (Inbox Zero) -> Visualisation RAV (ZenGauge).

## 🛠️ Stack Technique
*   **Frontend** : React 19 + Vite 7 + Tailwind CSS v4.
*   **UI/Animation** : Framer Motion + Lucide Icons.
*   **Backend/BaaS** : Supabase (Auth, DB, Real-time).
*   **Partage** : Pilotage Duo 24h via jetons d'accès temporaires et RLS Policies.

## 📍 État Actuel (22 Janvier 2026)
*   **Phase 1 (Fondations)** : Setup OK, Thème Ocean Calm implémenté.
*   **Phase 2 (Inbox Zero)** : Moteur de Swipe fonctionnel, Real-time sync avec Supabase opérationnel.
*   **Phase 3 (Duo Pilot)** : Système d'invitation 24h et authentification démo OK.
*   **Phase 4 (Dashboard)** : ZenGauge (RAV), ZenDashboard et Navigation implémentés. Build vert 🟢.

## 📜 Règles Critiques pour l'IA
1.  **Aesthetics First** : Chaque nouveau composant doit respecter le style "glassmorphic" et les animations de `framer-motion`.
2.  **No Placeholders** : Toujours utiliser des données de mock réalistes ou générer des images.
3.  **Real-time Mindset** : Toujours prévoir l'impact d'une action sur la session du partenaire.
4.  **Security** : Les politiques RLS de Supabase sont la source de vérité pour les permissions.

## 🚀 Prochaines Étapes
*   Connecter les flux bancaires réels (Gocardless/Bridge).
*   Implémenter les notifications de sérénité (Push).
*   Finaliser la gestion des catégories intelligentes.
