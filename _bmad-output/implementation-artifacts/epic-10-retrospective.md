# Rétrospective : Épique 10 - ZenVision

**Date :** 2026-02-03
**Projet :** zenbudget
**Épique :** 10 (ZenVision - La Clairvoyance Financière)
**Statut :** Terminée

## 📊 Résumé de la livraison
L'Épique 10 a étendu la vision du Dashboard vers le futur, en introduisant les projections de solde et les alertes de sécurité financière.

## ✅ Ce qui s'est bien passé
- **Calendrier des échéances :** La visibilité sur les 30 prochains jours réduit considérablement l'anxiété liée aux factures récurrentes.
- **Alertes "ZenDanger" :** Le système de détection de solde négatif prévisionnel fonctionne bien et prévient efficacement le dépassement.

## ⚠️ Défis et Apprentissages
- **Précision des projections :** Les projections dépendent fortement de la qualité des patterns identifiés par l'IA (Épique 2). Une désynchronisation peut fausser le solde prévisionnel.
- **Complexité visuelle :** L'ajout de courbes en pointillés sur le graphique de solde nécessite une attention particulière pour ne pas surcharger l'UI.

## 🚀 Actions pour la suite
1. **[DEV]** Affiner le lien entre le moteur de routine IA et le `projectionService`.
2. **[PO]** Intégrer des conseils "Zen" lors des alertes anti-découvert pour aider l'utilisateur à réajuster son budget.

---
*Facilité par Bob (Scrum Master)*
