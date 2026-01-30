# Story 9.1: Import de transactions (CSV/JSON)

Status: done

## Story

As a user,
I want to import a file from my bank,
So that my inbox is automatically populated with my actual expenses without manual entry.

## Acceptance Criteria

1. **Sélecteur de Fichier** : Un bouton "Importer" dans l'Inbox ouvre un sélecteur de fichier (format .csv ou .json).
2. **Parsing Flexible** : Le système reconnaît les formats standards (Date, Label, Montant) et permet de mapper les colonnes si nécessaire (MVP: mapping par défaut).
3. **Détection de Doublons** : [IMPORTANT] Les transactions identiques (même date, description et montant) déjà présentes ne sont pas importées.
4. **Intégration Inbox** : Les transactions importées apparaissent en statut `pending` dans la pile de cartes.
5. **Gratification** : Une micro-animation "Zen" confirme le nombre de transactions importées avec succès.

## Tasks / Subtasks

- [ ] Créer le service `importService` pour gérer le parsing CSV.
- [ ] Implémenter la logique de déduplication dans `transactionService`.
- [ ] Ajouter un bouton d'import discret dans le header de l'Inbox.
- [ ] Gérer l'état de chargement et le feedback visuel.
- [ ] Écrire des tests unitaires pour le parser (cas nominaux et erreurs).

## Dev Notes

- Utiliser la bibliothèque `papaparse` pour le parsing CSV (si disponible) ou une implémentation légère.
- Les transactions importées doivent être liées à l'utilisateur courant et au compte par défaut.
- Attention aux formats de date (DD/MM/YYYY vs YYYY-MM-DD).
