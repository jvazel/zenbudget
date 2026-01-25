---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ['_bmad-output/analysis/brainstorming-session-2026-01-22.md']
date: 2026-01-22
author: Johann
---

# Product Brief: zenbudget

## Executive Summary

**zenbudget** est une application web et mobile gratuite, conçue spécifiquement pour les familles qui gèrent des comptes bancaires séparés mais partagent des objectifs communs. Contrairement aux applications bancaires classiques qui sont isolées ou aux agrégateurs payants/publicitaires, **zenbudget** se concentre sur l'analyse prédictive et la coordination familiale. L'outil transforme la gestion financière d'une corvée administrative en un système de "coaching zen", aidant les familles à identifier précisément leurs leviers d'épargne et à visualiser en temps réel l'impact de leurs dépenses sur leurs projets de vie.

---

## Core Vision

### Problem Statement

Les familles gérant des comptes séparés souffrent d'une fragmentation de leur vision financière. Chaque parent voit ses propres comptes, mais personne ne voit l'effort d'épargne global ni l'impact combiné des dépenses quotidiennes sur les projets familiaux à long terme. Les solutions actuelles sont soit limitées (apps bancaires sans prédiction), soit contradictoires avec l'objectif d'épargne (modèles payants ou bourrés de publicité).

### Problem Impact

Cette visibilité fragmentée entraîne des opportunités d'épargne manquées, le maintien inconscient de dépenses inutiles et une anxiété quant à la réalisation des projets (vacances, investissements). Sans outils d'analyse "Quand" et "Quoi", la gestion budgétaire reste réactive au lieu d'être proactive.

### Why Existing Solutions Fall Short

- **Apps Bancaires** : Silotées, pas de vision multi-comptes externe, absence d'outils d'analyse prédictive.
- **Agrégateurs Commerciaux (type Finary/Bankin')** : Souvent payants pour les fonctions avancées ou financés par la publicité, ce qui est contre-intuitif pour un utilisateur cherchant à optimiser chaque euro.
- **Fichiers Excel** : Chronophages, difficiles à maintenir à deux, et dépourvus d'intelligence prédictive automatique.

### Proposed Solution

Un outil compagnon qui mise sur une **expérience de saisie "Inbox Zero"** et une **intelligence prédictive des routines**. Le MVP se concentre sur la validation ultra-rapide des transactions récurrentes (loyer, abonnements, habitudes quotidiennes) pour réduire la friction manuelle. L'application offre une **Tour de Contrôle Familiale** où chaque membre garde la main sur ses propres analyses par défaut, avec une option de partage consenti pour visualiser l'effort d'épargne global. L'intelligence artificielle intervient pour suggérer des optimisations concrètes ("Quoi" supprimer) et projeter des dates de réussite ("Quand" le projet sera financé).

### Key Differentiators

- **Coordination Familiale Privacy-First (Comptes Séparés)** : Permet une vision d'épargne commune via un partage de données explicite et consenti, tout en respectant l'intimité de chaque compte individuel.
- **Analyse Prédictive Proactive (MVP Focus)** : Spécialisé dans la détection des routines pour anticiper le "Reste à Vivre" sans dépendre initialement d'API bancaires complexes.
- **Modèle Évolutif** : Initialement gratuit pour un usage personnel et familial, avec une ouverture possible vers des plans Premium si le modèle de coaching prouve sa valeur.
- **Psychologie "Rest & Recovery"** : Un système de coaching qui déculpabilise et encourage la discipline après les périodes de fortes dépenses.

---

## Target Users

### Primary Users

**1. Le Pilote Familial (ex: Johann)**
-   **Profil** : Responsable financier de la famille, technophile, orienté objectifs.
-   **Besoins** : Une vision consolidée sans perte de contrôle, des outils d'analyse pour justifier les arbitrages budgétaires.
-   **Usage** : Rituel quotidien approfondi pour analyser les prédictions et ajuster les projets d'épargne.

**2. Le Co-Pilote Engagé (le conjoint)**
-   **Profil** : Partenaire actif dans la gestion du foyer, souhaite contribuer à l'effort commun tout en gardant son autonomie.
-   **Besoins** : Des indicateurs visuels simples et gratifiants (cercles, jauges), une visibilité claire sur l'impact de ses propres efforts.
-   **Usage** : Micro-validations rapides pour "nettoyer" sa file d'attente de transactions et consulter ses cercles de santé financière.

### User Journey

**1. Découverte & Configuration**
L'utilisateur installe l'app, configure ses comptes MongoDB et définit ses premiers "Projets de Rêve" (ex: "Voyage Japon 2026"). Il invite son conjoint via un lien de partage consenti.

**2. Le Rituel Quotidien (Le Pilote)**
Chaque matin ou soir, le Pilote ouvre l'app. Il voit le **Reste à Vivre Dynamique** mis à jour. L'IA lui propose de valider 3 transactions probables détectées. Il ajuste sa trajectoire d'épargne en fonction des dépenses de la veille.

**3. La Micro-Validation (Le Co-Pilote)**
En recevant une notification (max 1/jour) ou en ouvrant l'app, le Co-Pilote valide ses dépenses "Routines" en quelques swipes. Il voit instantanément son cercle de "Budget Vie" se mettre à jour et son lien avec le projet commun.

**4. Le Moment "Aha!"**
L'utilisateur consulte un objectif d'épargne. L'app lui indique : *"Si tu réduis ton budget 'Restaurants' de 20€ par semaine (Mode Recovery), tu atteindras ton objectif Voyage 2 mois plus tôt"*. La connexion entre discipline immédiate et récompense future devient cristalline.

---

## Success Metrics

### User Success Metrics

-   **Optimisation des Dépenses** : Réduction concrète des dépenses catégorisées comme "inutiles" (ou non-essentielles) mois après mois via les conseils de zenitude.
-   **Croissance du Taux d'Épargne** : Augmentation du pourcentage du revenu total épargné, indépendamment des variations de revenus.
-   **Maîtrise du Reste à Vivre (RAV)** : Capacité des utilisateurs à finir le mois sans dépasser le budget "Vie" grâce à la visualisation quotidienne.

### Business Objectives (Projet Personnel & Familial)

-   **Pérennité de l'Outil (Rétention 6 mois)** : Utilisation continue et engagée de l'application sur une période de 6 mois pour valider que l'outil est devenu un pilier de l'organisation familiale.
-   **Coordination sans Friction** : Adoption d'un rituel de validation (quotidien idéalement, mais flexible) qui ne crée pas de tension entre les conjoints.

### Key Performance Indicators (KPIs)

-   **Dashboard "Zen" Mensuel** :
    -   Somme des recettes vs Somme des dépenses (Balance mensuelle).
    -   **RAV Dynamique** : Montant restant disponible par jour jusqu'à la fin du mois.
    -   **Effort d'Épargne Restant** : Montant calculé par l'IA qu'il reste à épargner pour atteindre l'objectif du mois.
-   **Taux de Discipline** : Ratio entre les dépenses prévues et les dépenses réelles sur les catégories identifiées comme leviers.
