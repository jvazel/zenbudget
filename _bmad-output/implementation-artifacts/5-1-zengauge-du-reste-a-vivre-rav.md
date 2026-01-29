# Story 5.1: ZenGauge du Reste à Vivre (RAV)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want a circular gauge showing my monthly "Safe-to-Spend" amount,
so that I can feel calm knowing exactly what's left for the month.

## Acceptance Criteria

1. **Calcul Dynamique du RAV** : Le Reste à Vivre doit être calculé comme suit : `(Revenus du mois) - (Dépenses validées du mois) - (Objectifs d'épargne)`.
2. **Visualisation ZenGauge** : La gauge centrale doit afficher le RAV en euros et la progression circulaire par rapport au budget total disponible.
3. **Transition de Couleur** : La couleur de la gauge doit passer de Cyan/Gris (serein) à Orange/Rouge si le RAV devient critique (< 10% du budget).
4. **Chargement Realtime** : La gauge doit se mettre à jour instantanément lorsqu'une transaction est validée par l'un des partenaires.

## Tasks / Subtasks

- [x] Implémenter la logique de calcul du RAV dans `transactionService.ts` (AC: 1)
  - [x] Calculer les revenus totaux du mois courant.
  - [x] Soustraire les dépenses validées.
- [x] Connecter `ZenDashboard.tsx` à la nouvelle logique de calcul (AC: 2, 4)
  - [x] S'assurer que le Realtime rafraîchit la ZenGauge.
- [x] Mettre à jour `ZenGauge.tsx` pour gérer les états critiques (AC: 3)
  - [x] Ajouter une prop ou un état pour changer les couleurs du gradient.

## Dev Notes

- **Composant** : `src/features/dashboard/components/ZenGauge.tsx`.
- **Dashboard** : `src/features/dashboard/components/ZenDashboard.tsx`.
- **Service** : `src/services/transactionService.ts`.
- **Design** : Utiliser les tokens HSL pour les transitions de couleurs fluides.

### Project Structure Notes

- Le calcul du RAV doit être centralisé pour être réutilisé sur mobile plus tard.

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story 5.1]
- [Source: project-context.md#Vision & Essence]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

### File List
- `src/features/dashboard/components/ZenGauge.tsx`
- `src/features/dashboard/components/ZenDashboard.tsx`
- `src/services/transactionService.ts`
- `src/features/dashboard/components/ZenGauge.test.tsx`
- `src/services/transactionService.test.ts`
- `src/test/setup.ts`
