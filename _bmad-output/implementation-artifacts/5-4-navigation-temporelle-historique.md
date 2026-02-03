# Story 5.4: Navigation Temporelle & Historique

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to navigate between months using arrows or a dropdown,
so that I can consult past budgets with my preference remembered by the system.

## Acceptance Criteria

1. **Navigation par flèches** : [x] L'utilisateur peut passer au mois précédent ou suivant via les boutons ChevronLeft/ChevronRight.
2. **Sélecteur de mois (Sélecteur)** : [x] Un menu déroulant permet de choisir directement un mois spécifique de l'année en cours.
3. **Persistance de la session** : [x] Le mois sélectionné est conservé même après le rafraîchissement de la page (utilisation du `persist` middleware).
4. **Retour au présent** : [x] Un bouton "Aujourd'hui" apparaît si l'utilisateur consulte un autre mois que le mois courant, permettant un retour rapide.

## Tasks / Subtasks

- [x] Créer `useDateStore.ts` avec Zustand et persist middleware (AC: 3)
- [x] Implémenter le sélecteur de mois dans `ZenDashboard.tsx` (AC: 1, 2)
- [x] Gérer l'affichage conditionnel du bouton "Aujourd'hui" (AC: 4)
- [x] Synchroniser les appels API (`loadDashboardData`) avec le changement de date (AC: 1, 2)

## Dev Notes

- **Store** : `src/stores/useDateStore.ts`.
- **Composant** : `src/features/dashboard/components/ZenDashboard.tsx`.
- **State Management** : Utilisation de `zustand/middleware` pour la persistance locale (`zen-date-store`).
- **UX** : Animation de transition douce lors du changement de mois via Framer Motion.

### Project Structure Notes

- La date sélectionnée est globale à l'application pour permettre une cohérence entre les différents onglets (Dashboard, Analyse, etc.).

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story 5.4]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

### File List
- `src/stores/useDateStore.ts`
- `src/features/dashboard/components/ZenDashboard.tsx`
