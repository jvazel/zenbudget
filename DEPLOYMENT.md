# 🚀 Guide de Mise en Production : ZenBudget

Ce guide vous accompagne pas à pas pour passer de votre machine locale à une application accessible par tous (et installable sur mobile).

---

## 🏗️ Étape 1 : Préparer Supabase (Le Cœur)

Votre base de données et votre authentification doivent être prêtes pour la prod.

### 1.1 Appliquer les Migrations
Si vous avez fait des modifications locales, assurez-vous que votre projet Supabase en ligne possède les mêmes tables.
- Allez dans **SQL Editor** sur votre dashboard Supabase.
- Copiez-collez le contenu de vos fichiers dans `supabase/migrations/` (un par un, dans l'ordre chronologique) et exécutez-les.
- **Important** : N'oubliez pas la table `push_subscriptions` et les politiques RLS !

### 1.2 Configurer les Secrets VAPID (Pour les Notifications)
- Générez vos clés sur votre PC : `npx web-push generate-vapid-keys`.
- Dans Supabase : **Settings** > **Edge Functions**.
- Ajoutez deux secrets :
    - `VAPID_PUBLIC_KEY` = votre clé publique.
    - `VAPID_PRIVATE_KEY` = votre clé privée.

---

## 🌐 Étape 2 : Héberger le Frontend (Vercel ou Netlify)

Pour le site web (React), je recommande **Vercel** ou **Netlify** (les deux ont des plans gratuits excellents).

### 2.1 Connecter GitHub
1. Poussez votre code sur GitHub (ce que nous venons de faire).
2. Créez un compte sur [Vercel](https://vercel.com).
3. Cliquez sur **"Add New"** > **"Project"** et importez votre dépôt `jvazel/zenbudget`.

### 2.2 Configurer les Variables d'Environnement
Dans l'interface de l'hébergeur, avant de cliquer sur "Deploy", ajoutez ces variables :
- `VITE_SUPABASE_URL` : L'URL de votre projet Supabase (Settings > API).
- `VITE_SUPABASE_ANON_KEY` : La clé "anon public" (Settings > API).
- `VITE_VAPID_PUBLIC_KEY` : Votre clé VAPID publique.

---

## 📱 Étape 3 : Spécificités PWA (ZenMobile)

Une fois le site en ligne (ex: `https://zenbudget.vercel.app`) :

1. **HTTPS Obligatoire** : Votre hébergeur le gère automatiquement.
2. **Sur Android** : Ouvrez l'URL dans Chrome, un bandeau "Ajouter à l'écran d'accueil" apparaîtra (grâce à notre plugin PWA).
3. **Sur iPhone (iOS)** : 
    - Ouvrez l'URL dans **Safari**.
    - Appuyez sur l'icône **Partager** (le carré avec une flèche).
    - Faites défiler et appuyez sur **"Sur l'écran d'accueil"**.
    - *C'est la seule façon d'activer les notifications push sur iOS.*

---

## 🛡️ Étape 4 : Checklist de Sécurité

- [ ] **RLS** : Vérifiez dans Supabase qu'aucune table n'a l'alerte "RLS not enabled".
- [ ] **Auth** : Dans Supabase (Authentication > Settings), désactivez "Allow new users to sign up" si vous voulez que l'app soit privée, ou configurez les "Confirm email" pour plus de sécurité.
- [ ] **Key Rotation** : Ne partagez jamais votre `VAPID_PRIVATE_KEY` ailleurs que dans les secrets Supabase.

---

## 💡 Prochaine étape réelle ?
Pour que les notifications partent **automatiquement** (ex: alerte de découvert à 8h du matin), il faudra déployer la première "Edge Function" (notre futur majordome sur le cloud).

**Souhaitez-vous que je développe cette fonction maintenant que vous avez le guide ?**
