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

## 📍 État Actuel (31 Janvier 2026)
*   **Phase 1-4 (Fondations & Dashboard)** : Setup, Thème Ocean Calm, Inbox Zero, Duo Pilot et ZenGauge OK.
*   **Phase 5 (Sérénité Financière)** : Story 5.3 (Transitions), 5.5 (Recherche/Filtres) OK.
*   **Phase 6 (Analyses & Manuel)** : Saisie manuelle, ZenAlert, ZenContracts, ZenTrends et ZenSavings implémentés.
*   **Phase 9-10 (Données & Vision)** : Import/Export (CSV/JSON), Pilotage Auto, Calendrier, Projections et Alertes Découvert OK.
*   **Phase 11 (Notifications)** : Story 11.1 (Système de Notifications de Sérénité) OK. Build vert (59/59 tests) 🟢.
*   **Phase 17 (ZenMobile)** : Story 17.2 (Offline Mode) et 17.4 (Push Notifications) OK. Build vert 🟢.

## 📜 Règles Critiques pour l'IA
1.  **Aesthetics First** : Chaque nouveau composant doit respecter le style "glassmorphic" et les animations de `framer-motion`.
2.  **No Placeholders** : Toujours utiliser des données de mock réalistes ou générer des images.
3.  **Real-time Mindset** : Toujours prévoir l'impact d'une action sur la session du partenaire.
4.  **Security** : Les politiques RLS de Supabase sont la source de vérité pour les permissions.

## 🚀 Prochaines Étapes
*   Connecter les flux bancaires réels (Gocardless/Bridge) [EN COURS].
*   Finaliser l'onboarding utilisateur complet.
*   Implémenter la signature VAPID côté serveur (Edge Functions) pour les push réels.
