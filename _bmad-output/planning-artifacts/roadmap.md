# Development Roadmap - zenbudget

Ce document définit les étapes d'implémentation pour amener **zenbudget** de la conception à la réalité, en suivant une approche par itérations de valeur.

## Phase 1 : Fondations & Zen UI (MVP Core) [COMPLETED]
*Objectif : Mettre en place la stack technique et l'interface de swipe.*

- [x] **Setup Initial** : Initialisation Vite + Tailwind + Shadcn/UI.
- [x] **Theme Ocean Calm** : Configuration de la palette sombre, des polices et des variables CSS.
- [x] **TransactionStack** : Développement du composant de pile de cartes avec Framer Motion (Swipe directionnel).
- [x] **Infrastructure Supabase** : Création du projet Supabase, schéma SQL initial et Auth de base.

## Phase 2 : Le Rituel Quotidien (Inbox Zero) [COMPLETED]
*Objectif : Rendre l'application fonctionnelle pour un utilisateur seul.*

- [x] **IA Mock/Integration** : Pipeline pour générer des prédictions sur les transactions `pending`.
- [x] **Validation Flow** : Connexion du swipe à la mise à jour de la base de données (PostgREST).
- [x] **Optimistic Updates** : Implémentation de React Query pour une réactivité instantanée.
- [x] **Zero State Animation** : Transition fluide vers le Dashboard une fois l'inbox vide.

## Phase 3 : Coordination Dual-Pilot (24h Sharing) [COMPLETED]
*Objectif : Activer la collaboration Duo en toute sécurité.*

- [x] **Sharing Logic** : Système de génération et validation de jetons d'accès temporaires.
- [x] **RLS Policies** : Configuration fine de PostgreSQL pour le partage de 24h.
- [x] **Realtime Sync** : Abonnements WebSockets pour coordonner Johann et son conjoint.
- [x] **Audit Trail** : Suivi visuel "Qui a validé quoi ?".

## Phase 4 : Pilotage & Visualisation (Zen Dashboard) [COMPLETED]
*Objectif : Donner du sens aux données validées.*

- [x] **ZenGauge Component** : Création des arcs de progression pour le RAV (Reste à Vivre) et les projets.
- [x] **Savings Projects** : Gestion des objectifs d'épargne.
- [x] **Performance & Polish** : Optimisation du bundle, PWA (Offline support) et feedback haptique.

---

# Roadmap V2 : Intelligence & Mobilité
*Lancement : Février 2026*

## Phase 5 : ZenAnalyst (Intelligence Proactive)
*Objectif : Un gardien silencieux pour vos finances (ADR-001).*

- [ ] **ZenAnalyst Service** : Création du moteur de règles (TypeScript).
- [ ] **Règle Dérapage** : Alerte préventive sur le dépassement de budget.
- [ ] **Règle Abonnement** : Détection de hausse inattendue de prélèvement.
- [ ] **Règle Opportunité** : Suggestion d'épargne sur solde excédentaire.
- [ ] **Notification Center** : UI discrète pour afficher ces insights.

## Phase 6 : ZenMobile (PWA Installable)
*Objectif : L'expérience native sans les stores (ADR-002).*

- [ ] **Web App Manifest** : Icônes, couleurs et nom d'application.
- [ ] **Service Workers** : Mise en cache pour le chargement instantané offline.
- [ ] **Mutation Queue** : Gestion des actions (swipes) en mode déconnecté.
- [ ] **Install Prompt** : Incitation fluide à l'installation sur iOS/Android.
