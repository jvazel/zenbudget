# User Story 13.1 : Connexion Bancaire Directe (Open Banking)

## Statut : DONE ✅

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
- [ ] **Contrainte : Solution 100% Gratuit** (Utilisation du tier gratuit Enable Banking).
- [ ] Présence d'un bouton "Connecter ma banque" dans les Paramètres ou l'Inbox.
- [ ] Ouverture d'un tunnel sécurisé (Enable Banking) conforme à la DSP2.
- [ ] L'utilisateur doit pouvoir donner son consentement de manière explicite.

### 2. Sélection & Synchronisation
- [ ] Après connexion, l'utilisateur peut cocher le/les comptes à synchroniser.
- [ ] Premier import automatique de l'historique (30 derniers jours via Enable Banking).
- [ ] Les transactions importées doivent être marquées comme `pending` dans l'Inbox.

### 3. Cycle de Vie
- [ ] Les transactions ne doivent pas être importées en double si elles ont déjà été saisies manuellement (matching date/montant/desc).
- [ ] Les tokens de consentement doivent être gérés (renouvellement requis tous les 90 jours).
- [ ] Possibilité de révoquer l'accès bancaire et de supprimer les données de connexion à tout moment.

---

## 🛡️ Architecture de Sécurité (Sécurité par Design)

Pour garantir la conformité aux normes Enable Banking (DSP2) et assurer la sérénité de l'utilisateur, l'implémentation doit suivre ces règles strictes :

### 1. Gestion des Secrets
- [ ] **Zéro stockage en clair** : L'ID d'application et la **Private Key** (utilisée pour signer les JWT) ne sont jamais présents dans le code source.
- [ ] **Variables d'Environnement** : Utilisation d'un fichier `.env` local (non commité) et configuration des "Secrets" dans le dashboard de production.
- [ ] **Supabase Vault** : Stockage sécurisé des clés et certificats.

### 2. Isolation & Communication
- [ ] **Proxy Backend (Supabase Edge Functions)** : Toutes les requêtes vers l'API Enable Banking sont effectuées côté serveur. Le Frontend ne connaît jamais la clé privée.
- [ ] **Authentification par JWT** : Toutes les requêtes API vers Enable Banking sont authentifiées par un JWT signé par notre clé privée.

---

## 🔄 Flux Technique Détaillé (Enable Banking API)

### Phase 1 : Initialisation
1. **Frontend** : L'utilisateur clique sur "Connecter ma banque".
2. **Edge Function `bank-init`** :
   - Génère un JWT signé avec la clé privée.
   - Liste les institutions (GET `/aspsps`).
   - Renvoie la liste au Frontend.

### Phase 2 : Session & Redirection
1. **Frontend** : L'utilisateur choisit sa banque.
2. **Edge Function `bank-create-session`** :
   - Crée une session d'autorisation (POST `/sessions`).
   - `redirect_url` : `https://zenbudget.app/dashboard?banking_callback=true`
   - Renvoie l'URL de redirection fournie par Enable Banking.

### Phase 3 : Finalisation
1. **Frontend** : Reçoit le code d'autorisation via le callback.
2. **Edge Function `bank-finalize`** :
   - Échange le code contre un `session_id`.
   - Récupère les transactions (GET `/transactions`).
   - **Persistence** : Mappe et stocke les transactions dans ZenBudget.

---

## 🛠️ Notes Techniques Suggérées
- **Agrégateur** : **Enable Banking** est la solution choisie pour sa flexibilité et son mode développeur gratuit.
- **Tables BDD** : Maintenir `bank_connections` et `bank_accounts`.
- **CRON Job** : Sync quotidienne habituelle.
