# Development Roadmap - zenbudget

Ce document définit les étapes d'implémentation pour amener **zenbudget** de la conception à la réalité, en suivant une approche par itérations de valeur.

## Phase 1 : Fondations & Zen UI (MVP Core)
*Objectif : Mettre en place la stack technique et l'interface de swipe.*

- [ ] **Setup Initial** : Initialisation Vite + Tailwind + Shadcn/UI.
- [ ] **Theme Ocean Calm** : Configuration de la palette sombre, des polices et des variables CSS.
- [ ] **TransactionStack** : Développement du composant de pile de cartes avec Framer Motion (Swipe directionnel).
- [ ] **Infrastructure Supabase** : Création du projet Supabase, schéma SQL initial et Auth de base.

## Phase 2 : Le Rituel Quotidien (Inbox Zero)
*Objectif : Rendre l'application fonctionnelle pour un utilisateur seul.*

- [ ] **IA Mock/Integration** : Pipeline pour générer des prédictions sur les transactions `pending`.
- [ ] **Validation Flow** : Connexion du swipe à la mise à jour de la base de données (PostgREST).
- [ ] **Optimistic Updates** : Implémentation de React Query pour une réactivité instantanée.
- [ ] **Zero State Animation** : Transition fluide vers le Dashboard une fois l'inbox vide.

## Phase 3 : Coordination Dual-Pilot (24h Sharing)
*Objectif : Activer la collaboration Duo en toute sécurité.*

- [ ] **Sharing Logic** : Système de génération et validation de jetons d'accès temporaires.
- [ ] **RLS Policies** : Configuration fine de PostgreSQL pour le partage de 24h.
- [ ] **Realtime Sync** : Abonnements WebSockets pour coordonner Johann et son conjoint.
- [ ] **Audit Trail** : Suivi visuel "Qui a validé quoi ?".

## Phase 4 : Pilotage & Visualisation (Zen Dashboard)
*Objectif : Donner du sens aux données validées.*

- [ ] **ZenGauge Component** : Création des arcs de progression pour le RAV (Reste à Vivre) et les projets.
- [ ] **Savings Projects** : Gestion des objectifs d'épargne.
- [ ] **Performance & Polish** : Optimisation du bundle, PWA (Offline support) et feedback haptique.

---

## Prochaines Étapes Immédiates
1. Initialisation du dépôt de code.
2. Création de la structure de dossiers `features/`.
3. Premier prototype de la `TransactionStack`.
