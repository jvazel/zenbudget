---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-zenbudget-2026-01-22.md', '_bmad-output/analysis/brainstorming-session-2026-01-22.md']
briefCount: 1
researchCount: 0
brainstormingCount: 1
projectDocsCount: 0
classification:
  projectType: 'web_app'
  domain: 'fintech'
  complexity: 'high'
  projectContext: 'greenfield'
workflowType: 'prd'
date: 2026-01-22
author: Johann
---

# Product Requirements Document - zenbudget

**Author:** Johann
**Date:** 2026-01-22

## Executive Summary

**zenbudget** est une application web de gestion financière familiale conçue pour transformer la corvée de la comptabilité en un rituel "Zen" et gratifiant. L'application cible les foyers (notamment les couples à comptes séparés) souhaitant piloter leur effort d'épargne commun sans la lourdeur des outils bancaires traditionnels. Son cœur repose sur une interaction "Inbox Zero" prédictive, permettant de tenir son budget en moins de 10 secondes par jour.

## Success Criteria

### User Success
- **Optimisation Budgétaire** : Réduction quantifiable des dépenses non-essentielles mois après mois.
- **Engagement Quotidien** : Rituel de validation complété en < 10s sans friction cognitive.
- **Sérénité Financière** : Visibilité immédiate sur le "Reste à Vivre" et l'effort d'épargne.

### Business & Technical Success
- **Rétention** : Utilisation active continue sur 6 mois par les deux conjoints.
- **Précision IA** : Taux de succès du moteur de routine > 70% après 30 jours.
- **Performance** : Dashboard interactif chargé en < 2s ; latence d'interface < 100ms.

## Product Scope

### MVP (Phase 1)
- **Inbox Zero** : Interface "swipe" pour valider/corriger les transactions prédites.
- **Moteur de Routine** : Algorithme de détection des récurrences et habitudes.
- **Dashboard Zen** : Vue temps réel du RAV, de la balance et des objectifs d'épargne.
- **Gestion Libre** : CRUD complet des catégories par tout utilisateur.
- **Partage Familial** : Consentement éphémère (24h) pour la vue commune.
- **Traçabilité** : Audit logs complets des modifications en base de données.

### Growth & Vision (Phases 2-3)
- **Automatisation** : Imports CSV/JSON et Mail Linker (scraping de factures).
- **Projections** : Simulation de projets de vie complexes (immo, retraite).
- **Intelligence Mobile** : Notifications push et conseils d'arbitrage IA.

## User Journeys

### 1. Le Pilote (Johann) - Arbitrage Serein
Johann ouvre l'app le soir. Il voit son RAV dynamique et vide sa pile de transactions prédites (Loyer, Courses) en 3 swipes. Il constate un léger surplus et l'alloue immédiatement à son projet "Voyage Japon", voyant la jauge progresser instantanément.

### 2. Le Co-Pilote - Contribution Flash
Le conjoint reçoit une notification. En un swipe sur son téléphone (via navigateur), il valide ses dépenses du jour. Un message de gratification confirme l'impact positif de ses économies sur le projet familial.

### 3. Gestionnaire Agile
Un utilisateur souhaite isoler ses dépenses "Passion". Il crée la catégorie à la volée, y glisse une transaction ; l'IA apprend instantanément à classer les transactions similaires dans ce nouveau flux.

## Domain & Technical Requirements

### Fintech & Security
- **Consentement Éphémère** : Partage de données valide 24h, nécessitant une ré-acceptation sur le Dashboard.
- **Audit Logging** : Journalisation immuable de l'auteur (`created_by`) pour chaque écrit en BDD.
- **Rigueur Financière** : Calculs précis via types Decimal128 (MongoDB).

### Web App Architecture
- **SPA (Single Page App)** : Navigation fluide sans rechargement.
- **Temps Réel** : Synchronisation instantanée des états entre sessions (Pilote/Co-Pilote).
- **Dark Mode** : Thème sombre par défaut pour l'esthétique "Zen".

## Functional Requirements

### FRs : Capacités Système
- **FR1** : Les utilisateurs peuvent créer et gérer leur compte personnel.
- **FR2** : Les utilisateurs peuvent valider/corriger des transactions via une pile d'attente (Inbox Zero).
- **FR3** : Les utilisateurs peuvent créer/modifier/supprimer librement des catégories.
- **FR4** : Le système prédit automatiquement les transactions récurrentes.
- **FR5** : Les utilisateurs peuvent lier leurs comptes via une demande de partage éphémère (24h).
- **FR6** : Le système calcule le Reste à Vivre (RAV) dynamique en temps réel.
- **FR7** : Le système journalise l'identité de l'auteur pour toute modification en BDD.

## Non-Functional Requirements

### NFRs : Attributs de Qualité
- **NFR1** : Latence d'interaction UI < 100ms pour garantir la fluidité du swipe.
- **NFR2** : Temps de chargement initial du Dashboard < 2s.
- **NFR3** : Disponibilité locale 24/7 sans dépendance cloud tierce pour les données.
- **NFR4** : Interface 100% Responsive (Desktop/Mobile Browser) en Mode Sombre.
