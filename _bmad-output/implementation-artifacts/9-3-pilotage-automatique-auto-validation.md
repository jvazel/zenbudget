# Story 9.3 : Pilotage Automatique (Auto-validation)

Status: done

## Story

As a "Zen Master" confiant,
I want to mark recurring transactions to be validated automatically,
So that I don't have to swipe for my rent and fixed subscriptions every month.

## Acceptance Criteria

1. **Option "Toujours Valider"** : Lors de la validation d'une transaction dans l'Inbox, un bouton ou un toggle permet de marquer cette description pour une auto-validation future.
2. **Reconnaissance Intelligente** : Les transactions importées dont la description et le montant correspondent à un pattern "auto-validé" sont marquées comme `validated` immédiatement.
3. **Notification de Sérénité** : Les transactions auto-validées apparaissent brièvement dans l'Inbox (ou via un toast) pour informer l'utilisateur : "3 transactions (Loyer, Salaire...) ont été validées pour vous".
4. **Gestion des Patterns** : Possibilité de désactiver l'auto-validation dans l'onglet Setup.

## Tasks / Subtasks

- [ ] Enrichir le schéma `patterns` (ou `auto_validations`) pour inclure le flag `is_auto_validated`.
- [ ] Méta-logique dans `transactionService.ts` : Lors d'un import, vérifier les patterns d'auto-validation.
- [ ] Ajouter une option "Récurrent ? Auto-valider" dans la `TransactionCard` (ou post-swipe).
- [ ] Implémenter le feedback visuel pour les transactions auto-validées.
- [ ] Tests unitaires sur le moteur de matching et d'auto-validation.

## Dev Notes

- On peut réutiliser le `patternService` existant en ajoutant une colonne `auto_validate` à la table `patterns`.
- Le matching doit être strict sur la description (ou regex simplifiée) et optionnellement sur le montant (+/- 1% pour gérer les centimes de frais).
