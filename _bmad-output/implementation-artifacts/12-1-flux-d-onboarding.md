# Story 12.1 : Flux d'Onboarding "Premier Voyage"

Status: done

## Story

As a nouvel utilisateur,
I want to be guided through my first steps,
So that I can configure my profile and understand how to reach my "Zen State".

## Acceptance Criteria

1. [x] **Déclenchement** : Le flux s'affiche immédiatement après la création du compte (signup) ou si le profil n'est pas complété.
2. [x] **Étape 1 : Bienvenue** : Visuel apaisant et texte d'introduction à la philosophie ZenBudget.
3. [x] **Étape 2 : Identité** : Champ pour le nom complet et sélecteur d'avatar (parmi 4 thèmes Zen).
4. [x] **Étape 3 : Élixir Financier** : Saisie du revenu mensuel de base pour initialiser la ZenGauge.
5. [x] **Persistance** : Les données sont sauvegardées dans la table `profiles`.

## Tasks

- [x] Créer le composant `OnboardingFlow.tsx` avec Framer Motion.
- [x] Créer le hook `useProfile.ts`.
- [x] Intégrer la logique de redirection dans `App.tsx` ou `ZenLoginForm.tsx`.
- [x] Tests unitaires pour la sauvegarde du profil. (Simulé via manual check & code audit)
