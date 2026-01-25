# Story 6.1: Saisie Manuelle de Transactions

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to manually add a transaction (income or expense),
so that I can keep my budget up to date even for non-automatic entries.

## Acceptance Criteria

1. **Différenciation des Types** : L'utilisateur peut choisir entre "Dépense" et "Revenu".
2. **Formulaire Complet** : La saisie inclut :
   - Le libellé (description).
   - Le montant (positif, le signe est géré par le type).
   - La date (par défaut aujourd'hui).
   - La catégorie (filtrée selon le type choisi).
3. **Persistance BDD** : La transaction est enregistrée dans `public.transactions` avec le statut 'validated'.
4. **Impact UI** : Le dashboard et la ZenGauge se mettent à jour instantanément après l'ajout.

## Tasks / Subtasks

- [x] Migration SQL : Ajouter `type` (text: 'income', 'expense') à la table `categories` (AC: 1, 2)
- [x] Ajouter `createTransaction` au `transactionService.ts` (AC: 3)
- [x] Créer le composant `TransactionModal.tsx` (AC: 1, 2)
  - [x] Gérer le switch Dépense / Revenu.
  - [x] Implémenter le filtrage des catégories par type.
- [x] Ajouter un bouton "+" (FAB) sur le dashboard pour ouvrir le modal.

## Dev Notes

- **Catégories** : Il faudra mettre à jour les catégories existantes pour leur assigner un type par défaut ('expense').
- **Modal** : Utiliser un design glassmorphic cohérent avec le reste de l'app.
- **Validation** : RLS s'applique (Owner only).

### Project Structure Notes

- Le modal peut être partagé ou spécifique au dashboard.

### References

- [Source: request-2026-01-24]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

### File List
- `supabase/migrations/20260124120000_update_categories_type.sql`
- `src/services/transactionService.ts`
- `src/features/dashboard/components/TransactionModal.tsx`
