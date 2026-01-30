# Story 11.1: Système de Notifications de Sérénité

Status: done

## Story

As a user,
I want to be notified of important events happening in the background (partner actions, auto-validations),
So that I feel a sense of serenity and stay informed without switching views.

## Acceptance Criteria

1. **ZenToast Service** : Un service global permet de déclencher des notifications "glassmorphic" depuis n'importe quel composant ou service.
2. **Feedback Collaboratif** : Lorsqu'un partenaire valide ou ignore une transaction en temps réel, une notification s'affiche : "{Nom} a validé une transaction".
3. **Résumé d'Import** : Après un import réussi, une notification résume les actions automatiques : "3 transactions auto-validées 🧘".
4. **Alertes de Sécurité** : Les ZenAlerts (anomalies) critiques déclenchent une notification immédiate lors de la navigation ou après un import.
5. **Esthétique Zen** : Les notifications utilisent `framer-motion` pour des entrées/sorties fluides et respectent le thème "Ocean Calm".

## Tasks / Subtasks

- [x] Créer le store `useNotificationStore.ts` pour la file d'attente.
- [x] Développer le composant `ZenToastContainer.tsx`.
- [x] Connecter les événements temps-réel Supabase dans `TransactionStack.tsx`.
- [x] Intégrer les notifications dans `transactionService.importTransactions()`.
- [x] Tester les transitions et la stack de notifications (limite à 3 visibles).

## Dev Notes

- Utiliser `AnimatePresence` de Framer Motion pour les sorties.
- Les notifications doivent disparaître automatiquement après 4 secondes.
- Prévoir un bouton "X" pour fermer manuellement.
