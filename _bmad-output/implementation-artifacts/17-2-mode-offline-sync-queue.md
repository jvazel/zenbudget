# Story 17.2: Mode Offline & Sync Queue

**As a user in the subway,**
**I want to swipe my transactions even without network,**
**So that I don't break my daily ritual.**

## Acceptance Criteria

- [ ] **Service Workers**: Cache des assets statiques (JS/CSS/Fonts) pour chargement instantané.
- [ ] **Read Offline**: Les données déjà chargées (Transactions, Dashboard) sont visibles hors-ligne.
- [ ] **Write Offline**: Les actions (Swipe) sont stockées dans une queue locale (`IndexedDB` ou `localStorage`).
- [ ] **Auto-Sync**: La queue est traitée automatiquement dès le retour de la connexion.

## Technical Tasks

### Core Setup
- [ ] [ ] Configurer `vite-plugin-pwa` pour le caching agressif des assets.
- [ ] [ ] Implémenter un service `connectivityService` pour surveiller l'état du réseau (hook `useOnline`).

### Storage & Queue
- [ ] [ ] Mettre en place un store `useOfflineStore` avec Zustand (persistance `IndexedDB` recommandée).
- [ ] [ ] Créer une structure de données `SyncAction` pour capturer l'ID de transaction et le type d'action (validate/ignore).

### UI/UX
- [ ] [ ] Afficher un indicateur discret "Mode Hors-ligne" quand la connexion est perdue.
- [ ] [ ] Permettre le swipe en mode dégradé (sans retour immédiat du serveur).

### Synchronization
- [ ] [ ] Créer un worker ou un useEffect global qui traite la `SyncQueue` dès que `navigator.onLine` redevient vrai.
- [ ] [ ] Gérer les conflits simples (ex: transaction déjà traitée sur un autre appareil).

## Dev Notes
- Utiliser `workbox` pour la gestion avancée des stratégies de cache (Stale-While-Revalidate).
- S'assurer que les appels Supabase échouent gracieusement et capturent l'erreur pour la file d'attente.
