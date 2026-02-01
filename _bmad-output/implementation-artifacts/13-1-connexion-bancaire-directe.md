# User Story 13.1 : Connexion Bancaire Directe (Open Banking)

## Statut : BACKLOG 🔴

## Description
**En tant qu'** utilisateur soucieux de son temps,
**Je souhaite** connecter mon compte bancaire directement à ZenBudget,
**Afin que** mes transactions soient synchronisées automatiquement sans aucun import manuel.

---

## 🧘 Valeur Zen
Supprimer la corvée de l'import de fichiers CSV/JSON pour se concentrer uniquement sur le rituel de validation (Inbox Zero). La donnée vient à l'utilisateur, fluide et sans effort.

---

## ✅ Critères d'Acceptation

### 1. Tunnel de Connexion (Auth)
- [ ] **Contrainte : Solution 100% Gratuit** (Utilisation obligatoire du tier gratuit de GoCardless Bank Data).
- [ ] Présence d'un bouton "Connecter ma banque" dans les Paramètres ou l'Inbox.
- [ ] Ouverture d'un tunnel sécurisé (GoCardless/Nordigen) conforme à la DSP2.
- [ ] L'utilisateur doit pouvoir donner son consentement de manière explicite.

### 2. Sélection & Synchronisation
- [ ] Après connexion, l'utilisateur peut cocher le/les comptes à synchroniser.
- [ ] Premier import automatique de l'historique (30 derniers jours via le tier gratuit GoCardless).
- [ ] Les transactions importées doivent être marquées comme `pending` dans l'Inbox.

### 3. Cycle de Vie
- [ ] Les transactions ne doivent pas être importées en double si elles ont déjà été saisies manuellement (matching date/montant/desc).
- [ ] Les tokens de consentement doivent être gérés (renouvellement requis tous les 90 jours).
- [ ] Possibilité de révoquer l'accès bancaire et de supprimer les données de connexion à tout moment.

---

## �️ Architecture de Sécurité (Sécurité par Design)

Pour garantir la conformité aux normes GoCardless (DSP2) et assurer la sérénité de l'utilisateur, l'implémentation doit suivre ces règles strictes :

### 1. Gestion des Secrets
- [ ] **Zéro stockage en clair** : Les API Keys de GoCardless (`SECRET_ID`, `SECRET_KEY`) ne sont jamais présentes dans le code source.
- [ ] **Variables d'Environnement** : Utilisation d'un fichier `.env` local (non commité) et configuration des "Secrets" dans le dashboard de production.
- [ ] **Supabase Vault** : Les tokens d'accès et de rafraîchissement (OAuth) doivent être stockés dans le coffre-fort `vault.secrets` de Supabase ou encryptés via `pgsodium`.

### 2. Cryptage des Données Sensibles
- [ ] **Cryptage au repos** : Les IDs de compte bancaire réels (IBAN/Account ID externes) doivent être cryptés en base de données (ex: AES-GCM) avant stockage.
- [ ] **Anonymisation** : ZenBudget ne stocke que les 4 derniers chiffres du compte pour l'affichage UI si l'IBAN n'est pas nécessaire.

### 3. Isolation & Communication
- [ ] **Proxy Backend (Supabase Edge Functions)** : Toutes les requêtes vers l'API GoCardless sont effectuées côté serveur via une Edge Function. Le Frontend ne connaît jamais les clés API.
- [ ] **Mise en cache sécurisée** : Les transactions bancaires brutes récupérées sont traitées en mémoire et transformées en format "Transaction ZenBudget" avant d'être persistées.

---

## 🔄 Flux Technique Détaillé (GoCardless Bank Data API V2)

### Phase 1 : Initialisation de la Session
1. **Frontend** : L'utilisateur clique sur "Connecter ma banque".
2. **Edge Function `bank-init`** :
   - Récupère un `AccessToken` GoCardless (via POST `/api/v2/token/new/`).
   - Liste les institutions (banques) disponibles.
   - Renvoie la liste au Frontend.

### Phase 2 : Consentement & Requisition
1. **Frontend** : L'utilisateur choisit sa banque.
2. **Edge Function `bank-create-link`** :
   - Crée une `Agreement` (durée max 90 jours, historique 30 jours).
   - Crée une `Requisition` (POST `/api/v2/requisitions/`) avec :
     - `redirect_url` : `https://zenbudget.app/dashboard?banking_callback=true`
     - `reference` : Un ID de session unique (UUID) lié à l'utilisateur.
   - Renvoie le lien `link` vers le tunnel bancaire.

### Phase 3 : Authentification Bancaire
1. **Utilisateur** : Est redirigé vers l'interface sécurisée de sa propre banque.
2. **Validation** : L'utilisateur autorise l'accès.
3. **Banque** : Redirige vers ZenBudget avec les paramètres `ref` et `id` (Requisition ID).

### Phase 4 : Finalisation & Synchronisation
1. **Frontend** : Détecte le paramètre `banking_callback` et appelle l'Edge Function `bank-finalize`.
2. **Edge Function `bank-finalize`** :
   - Vérifie le statut de la requisition (GET `/api/v2/requisitions/{id}/`).
   - Si `LN` (Linked) : Récupère la liste des comptes associés (GET `/api/v2/accounts/`).
   - Récupère les transactions pour chaque compte (GET `/api/v2/accounts/{acc_id}/transactions/`).
   - **Transformation** : Mappe les champs GoCardless (`bookingDate`, `remittanceInformationUnstructured`, `transactionAmount`) vers le schéma `Transaction` de ZenBudget.
   - **Persistence** : Stocke les transactions dans la table `transactions` avec l'ID du compte bancaire lié.

---

## 🛠️ Notes Techniques Suggérées
- **Agrégateur** : **GoCardless (ex-Nordigen)** est la solution recommandée car elle offre un accès gratuit illimité aux données de compte (AIS) en Europe via la DSP2.
- **Tables BDD à créer** :
  - `bank_connections` : `id`, `user_id`, `requisition_id`, `institution_id`, `status`.
  - `bank_accounts` : `id`, `connection_id`, `external_id`, `mask` (last 4), `currency`.
- **CRON Job** : Mettre en place une Supabase Edge Function planifiée toutes les 24h pour rafraîchir les transactions automatiquement.
