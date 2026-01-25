# Story 7.1 : Analyse Zen

> [!NOTE]
> Cette story introduit des fonctionnalités d'analyse bienveillante pour aider l'utilisateur à comprendre ses habitudes sans jugement.

## User Story 1 : Comparateur Temporel Zen (Le Voyage dans le Temps)

**En tant que** "Zen Master" de mon budget,
**Je veux** visualiser une comparaison de mon mois actuel par rapport à une "moyenne idéale" de mes mois précédents,
**Afin de** savoir instantanément si je suis dans mon "rythme de croisière" ou si je dérive, sans avoir à analyser des tableaux complexes.

### Critères d'Acceptation
- [ ] **Graphique de Comparaison** :
    - Afficher une courbe ou une ligne représentant les dépenses cumulées du mois en cours.
    - Superposer une courbe "Fantôme" ou "Guide" représentant la moyenne des 3 meilleurs mois (ou une moyenne lissée) des 6 derniers mois.
    - La courbe actuelle doit être d'une couleur apaisante (ex: cyan/vert) si elle est en dessous ou proche du guide, et changer subtilement (ex: orange doux) si elle s'en écarte significativement.
- [ ] **Indicateur de Rythme** :
    - Un message textuel simple accompagne le graphique (ex: "Vous voyagez léger ce mois-ci", "Un peu de turbulence détectée").
- [ ] **Filtrage Simple** :
    - Possibilité d'exclure les dépenses exceptionnelles (hors budget mensuel) du calcul pour ne pas fausser le "rythme".

---

## User Story 2 : Top "Fuites d'Énergie"

**En tant que** utilisateur conscient,
**Je veux** identifier les petites dépenses récurrentes qui drainent mon budget silencieusement,
**Afin de** pouvoir choisir de les "colmater" (annuler/réduire) ou de les accepter pleinement.

### Critères d'Acceptation
- [ ] **Détection des Récurrences** :
    - Le système analyse les transactions pour identifier les montants identiques ou similaires débités régulièrement (abonnements, frais bancaires, cafés quotidiens).
- [ ] **Présentation Visuelle** :
    - Afficher une liste "Top 3" ou "Top 5" de ces dépenses sous forme de "Tuiles de Fuite".
    - Chaque tuile montre : le nom probable (ex: "Netflix", "Spotify", "Frais Tenue Compte"), le montant mensuel, et le montant annuel cumulé (Impact Annuel).
- [ ] **Action "Colmater"** :
    - Un bouton ou une interaction sur la tuile permet de marquer la dépense comme "À revoir" ou "Vérifiée".
    - Si "À revoir", cela pourrait créer une tâche ou un rappel (optionnel pour cette itération).

## User Story 3 : Évolution des Catégories (Le Fleuve des Flux)

**En tant que** analyste de ma propre vie,
**Je veux** voir comment mes catégories de dépenses ou de recettes évoluent mois après mois,
**Afin de** comprendre les tendances saisonnières ou les changements de mode de vie.

### Critères d'Acceptation
- [ ] **Graphique d'Évolution** :
    - Un graphique (Ligne ou Aires empilées) montrant les 6 derniers mois.
    - Possibilité de basculer entre **Recettes** et **Dépenses**.
    - Affichage des catégories principales (Top 5) avec une couleur distincte, les autres regroupées en "Autres".
- [ ] **Interaction** :
    - Au survol d'un mois, afficher le détail (montant pour chaque catégorie visible).
- [ ] **Esthétique Zen** :
    - Utiliser des courbes douces (type "monotone" ou "natural") pour évoquer un fleuve plutôt que des barres rigides.

---

## Données Techniques
- **Backend** : Nécessite une fonction SQL ou un service pour l'agrégation des données historiques et la détection de patterns.
- **Frontend** : Composants Recharts ou visuels SVG custom pour le comparateur. Glassmorphism pour les tuiles.
