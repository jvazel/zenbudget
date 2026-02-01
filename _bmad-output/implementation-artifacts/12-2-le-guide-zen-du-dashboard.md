# Story 12.2 : Le Guide Zen du Dashboard

Status: done

## Story

As a nouvel utilisateur,
I want to see helpful tips on the dashboard,
So that I can master the "Swipe" and understand what my ZenGauge represents.

## Acceptance Criteria

1. [x] **Visibilité** : Un bandeau ou popover discret s'affiche uniquement si l'utilisateur a moins de 5 transactions validées.
2. [x] **Conseils Dynamiques** : 
   - "Swippez à droite pour valider la sérénité."
   - "Votre ZenGauge montre votre Reste à Vivre réel."
3. [x] **Dismissal** : L'utilisateur peut fermer le guide définitivement. (Flag `guide_dismissed` en base).

## Tasks

- [x] Créer le composant `ZenGuide.tsx`.
- [x] Ajouter la logique de condition d'affichage basée sur le nombre de transactions.
- [x] Intégrer dans `ZenDashboard.tsx`.
