# Story 10.1 : Calendrier des Échéances

Status: done

## Story

As a user organisé,
I want to see a list or calendar of upcoming recurring transactions,
So that I know exactly when my money will leave my account.

## Acceptance Criteria

1. **Projection à 30 jours** : Le système calcule les dates prévues des transactions basées sur les patterns auto-validés.
2. **Affichage Consolidé** : Une vue dédiée sur le Dashboard liste ces échéances par ordre chronologique.
3. **Détails Pertinents** : Chaque échéance affiche le nom, le montant, la catégorie et le nombre de jours restants (ex: "Dans 5 jours").
4. **Distinction Visuelle** : Les projections sont visuellement distinctes des transactions passées (ex: opacité réduite ou badge "Prévu").

## Tasks / Subtasks

- [x] Créer `projectionService.ts` pour générer les dates futures.
- [x] Développer le composant `UpcomingExpenses.tsx`.
- [x] Intégrer le composant dans `ZenDashboard.tsx`.
- [x] Ajouter des tests unitaires pour la logique de projection.

## Dev Notes

- On utilise les items de `transaction_patterns` où `is_auto_validated` est vrai.
- Pour la date, on peut prendre la date du dernier import correspondant et ajouter 1 mois.
- La projection s'arrête à J+30.
