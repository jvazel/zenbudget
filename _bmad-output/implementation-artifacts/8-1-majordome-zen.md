# Story 8.1 : Le Majordome Zen (Auto-apprentissage)

> [!NOTE]
> Cette story vise à réduire la charge mentale du tri quotidien en apprenant des habitudes de l'utilisateur.

## User Story 1 : Mémoire des Habitudes

**En tant que** utilisateur régulier,
**Je veux** que l'application se souvienne comment je classe mes transactions habituelles (ex: "Monoprix" -> "Alimentation"),
**Afin de** ne pas avoir à réfléchir pour les dépenses récurrentes.

### Critères d'Acceptation
- [ ] **Apprentissage au fil de l'eau** :
    - À chaque validation manuelle d'une transaction, le système enregistre l'association `(Description, Catégorie)`.
    - Si l'utilisateur change une catégorie pré-définie, la nouvelle association devient prioritaire.
- [ ] **Table de Correspondance** :
    - Stocker ces règles (ex: table `transaction_patterns` ou simple apprentissage local pour commencer).

---

## User Story 2 : Suggestion Intelligente

**En tant que** utilisateur pressé,
**Je veux** que les nouvelles transactions entrantes soient pré-catégorisées selon mes habitudes passées,
**Afin de** n'avoir plus qu'à "Swiper" pour valider sans changer la catégorie.

### Critères d'Acceptation
- [ ] **Moteur de Suggestion** :
    - Lors de l'import (ou génération mock) d'une transaction, vérifier si une règle existe pour cette description (ou un préfixe similaire).
    - Si oui, assigner automatiquement la catégorie et l'icône correspondantes.
    - L'indicateur de catégorie doit montrer visuellement que c'est une "Suggestion Zen" (ex: petite icône étincelle).

---

## User Story 3 : Pilotage Automatique (Optionnel - Future itération)

**En tant que** "Zen Master" confiant,
**Je veux** pouvoir marquer certaines règles comme "Toujours valider automatiquement",
**Afin que** les dépenses fixes (Loyer, Abonnement Internet) soient traitées sans aucune action de ma part.

### Critères d'Acceptation
- [ ] **Flag Auto-Validate** :
    - Une option dans les détails d'une transaction pour "Toujours valider ce type de dépense".

## Données Techniques
- **Backend** : Table `transaction_rules` (user_id, pattern_text, category_id, auto_validate).
- **Logique** : String matching simple ou Fuzzy search (si possible) sur le début de la description.
