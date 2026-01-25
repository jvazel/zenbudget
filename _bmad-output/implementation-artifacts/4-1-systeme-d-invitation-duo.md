# Story 4.1: Système d'Invitation Duo

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to generate a temporary invitation link,
so that I can invite my partner to co-pilot our budget.

## Acceptance Criteria

1. **Génération du Token** : En cliquant sur "Inviter un Partenaire", un token unique et sécurisé (ex: alphanumeric string) est généré.
2. **Date d'expiration** : Le token doit avoir une date d'expiration fixée à 24h après sa création.
3. **Persistance BDD** : Le token, l'owner_id et la date d'expiration sont enregistrés dans la table `sharing_access` avec le statut 'active'.
4. **Lien de partage** : L'utilisateur peut copier un lien ou le code pour le partager avec son partenaire.
5. **Feedback UI** : Une notification de succès ou un changement d'état visuel confirme la création de l'invitation.

## Tasks / Subtasks

- [x] Valider l'implémentation de `sharingService.createInviteToken()` (AC: 1, 2, 3)
  - [x] S'assurer que le token est suffisamment robuste (random string).
  - [x] Vérifier que l'expiration est bien de 24h.
- [x] Connecter le composant `PartnerInvite.tsx` au service (AC: 4, 5)
  - [x] Gérer l'état de chargement pendant la création.
  - [x] Afficher le token généré et permettre la copie.
- [x] Vérifier les politiques RLS pour l'insertion dans `sharing_access` (AC: 3)
  - [x] L'utilisateur ne peut insérer que pour lui-même (`owner_id = auth.uid()`).

## Dev Notes

- **Composant existant** : `src/features/sharing/components/PartnerInvite.tsx` (UI déjà esquissée).
- **Service existant** : `src/services/sharingService.ts`.
- **Base de données** : Table `sharing_access` (définie dans `initial_schema.sql`).
- **Sécurité** : Utiliser `supabase.auth.getUser()` pour récupérer l'ID de l'utilisateur.

### Project Structure Notes

- Le code de partage doit rester dans `src/features/sharing/`.
- Suivre les patterns de naming `camelCase` pour les fonctions et `PascalCase` pour les composants React.

### References

- [Source: _bmad-output/planning-artifacts/epics-and-stories.md#Story 4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: supabase/migrations/20260122000000_initial_schema.sql]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Gemini 2.0 Flash)

### Debug Log References
- ✅ Fixed: Missing UI error handling in PartnerInvite.tsx
- ✅ Fixed: Improved Join feedback in sharingService.ts

### Completion Notes List
- Invitation system fully functional.
- Duo session reset to 24h on join.
- Partner identity tracked via `validated_by`.
### File List
- `src/features/sharing/components/PartnerInvite.tsx`
- `src/services/sharing/sharingService.ts`
