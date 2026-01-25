# Story 4.3: Suivi d'Audit Partagé

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to see who validated a transaction,
so that we can avoid confusion and double validations.

## Acceptance Criteria

1. **Identification de l'auteur** : Lors de la validation d'une transaction via le swipe, l'ID de l'utilisateur (`auth.uid()`) doit être automatiquement enregistré dans le champ `validated_by` de la table `transactions`.
2. **Badge Visuel** : Si une transaction a été validée par le partenaire, un badge "Validé par [Nom du Partenaire]" (ou simplement "Partner") s'affiche dans l'historique ou le dashboard.
3. **Audit Log immuable** : Les politiques RLS (`Transactions: Update status`) doivent garantir que seul l'auteur de la modification est enregistré, sans possibilité de falsifier le `validated_by`.
4. **Synchronisation Temps-Réel** : L'information de qui a validé la transaction doit être diffusée instantanément aux deux sessions via Supabase Realtime.

## Tasks / Subtasks

- [x] Mettre à jour la logique de validation dans le frontend (AC: 1)
  - [x] S'assurer que l'appel de mise à jour de la transaction inclut explicitement l'ID de l'utilisateur ou est géré via un trigger/default en BDD.
- [x] Modifier les composants de liste/historique pour afficher le badge (AC: 2)
  - [x] Récupérer les profils des utilisateurs pour transformer l'ID `validated_by` en nom lisible si possible.
- [x] Valider l'audit en base de données (AC: 3)
  - [x] Vérifier que `validated_by` est correctement renseigné pour les transactions validées.
- [x] Tester la diffusion Realtime (AC: 4)
  - [x] Vérifier que le partenaire voit le badge instantanément.

## Dev Notes

- **Schéma BDD** : La table `public.transactions` possède déjà la colonne `validated_by uuid REFERENCES public.profiles(id)`.
- **Politiques RLS** : Déjà existantes pour l'update, mais vérifier si une contrainte sur `validated_by` doit être ajoutée pour la sécurité.
- **Profils** : Utiliser la table `profiles` pour faire la jointure et afficher le nom.

### Project Structure Notes

- Prioriser l'affichage du badge dans les composants de liste de transactions (Dashboard ou History).

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story 4.3]
- [Source: supabase/migrations/20260122000000_initial_schema.sql]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Gemini 2.0 Flash)

### Debug Log References
- ✅ Fixed: Replaced "Partner" badge with real partner name in ZenDashboard.tsx.
- ✅ Fixed: Dynamic calculation of summary totals in Dashboard.

### Completion Notes List
- Real-time audit tracking active.
- Partner identity displayed in dashboard activity.
### File List
- `src/features/inbox/hooks/useTransactions.ts` (ou équivalent pour l'update)
- `src/features/dashboard/components/TransactionItem.tsx` (ou équivalent pour l'affichage)
