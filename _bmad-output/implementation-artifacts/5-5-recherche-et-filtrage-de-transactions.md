# Story 5.5: Recherche et filtrage de transactions

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to search transactions by description or filter by category,
so that I can quickly find specific expenses or incomes in my history.

## Acceptance Criteria

1. **Recherche textuelle** : [x] Un champ de recherche permet de filtrer la liste des transactions en temps réel par description.
2. **Filtrage par catégorie** : [x] Un menu de sélection permet de filtrer la liste par une ou plusieurs catégories.
3. **Réinitialisation** : [x] Un bouton "Effacer les filtres" (Clear Filters) apparaît lorsqu'un filtre est actif et permet de réinitialiser la vue.
4. **Performance** : [x] Le filtrage doit être perçu comme instantané (< 100ms).

## Tasks / Subtasks

- [x] Préparer l'état local pour la recherche et le filtrage (AC: 1, 2)
  - [x] Ajouter les états `searchQuery` et `selectedCategories` dans le store ou le composant
- [x] Implémenter l'interface de recherche et filtrage (AC: 1, 2)
  - [x] Ajouter un composant `Input` pour la recherche dans `ZenDashboard`
  - [x] Ajouter un composant `Popover` ou `Dropdown` pour le choix des catégories
- [x] Implémenter la logique de filtrage (AC: 1, 2)
  - [x] Filtrer le tableau des transactions en fonction de la description (insensible à la casse)
  - [x] Filtrer le tableau en fonction des catégories sélectionnées
- [x] Ajouter le bouton de réinitialisation (AC: 3)
  - [x] Afficher le bouton "Effacer" si `searchQuery` n'est pas vide ou si des catégories sont sélectionnées
- [x] Vérifier et tester (AC: 4)
  - [x] Écrire un test unitaire pour la logique de filtrage
  - [x] Vérifier la réactivité de l'UI avec Framer Motion

## Dev Notes

- **Composants à modifier** : `src/features/dashboard/components/ZenDashboard.tsx`
- **Design System** : Utiliser les primitives `shadcn/ui` (Input, Popover, Checkbox).
- **Style** : Respecter le thème "Ocean Calm" (Glassmorphism, accents Cyan).
- **State** : Utiliser `TanStack Query` pour les données et `useState` ou `Zustand` pour les filtres.

### Project Structure Notes

- Le dashboard centralise actuellement beaucoup de logique ; envisager de créer un sous-composant `TransactionFilters.tsx` si possible.

### References

- [Source: _bmad-output/planning-artifacts/prd.md#FRs]
- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story-5.5]

## Dev Agent Record

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Debug Log References

### Completion Notes List

### File List
