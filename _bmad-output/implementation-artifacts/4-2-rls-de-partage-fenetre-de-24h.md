# Story 4.2: RLS de Partage (Fenêtre de 24h)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system,
I want to strictly limit partner access to a 24-hour window after acceptance,
so that privacy is preserved unless explicitly shared.

## Acceptance Criteria

1. **Déclenchement du délai** : Le délai de 24h doit commencer *au moment de l'acceptation* par le partenaire (joinSession), et non à la création du token.
2. **Mise à jour du service** : `sharingService.joinSession()` doit mettre à jour `expires_at` à `now() + 24h`.
3. **Efficacité RLS** : Les politiques RLS sur les tables `accounts` et `transactions` doivent filtrer dynamiquement les données si `expires_at < now()`.
4. **Ré-invitation** : Une fois les 24h passées, le partenaire ne doit voir aucun compte ou transaction de l'owner, même s'il actualise la page.

## Tasks / Subtasks

- [x] Modifier `sharingService.joinSession()` (AC: 1, 2)
  - [x] Ajouter la mise à jour de `expires_at` lors de l'enregistrement du `partner_id`.
- [x] Auditer et tester les politiques RLS existantes (AC: 3)
  - [x] Vérifier que `expires_at > now()` est présent dans toutes les politiques de partage (`accounts`, `transactions`).
- [x] Créer une vue ou un test de "revocation automatique" (AC: 4)
  - [x] Simuler une expiration en BDD et vérifier que l'accès est immédiatement coupé.

## Dev Notes

- **Service** : `src/services/sharingService.ts`.
- **Migrations SQL** : 
    - `20260122000001_sharing_policies.sql` contient déjà les bases.
    - `20260124113500_sharing_access_rls.sql` gère les droits sur la table pivot.
- **Prudence** : S'assurer que le statut 'active' est toujours vérifié en plus de la date.

### Project Structure Notes

- Respecter le pattern `supabase.from('sharing_access').update({...})`.

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story 4.2]
- [Source: supabase/migrations/20260122000001_sharing_policies.sql]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Gemini 2.0 Flash)

### Debug Log References
- ✅ Verified: RLS policies correctly filter by `expires_at > now()`.

### Completion Notes List
- 24h window reset successfully implemented in `sharingService.joinSession`.

### File List
- `src/services/sharingService.ts`
- `supabase/migrations/20260122000001_sharing_policies.sql`
