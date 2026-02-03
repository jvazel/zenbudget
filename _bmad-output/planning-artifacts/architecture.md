---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
workflowType: 'architecture'
project_name: 'zenbudget'
user_name: 'Johann'
date: '2026-01-22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- **Système de Validation "Inbox Zero"** : Interface de type pile de cartes (Swipe) pour le traitement rapide des transactions prédites.
- **Coordination Dual-Pilot** : Partage de données financières en temps réel entre deux utilisateurs distincts.
- **Gestion des Consentements** : Mécanisme de partage temporaire (fenêtre de 24h) pour préserver la vie privée tout en permettant le pilotage commun.
- **Moteur de Prédiction IA** : Pipeline de données reliant l'IA aux transactions pour générer les suggestions dans l'Inbox.

**Non-Functional Requirements:**
- **Latence Interactionnelle ultra-faible** : Le swipe doit être perçu comme instantané (<100ms) pour maintenir le sentiment "Zen".
- **Synchronisation Temps-Réel** : Les actions d'un utilisateur (validation d'une carte) doivent être reflétées immédiatement chez le conjoint.
- **Sécurité & Confidentialité** : Chiffrement des données sensibles et gestion rigoureuse des jetons de partage de 24h.
- **Disponibilité (Offline-First)** : Capacité à effectuer le rituel quotidien sans interruption, avec synchronisation lors du retour en ligne.

### Scale & Complexity

Le projet présente une complexité modérée à élevée due aux exigences de synchronisation temps-réel et à la gestion multi-utilisateurs.

- **Primary domain** : Full-Stack Web App (React SPA focus)
- **Complexity level** : Medium-High
- **Estimated architectural components** : ~8 (Frontend, Auth, Real-time Sync, AI Engine, Database, Background Jobs, API Gateway, Storage)

### Technical Constraints & Dependencies

- **Platform** : Navigateur moderne (Desktop & Mobile) via une Web App responsive.
- **Data Sharing** : Synchronisation bi-latérale complexe entre deux locataires (tenants) de données.

### Cross-Cutting Concerns Identified

- **Gestion d'État Global** : Coordination entre l'état local (réactivité swipe) et l'état distant (vérité système).
- **Audit & Historisation** : Tracabilité des transactions validées par Johann vs son conjoint pour éviter les surprises.
- **Performance Perçue** : Utilisation intensive de micro-animations et de "optimistic UI".

## Starter Template Evaluation

### Primary Technology Domain

**Full-Stack Web Application (SPA Focus)** based on the need for ultra-responsive user interactions and real-time coordination.

### Starter Options Considered

- **Next.js (App Router)** : Robuste pour le full-stack, mais jugé potentiellement trop lourd pour l'objectif de réactivité extrême (<100ms) de la pile de cartes.
- **Vite (React + TS)** : Sélectionné pour sa simplicité, sa vitesse de build et sa performance d'exécution supérieure pour les interactions client intensives.

### Selected Starter: Vite (React + TypeScript)

**Rationale for Selection:**
- **Vitesse Maximale** : Indispensable pour l'aspect "Zen" de l'interface.
- **Légèreté** : Permet un contrôle total sur le bundle et les animations Framer Motion.
- **Compatibilité** : Intégration parfaite avec Shadcn/UI et Tailwind CSS.

**Initialization Command:**

```bash
npx create-vite@latest zenbudget --template react-ts
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript pour une sécurité de typage accrue.
- Vite comme moteur de build et serveur de développement ultra-rapide.

**Styling Solution:**
- Tailwind CSS (configuré post-init) pour une gestion flexible du thème Ocean Calm.

**Code Organization:**
- Structure standard `src/` avec séparation claire des composants et de la logique métier.

**Development Experience:**
- Hot Module Replacement (HMR) instantané pour une itération de design rapide.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Backend-as-a-Service** : Choix de Supabase pour la base de données et la synchronisation temps-réel.
- **Authentification** : Supabase Auth intégré.
- **Gestion d'État** : TanStack Query (React Query) pour la synchronisation serveur/client.

**Important Decisions (Shape Architecture):**
- **Animations** : Framer Motion pour la mécanique de swipe.
- **État Local** : Zustand pour la gestion légère des états UI.
- **Logique IA** : Supabase Edge Functions (via Vercel AI SDK potentially).

**Deferred Decisions (Post-MVP):**
- **Offline-First poussé** : Utilisation de Service Workers (PWA) pour le mode hors-ligne complet.
- **Analytique** : Choix d'un moteur d'analyse de comportement utilisateur.

### Data Architecture

- **Base de données** : PostgreSQL (via Supabase).
- **Modélisation** : Schémas relationnels avec Row Level Security (RLS) pour le cloisonnement des données Johann/Conjoint.
- **Temps-Réel** : Abonnements WebSockets (Supabase Realtime) pour la synchronisation bi-latérale des transactions.

### Authentication & Security

- **Méthode** : Supabase Auth (Email/Password + potentiellement Magic Link).
- **Autorisation** : RLS au niveau SQL pour sécuriser le partage temporaire de 24h.
- **Chiffrement** : Chiffrement au repos et en transit natif Supabase.

### API & Communication Patterns

- **API Design** : Utilisation des bibliothèques client postgREST (Supabase JS) pour les opérations standard.
- **Logique Métier** : Edge Functions pour les tâches asynchrones ou complexes (ex: scoring IA).

### Frontend Architecture

- **State Management** : Mix entre React Query (Data Fetching/Caching) et Zustand (UI/Global state).
- **Component Design** : Atomic Design orienté composants Shadcn/UI customisés.
- **Performance** : Optimistic Updates obligatoires pour le swipe afin d'atteindre le <100ms perçu.

### Infrastructure & Deployment

- **Hébergement Frontend** : Vercel ou Netlify (Auto-deploy via GitHub).
- **Backend/Database** : Supabase Cloud (Région EU).

### Decision Impact Analysis

**Implementation Sequence:**
1. Initialisation du projet Vite.
2. Configuration de Supabase & Auth.
3. Mise en place de Framer Motion & Animation du swipe (Skeleton).
4. Connectivité temps-réel et Row Level Security.

**Cross-Component Dependencies:**
Le moteur de swipe dépend directement de la qualité de la synchronisation optimiste (React Query) pour ne pas paraître saccadé en cas de micro-coupure réseau.

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database Naming Conventions:**
- Tables : `snake_case`, au pluriel (ex: `profiles`, `transactions`).
- Colonnes : `snake_case` (ex: `user_id`, `created_at`).
- Clés Étrangères : format `table_singular_id` (ex: `profile_id`).

**API Naming Conventions:**
- PostgREST : Les endpoints s'alignent sur les noms de tables.
- Edge Functions : `kebab-case` (ex: `process-transaction`).

**Code Naming Conventions:**
- Composants : `PascalCase` (ex: `ZenGauge.tsx`).
- Fonctions/Variables : `camelCase` (ex: `validateSwipe`).
- Fichiers : `kebab-case` pour les utilitaires, `PascalCase` pour les composants.

### Structure Patterns

**Project Organization:**
- **Feature-based** : `src/features/[feature-name]/` contenant `components/`, `hooks/`, et `api/`.
- **Shared** : `src/components/ui/` (Shadcn), `src/hooks/` (génériques), `src/lib/` (config Supabase/Vite).

### Format Patterns

**API Response Formats:**
- Supabase-js retourne `{ data, error }`. Ce pattern doit être maintenu dans les services wrappers.
- Dates : ISO 8601 UTC uniquement (`YYYY-MM-DDTHH:mm:ssZ`).

**Data Exchange Formats:**
- JSON : `camelCase` dans le frontend, `snake_case` dans la base de données (mappage via Supabase client ou helpers).

### Communication Patterns

**State Management Patterns:**
- **Server State** : Géré exclusivement par TanStack Query.
- **Global UI State** : Zustand (ex: `useAuthStore`, `useThemeStore`).
- **Local State** : `useState` pour les interactions solitaires (ex: position du swipe).

### Process Patterns

**Error Handling Patterns:**
- **Silent Errors** : Retours discrets via Toasts pour les interactions non-bloquantes.
- **Critical Errors** : Error Boundaries React pour les crashs de rendu.
- **Sync Errors** : Rollback visuel immédiat en cas d'échec d'une "Optimistic Update".

**Loading State Patterns:**
- Utilisation de **Skeletons** (Shadcn/UI) pour le chargement initial.
- Shimmer discret sur le `TransactionStack` pendant le fetch IA.

### Enforcement Guidelines

**All AI Agents MUST:**
- Utiliser TypeScript de manière stricte (`noImplicitAny`).
- Co-localiser les tests unitaires (`.test.ts`) avec les fichiers sources.
- Ne jamais coder en dur de secrets ou d'URLs (utiliser `.env`).

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
zenbudget/
├── src/
│   ├── components/
│   │   └── ui/               # Shadcn/UI primitives
│   ├── features/             # Modules métier (Bounded Contexts)
│   │   ├── auth/             # Connexion et gestion des profils DUO
│   │   ├── inbox/            # Pile de cartes, Swipe logic, IA predictions
│   │   ├── dashboard/        # Reste à Vivre (RAV), ZenGauges
│   │   └── sharing/          # Gestion du partage 24h et consentements
│   ├── hooks/                # Hooks partagés (useSupabase, useAuth)
│   ├── lib/                  # Configuration (supabase-client.ts, utils.ts)
│   ├── services/             # Abstractions API et logique IA
│   ├── types/                # Définitions TypeScript globales
│   ├── utils/                # Utilitaires de formatage et calculs
│   ├── App.tsx               # Point d'entrée UI & Router
│   └── main.tsx              # Point d'entrée Vite
├── supabase/
│   ├── migrations/           # Schémas SQL et RLS policies
│   └── functions/            # Edge Functions (Logique IA & Sync complexe)
├── tests/
│   ├── e2e/                  # Tests de scénarios complets (Playwright)
│   └── unit/                 # Tests de composants et logique métier
├── public/                   # Assets statiques (icônes, images)
├── .env.example              # Template des variables d'environnement
├── tailwind.config.js
└── vite.config.ts
```

### Architectural Boundaries

**API Boundaries:**
- **External** : Communication avec la DB via Supabase Client (PostgREST).
- **Internal** : Séparation stricte entre les `features`. Une feature ne doit pas importer directement des composants internes d'une autre feature (passage par `index.ts` public si nécessaire).

**Component Boundaries:**
- **Smart vs Dumb** : Les composants de `features` gèrent l'état (Smart), les composants `ui` gèrent uniquement le rendu (Dumb).

**Data Boundaries:**
- **RLS (Row Level Security)** : La frontière de sécurité est au niveau de la base de données, filtrant automatiquement les données selon l'utilisateur authentifié.

### Requirements to Structure Mapping

**Feature: Inbox Zero**
- Components: `src/features/inbox/`
- Hooks: `src/features/inbox/hooks/`
- API Logic: `src/services/transactions.ts`

**Feature: Dynamic Sharing (24h)**
- Logic: `src/features/sharing/`
- Database Control: `supabase/migrations/` (RLS policies)

### Integration Points

**Internal Communication:**
- **Events/Sync** : Supabase Realtime diffuse les changements. React Query les intercepte pour mettre à jour le cache frontend.

**Data Flow:**
1. Action utilisateur (Swipe).
2. Mise à jour optimiste locale (Zustand/Query).
3. Appel Supabase (Service).
4. Notification temps-réel reçue par le conjoint.
5. Rafraîchissement automatique de l'UI du conjoint.

# Architecture Phase V2 (Evolution)

## V2 Architectural Decisions (ADRs)

### ADR-001: ZenAnalyst Strategy (Rule-Based & Local)
**Decision:** Utiliser un moteur de règles déterministes (Rule Engine) exécuté localement ou via Edge Functions légères, plutôt que des appels LLM coûteux.

**Rationale:**
- **Coût** : Gratuit (pas de tokens API).
- **Performance** : Exécution immédiate (<10ms).
- **Confidentialité** : Les données financières restent dans le périmètre applicatif.
- **Fiabilité** : Les alertes sont basées sur des mathématiques (écart-type, seuils), pas sur des hallucinations.

**Implementation Strategy:**
- Création d'un `ZenAnalystService` (TypeScript).
- Règles :
  - `BudgetOverflowRule` : Alerte si dépense > X% du budget à Y% du mois.
  - `SubscriptionSpikeRule` : Alerte si transaction récurrente > montant habituel + 10%.
  - `SavingsOpportunityRule` : Alerte si solde > moyenne + 20%.

### ADR-002: Mobile Technology (Progressive Web App)
**Decision:** Renforcer l'application Web existante en PWA "Installable" plutôt que de développer une application native/hybride.

**Rationale:**
- **Time-to-Market** : Zéro code spécifique à maintenir.
- **Expérience** : Le thème "Ocean Calm" est déjà mobile-first.
- **Portabilité** : Fonctionne partout (iOS/Android/Desktop).

**Implementation Strategy:**
- Configuration du `manifest.json` (Icônes, couleurs, `display: standalone`).
- Service Workers (Vite PWA Plugin) pour le cache offline des assets et de l'API (GET).
- "Add to Home Screen" prompt personnalisé.

## V2 System Design Updates

### New Component: ZenAnalyst Engine
- **Type** : Background Service (Frontend or Edge).
- **Trigger** :
  - *Reactive* : À chaque nouvelle transaction (via Realtime ou création locale).
  - *Periodic* : Au chargement du Dashboard (User Session).
- **Output** : Création d'une notification interne `ZenNotification` (persistée dans Supabase ou Store local).

### Mobile Capabilities
- **Offline Mode** :
  - Cache des transactions (TanStack Query Persisters -> LocalStorage/IndexedDB).
  - Queue de mutations pour les actions hors-ligne (validation swipe).

