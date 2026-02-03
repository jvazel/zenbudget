---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/ux-design-specification.md']
---

# zenbudget - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for zenbudget, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Gestion du compte personnel utilisateur (Authentification, Profil).
FR2: Validation/Correction des transactions via une pile d'attente "Inbox Zero" (Swipe).
FR3: Création, modification et suppression libre des catégories par l'utilisateur.
FR4: Prédiction automatique des transactions récurrentes par le système.
FR5: Partage familial éphémère (accès 24h) via demande de consentement.
FR6: Calcul et affichage du Reste à Vivre (RAV) dynamique en temps réel.
FR7: Journalisation d'audit immuable de l'identité de l'auteur pour chaque écriture en BDD (RLS).

### NonFunctional Requirements

NFR1: Latence d'interaction UI < 100ms pour garantir la fluidité du swipe.
NFR2: Temps de chargement initial du Dashboard < 2s.
NFR3: Disponibilité locale 24/7 sans dépendance cloud tierce pour les données (Mindset Offline-first).
NFR4: Interface 100% Responsive (Desktop/Mobile) en Mode Sombre par défaut.

### Additional Requirements

- **Starter Template**: Vite (React + TypeScript).
- **Backend**: Supabase (PostgreSQL, Auth, Realtime).
- **State Management**: TanStack Query + Zustand.
- **Animations**: Framer Motion (Swipe feedback).
- **UI**: Shadcn/UI + Tailwind CSS (Thème Ocean Calm).
- **Security**: Supabase Row Level Security (RLS) pour le partage Trio/Duo.
- **UX**: Design "Zen" avec micro-animations de gratification (poussière d'étoiles, etc.).

### FR Coverage Map

FR1: Epic 1 - Gestion du compte personnel utilisateur.
FR2: Epic 2 - Validation/Correction via "Inbox Zero" (Swipe).
FR3: Epic 3 - Gestion libre des catégories.
FR4: Epic 2 - Prédiction automatique des transactions récurrentes.
FR5: Epic 4 - Partage familial éphémère (24h).
FR6: Epic 5 - Calcul du Reste à Vivre (RAV) dynamique.
FR7: Epic 1 - Journalisation d'audit immuable (RLS).

## Epic List

## Epic 1: Fondations & Authentification Sereine
Permettre aux utilisateurs de créer un compte et de sécuriser leurs données dès le départ.

### Story 1.1: Setup Technique & Design System "Ocean Calm"
As a user,
I want a fluid and dark interface,
So that I can reduce my visual fatigue and feel sense of serenity.

**Acceptance Criteria:**
**Given** a new project initialization
**When** the app is launched
**Then** the "Ocean Calm" theme is applied (Deep blue #0f172a, glassmorphism)
**And** Framer Motion animations are configured for smooth transitions.

### Story 1.2: Authentification Supabase & Profils
As a user,
I want to log in with email and password,
So that I can access my private financial data securely.

**Acceptance Criteria:**
**Given** the login page
**When** I enter valid credentials
**Then** I am redirected to the application inbox
**And** my user profile is correctly identified from the `profiles` table.

### Story 1.3: Sécurité des Données (RLS & Audit)
As a system,
I want to ensure each user only sees their own data by default,
So that privacy is maintained through database-level security.

**Acceptance Criteria:**
**Given** multiple users in the database
**When** an authenticated user queries transactions
**Then** only transactions linked to their owned accounts are returned
**And** Supabase Row Level Security (RLS) policies are active on all tables.

## Epic 2: Le Rituel de l'Inbox Zero (Swipe & IA)
Offrir l'interaction cœur de l'app (swipe) et automatiser la classification via l'IA.

### Story 2.1: La Pile de Cartes Interactive
As a user,
I want to see my pending transactions in a stack,
So that I can focus on processing one transaction at a time.

**Acceptance Criteria:**
**Given** pending transactions in the database
**When** I visit the inbox
**Then** I see the top 3 transactions rendered in a visual stack
**And** the top card is interactive.

### Story 2.2: Validation par Swipe (Geste & Sync)
As a user,
I want to swipe a transaction right to validate or left to ignore,
So that I can empty my inbox quickly with a fluid gesture.

**Acceptance Criteria:**
**Given** a transaction card on top of the stack
**When** I swipe it right
**Then** the status is updated to 'validated' in the database
**And** an optimistic update removes the card instantly from the UI.

### Story 2.3: Synchronisation Temps-Réel (Supabase Realtime)
As a user,
I want to see my partner's changes instantly without refreshing,
So that we can coordinate our budget effectively.

**Acceptance Criteria:**
**Given** two active sessions on different devices
**When** one user validates a transaction
**Then** the transaction is removed from the stack on the other user's device via real-time subscription.

### Story 2.4: Moteur de Routine IA
As a system,
I want to automatically predict and score incoming transactions based on historical patterns,
So that the user only has to validate suggestions in their inbox.

**Acceptance Criteria:**
**Given** a new incoming transaction
**When** historical data matches the merchant or amount pattern
**Then** a predicted record is created in the `transactions` table with 'pending' status
**And** the prediction algorithm assigns the most likely category with a confidence score.

## Epic 3: Configuration & Catégories Intelligentes
Donner le contrôle total à l'utilisateur sur son organisation budgétaire.

### Story 3.1: Interface de Gestion des Catégories
As a user,
I want to create and personalize my categories (name, icon, color) in the "Setup" tab,
So that I can organize my budget according to my lifestyle.

**Acceptance Criteria:**
**Given** the "Setup" tab
**When** I create a new category with a specific icon and color
**Then** it is saved in the database
**And** it immediately appears in my categories list.

### Story 3.2: Visualisation des Catégories dans l'Inbox
As a user,
I want to see the category icon and color on each transaction card,
So that I can visually identify the expense type at a glance.

**Acceptance Criteria:**
**Given** a transaction with a predicted category
**When** the card is displayed in the stack
**Then** the background and icon colors match the category's theme
**And** the category name is clearly visible.

## Epic 4: Duo Pilot (Partage & Collaboration 24h)
Activer la collaboration familiale sécurisée et temporaire.

### Story 4.1: Système d'Invitation Duo
As a user,
I want to generate a temporary invitation link,
So that I can invite my partner to co-pilot our budget.

**Acceptance Criteria:**
**Given** the sharing settings
**When** I generate an invite
**Then** a unique secure token is created
**And** I can copy a link to share with my partner.

### Story 4.2: RLS de Partage (Fenêtre de 24h)
As a system,
I want to strictly limit partner access to a 24-hour window after acceptance,
So that privacy is preserved unless explicitly shared.

**Acceptance Criteria:**
**Given** an accepted invitation
**When** 24 hours have passed since the acceptance
**Then** the partner's access is automatically revoked via RLS policies
**And** they can no longer view shared data until re-invited.

### Story 4.3: Suivi d'Audit Partagé
As a user,
I want to see who validated a transaction,
So that we can avoid confusion and double validations.

**Acceptance Criteria:**
**Given** a transaction validated by my partner
**When** I view my dashboard or history
**Then** the transaction shows a "Validated by Partner" badge
**And** the audit log correctly records the author's identity.

## Epic 5: Pilotage Zen (Dashboard & RAV Dynamique)
Visualiser l'état financier en temps réel et projeter l'effort d'épargne.

### Story 5.1: ZenGauge du Reste à Vivre (RAV)
As a user,
I want a circular gauge showing my monthly "Safe-to-Spend" amount,
So that I can feel calm knowing exactly what's left for the month.

**Acceptance Criteria:**
**Given** validated and fixed expenses
**When** I view the dashboard
**Then** a large ZenGauge displays the remaining balance (RAV) relative to the total monthly income
**And** the colors transition smoothly based on the percentage remaining.

### Story 5.2: Gestion des Objectifs d'Épargne
As a user,
I want to create saving projects and see their visual progress,
So that I can stay motivated to achieve my financial goals.

**Acceptance Criteria:**
**Given** a savings goal (e.g., "Trip to Japan")
**When** I allocate funds to this project
**Then** a dedicated mini-ZenGauge shows the progress towards the target
**And** the project card updates in real-time.

### Story 5.3: Transition "Zero State" vers Dashboard
As a user,
I want to be redirected to the dashboard with a rewarding animation once my inbox is empty,
So that I feel a sense of accomplishment at the end of my daily ritual.

**Acceptance Criteria:**
**Given** the last transaction card being swiped
**When** the stack becomes empty
**Then** a "Zen State" success animation is played
**And** the view automatically transitions to the Dashboard summary.

### Story 5.4: Navigation Temporelle & Historique
As a user,
I want to navigate between months using arrows or a dropdown,
So that I can consult past budgets with my preference remembered by the system.

**Acceptance Criteria:**
**Given** the dashboard view
**When** I use the ←/→ arrows or the dropdown
**Then** the ZenGauge and transactions filter accordingly for the selected month
**And** the selected month is persisted in the session memory.

### Story 5.5: Recherche et Filtrage de Transactions
As a user,
I want to search transactions by description or filter by category,
So that I can quickly find specific expenses or incomes in my history.

**Acceptance Criteria:**
**Given** the dashboard view with a list of transactions
**When** I type in the search field
**Then** the list filters in real-time to show only matching descriptions
**And** when I select one or more categories from the filter menu
**Then** only transactions belonging to those categories are displayed
**And** a "Clear Filters" button becomes visible to reset the view.

## Epic 6: Analyses de Sérénité [COMPLETED]
Fournir des outils d'analyse avancés pour mieux comprendre et optimiser ses finances.

### Story 6.1: Détecteur d'Anomalies (ZenAlert) [DONE]
As a user,
I want to be alerted of unusual transactions or significant price changes,
So that I can identify errors or spendings that don't match my habits.

**Acceptance Criteria:**
**Given** a list of recent transactions
**When** a transaction significantly exceeds the average for its category or description
**Then** it is highlighted with a "ZenAlert" badge
**And** I can see a comparison with past similar transactions.

### Story 6.2: Audit des Abonnements (ZenContracts)
As a user,
I want a clear list of all my recurring billing and subscriptions,
So that I can see my total fixed costs and decide what to keep or cancel.

**Acceptance Criteria:**
**Given** the "Analyse" tab
**When** I view the "Subscriptions" section
**Then** I see all recurring transactions grouped by frequency
**And** the system calculates the total monthly and yearly cost of these contracts.

### Story 6.3: Tendances & Inflation (ZenTrends)
As a user,
I want to see how my spending evolves month over month,
So that I can track my personal inflation and adjust my lifestyle.

**Acceptance Criteria:**
**Given** historical transaction data
**When** I view the "Trends" chart
**Then** I see the evolution of spending for my top 3 categories over the last 6 months
**And** the system highlights any category with an increase > 10% compared to previous months.

### Story 6.4: Calcul du Potentiel d'Épargne (ZenSavings)
As a user,
I want a suggestion of the "Safe-to-Save" amount at the beginning of the month,
So that I can reach my projects faster with peace of mind.

**Acceptance Criteria:**
**Given** my average past income and fixed expenses
**When** I visit the "Savings" section of the "Analyse" tab
**Then** I see a recommended savings amount for the current month
**And** I can transfer this amount conceptually into one of my projects in one click.

## Epic 7: Pilotage Analytique (Analyse Zen) [COMPLETED]
Offrir des visualisations avancées pour comprendre le fleuve de ses finances.

### Story 7.1: Visualisation de l'Analyse Zen [DONE]
As a user,
I want to compare my spending with my habits and see where my energy (money) goes,
So that I can adjust my lifestyle with awareness.

## Epic 8: Le Majordome Zen (Automatisation IA) [COMPLETED]
Réduire la charge mentale via l'apprentissage des habitudes.

### Story 8.1: Prédiction & Apprentissage [DONE]
As a user,
I want the system to remember my categorizations,
So that future transactions are automatically associated with the right category.

## Epic 9: Le Rituel de l'Import (Automatisation & Connectivité)
Faciliter l'entrée de données pour alimenter l'Inbox sans saisie manuelle fastidieuse.

### Story 9.1: Import de Transactions (CSV/JSON)
As a user,
I want to import a file from my bank,
So that my inbox is automatically populated with my actual expenses.

**Acceptance Criteria:**
- [ ] **Sélecteur de Fichier** : Bouton dans la vue "Inbox" ou "Settings" pour charger un fichier local.
- [ ] **Mapping Intelligent** : Parser les colonnes (Date, Description, Montant) de manière flexible.
- [ ] **Détection de Doublons** : Ne pas importer des transactions déjà présentes (basé sur date+montant+desc).
- [ ] **Populate Inbox** : Les nouvelles transactions apparaissent au sommet de la pile `pending`.
- [x] Visual Gratification : Animation de "succès" après l'import montrant combien de transactions ont été chargées.

### Story 9.2: Export de Données & Rapports Zen
As a user,
I want to export my validated transactions in CSV or PDF format,
So that I can archive my data or share it with my accountant.

**Acceptance Criteria:**
- [ ] **Bouton d'Export** : Dans le Dashboard ou les Paramètres, bouton "Exporter mes données".
- [ ] **Sélecteur de Période** : Choisir le mois ou l'année à exporter.
- [ ] **Format CSV** : Génération d'un fichier CSV propre et structuré.
- [ ] **Rapport PDF (Optionnel)** : Un récapitulatif visuel "Zen" de la période.

---

# Epic 10 : ZenVision - La Clairvoyance Financière

Donner à l'utilisateur une vision claire de son avenir financier immédiat en utilisant la puissance de l'automatisation.

## Story 10.1 : Calendrier des Échéances

As a user organisé,
I want to see a list or calendar of upcoming recurring transactions,
So that I know exactly when my money will leave my account.

- [ ] Créer `projectionService.ts` pour calculer les dates futures des patterns auto-validés.
- [ ] Ajouter une vue "Échéances Prochaines" dans le Dashboard.
- [ ] AC: Les transactions auto-validées sont projetées sur les 30 prochains jours.

## Story 10.2 : Projection du Solde

As a user prévoyant,
I want to see a line chart predicting my balance over the next 30 days,
So that I can adjust my spending if needed.

- [ ] Calculer le solde théorique quotidien en combinant solde actuel et projections.
- [ ] Intégrer un graphique de prévision (ligne en pointillés) dans la vue principale.
- [ ] AC: Le graphique montre clairement la trajectoire du solde jusqu'à J+30.

## Story 10.3 : Alertes Anti-Découvert

As a user serein,
I want to be alerted if my projected balance falls below zero,
So that I can avoid bank fees and stress.

- [ ] Détecter les franchissements de seuil (Zéro ou limite personnalisée).
- [ ] Afficher une alerte "ZenDanger" critique sur le dashboard si le risque est détecté.
- [ ] AC: L'alerte indique la date estimée du solde négatif et le montant manquant.

### Story 9.3: Pilotage Automatique (Auto-validation)
As a "Zen Master" confiant,
I want to mark recurring transactions to be validated automatically,
So that I don't have to swipe for my rent and fixed subscriptions every month.

**Acceptance Criteria:**
- [ ] **Option "Toujours Valider"** : Case à cocher ou toggle lors de la validation d'une transaction récurrente.
- [ ] **Traitement Background** : Le système valide automatiquement les correspondances exactes dans l'Inbox.
- [ ] **Résumé Silencieux** : Notification discrète "3 transactions ont été validées pour vous".
# Epic 13: ZenConnect - Automatisation Bancaire Sereine

Supprimer la friction de l'import manuel en connectant directement les comptes bancaires via Open Banking.

### Story 13.1: Connexion Bancaire Directe (Sync Temps-Réel)
As a user,
I want to securely connect my bank account to ZenBudget,
So that my transactions are automatically synchronized without any manual effort.

**Acceptance Criteria:**
- [ ] **Contrainte : Solution 100% Gratuit** (Enable Banking recommandé).
- [ ] **Intégration Agrégateur** : Mise en place d'un tunnel de connexion sécurisé conforme à la DSP2 via Enable Banking.
- [ ] **Sélection de Compte** : L'utilisateur peut choisir quel compte bancaire synchroniser avec ZenBudget.
- [ ] **Récupération Historique** : Récupération automatique des 30 derniers jours lors de la première connexion.
- [ ] **Sync Quotidienne** : Les nouvelles transactions apparaissent automatiquement dans l'Inbox.
- [ ] **Sécurité** : Consentement conforme à la DSP2 avec renouvellement tous les 90 jours.
- [ ] **Privacy** : Option de déconnexion et suppression des accès bancaires à tout moment.
