# 🌊 zenbudget | La Sérénité Financière

**zenbudget** est une application de gestion de finances personnelles conçue pour transformer le stress budgétaire en un rituel quotidien apaisant. Fini les tableaux complexes, place à l'intuition et au calme.

## ✨ Philosophie "Zen"
- **Inbox Zero** : Validez vos transactions d'un simple geste (Swipe).
- **Reste à Vivre (RAV)** : Une jauge unique pour savoir exactement ce que vous pouvez dépenser.
- **Duo Pilot** : Partagez votre budget avec votre partenaire en un clic (fenêtre de 24h sécurisée).
- **Analyses de Sérénité** : ZenAlert, ZenTrends et ZenSavings pour anticiper et épargner sans effort.

## 🛠️ Stack Technique
- **Frontend** : React 18 + TypeScript + Vite
- **Animations** : Framer Motion (Interactions fluides et swipes)
- **Design System** : Tailwind CSS + Lucide Icons
- **Backend & Temps Réel** : Supabase (PostgreSQL, Auth, Realtime, RLS)
- **Gestion d'État** : TanStack Query
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

3. **Configuration Supabase**
   - Créez un projet sur [Supabase](https://supabase.com).
   - Copiez `.env.example` en `.env`.
   - Remplissez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

## 📈 Fonctionnalités Avancées
- **Zen Analysis** : Suite complète (Voyage Temporel, Fuites d'Énergie, Fleuve des Flux) pour comprendre ses habitudes.
- **ZenAlert** : Détection intelligente des anomalies de dépenses.
- **Portals & Focus** : Modales immersives avec blocage du scroll arrière pour une concentration totale.

---
*Fait avec ❤️ pour apporter un peu de calme dans vos chiffres.*
