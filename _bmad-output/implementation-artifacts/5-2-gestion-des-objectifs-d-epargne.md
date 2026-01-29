# Story 5.2: Gestion des Objectifs d'Épargne

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to create saving projects and see their visual progress,
so that I can stay motivated to achieve my financial goals.

## Acceptance Criteria

1. **Persistance en BDD** : Les projets d'épargne doivent être enregistrés dans une nouvelle table `savings_goals` (id, title, target_amount, current_amount, category, owner_id).
2. **Visualisation Dynamique** : Les `ProjectCard` du Dashboard doivent afficher les données réelles de la base de données au lieu des valeurs statiques.
3. **Impact sur le RAV** : Le montant total à épargner ce mois-ci (si défini comme un flux mensuel) doit être déduit du calcul du Reste à Vivre (Story 5.1).
4. **Action "Alimenter"** : Cliquer sur "Alimenter le projet" ouvre une modale ou permet d'ajouter un montant qui incrémente `current_amount` et crée une transaction de type 'savings'.

## Tasks / Subtasks

- [x] Créer la migration SQL pour `public.savings_goals` (AC: 1)
  - [x] Activer le RLS (Owner only + Partner view).
- [x] Créer `src/services/savingsService.ts` (AC: 2)
  - [x] Implémenter le fetch des projets et l'update du montant.
- [x] Connecter `ProjectCard` aux données réelles dans `ZenDashboard.tsx` (AC: 2)
- [x] Intégrer l'épargne dans le calcul du RAV (AC: 3)

## Dev Notes

- **Composant** : `src/features/dashboard/components/ProjectCard.tsx`.
- **Trigger** : On pourrait imaginer un trigger SQL ou une fonction service qui synchronise les virements vers l'épargne avec les transactions.
- **RLS** : Même logique que pour les comptes (Shared during 24h).

### Project Structure Notes

- Gérer les icônes de projets de manière dynamique (lucide mapping).

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story 5.2]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

### File List
- `supabase/migrations/20260124115000_add_savings_goals.sql`
- `src/services/savingsService.ts`
- `src/services/savingsService.test.ts`
- `src/features/dashboard/components/ProjectCard.tsx`
- `src/features/dashboard/components/ProjectCard.test.tsx`
