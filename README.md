# 🌊 zenbudget | La Sérénité Financière

**zenbudget** est une application de gestion de finances personnelles conçue pour transformer le stress budgétaire en un rituel quotidien apaisant. Fini les tableaux complexes, place à l'intuition et au calme.

## ✨ Philosophie "Zen"
- **Inbox Zero** : Validez vos transactions d'un simple geste (Swipe).
- **Reste à Vivre (RAV)** : Une jauge unique pour savoir exactement ce que vous pouvez dépenser.
- **Duo Pilot** : Partagez votre budget avec votre partenaire en un clic (fenêtre de 24h sécurisée).
- **Zen Notifications** : Soyez informé des actions de votre partenaire et recevez des conseils proactifs (Zen Infos).
- **Analyses de Sérénité** : Zen Tendances, Zen Alerte (Découvert) et Zen Épargne pour anticiper sans effort.
- **ZenMobile (PWA)** : Installez l'application sur votre mobile pour un accès instantané.
- **Mode Offline** : Continuez à swiper vos transactions même sans réseau, les données se synchronisent automatiquement au retour de la connexion.
- **Notifications Push** : Recevez des alertes proactives directement sur votre écran verrouillé.

## 🛠️ Stack Technique
- **Frontend** : React 19 + TypeScript + Vite 7
- **Animations** : Framer Motion (Interactions fluides, toasts glassmorphic)
- **Design System** : Tailwind CSS v4 + Lucide Icons
- **Backend & Temps Réel** : Supabase (PostgreSQL, Auth, Realtime, RLS)
- **PWA** : Vite PWA + Custom Service Worker (Push & Sync)
- **Gestion d'État** : Zustand & TanStack Query
- **Sécurité** : Row Level Security (RLS) pour un isolement total des données.

## 🚀 Installation locale

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd zenbudget
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase & Push**
   - Créez un projet sur [Supabase](https://supabase.com).
   - Copiez `.env.example` en `.env`.
   - Remplissez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
   - Pour les notifications : générez vos clés VAPID (`npx web-push generate-vapid-keys`) et remplissez `VITE_VAPID_PUBLIC_KEY`.

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## 📈 Fonctionnalités Avancées
- **Zen Analysis (Le Majordome)** :
    - **Zen Alerte** : Détection des risques de découvert et anomalies "Gardien du Dérapage".
    - **Zen Contrats** : Audit automatique des abonnements récurrents et détection des hausses de prix.
    - **Zen Épargne** : Identification des opportunités de virement vers vos projets ("L'Opportuniste").
- **ZenMobile (Full PWA)** : Architecture mobile-first avec support hors-ligne complet, file d'attente de synchronisation et notifications push natives.
- **Interface Immersive** : Glassmorphism, animations fluides et interactions "Zen" (Swipe, Modales Focus).

---
*Fait avec ❤️ pour apporter un peu de calme dans vos chiffres.*
