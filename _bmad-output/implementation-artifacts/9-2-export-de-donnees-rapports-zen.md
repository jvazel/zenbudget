# Story 9.2 : Export de Données & Rapports Zen

Status: done

## Story

As a user,
I want to export my validated transactions in CSV format,
So that I can archive my data or share it with my accountant.

## Acceptance Criteria

1. **Bouton d'Export** : Un bouton "Exporter (CSV)" est accessible depuis l'onglet "Setup" ou directement sur le Dashboard.
2. **Sélecteur de Période** : L'export contient par défaut les transactions du mois en cours, avec une option pour tout exporter.
3. **Format CSV Zen** : Le fichier généré doit être propre (UTF-8, séparateurs standards) et inclure : Date, Description, Montant, Catégorie.
4. **Download Instantané** : Le téléchargement commence immédiatement après le clic, sans rechargement de page.

## Tasks / Subtasks

- [ ] Créer le service `exportService.ts` pour la génération du CSV.
- [ ] Ajouter la méthode `getExportData` dans `transactionService.ts` pour récupérer les données formatées.
- [ ] Ajouter le bouton d'export dans l'interface (Dashboard ou Setup).
- [ ] Gérer le déclenchement du téléchargement navigateur.
- [ ] Écrire un test unitaire pour vérifier la structure du CSV généré.

## Dev Notes

- Utiliser la capacité native du navigateur (`Blob` et l'attribut `download`) pour éviter toute dépendance lourde.
- Attention à l'encodage des caractères spéciaux (accents) pour une compatibilité Excel optimale.
