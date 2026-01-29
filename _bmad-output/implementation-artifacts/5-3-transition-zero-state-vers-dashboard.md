# Story 5.3: Transition "Zero State" vers Dashboard

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to be redirected to the dashboard with a rewarding animation once my inbox is empty,
so that I feel a sense of accomplishment at the end of my daily ritual.

## Acceptance Criteria

1. **Détection de l'Inbox Vide** : Lorsque la dernière carte de la pile `TransactionStack` est swipée, le système doit détecter l'état "vide".
2. **Animation de Gratification** : Un message de succès avec une animation Framer Motion (ex: étincelles, fondu doux) doit s'afficher pendant 2 secondes.
3. **Auto-redirection** : Après l'animation, l'application doit automatiquement changer d'onglet vers le "Dashboard".
4. **Persistance de l'état** : Si l'utilisateur revient sur l'Inbox alors qu'elle est vide, il doit voir le message de "Zen State" sans déclencher à nouveau la redirection automatique immédiatement.

## Tasks / Subtasks

- [x] Modifier `TransactionStack.tsx` pour détecter la fin de la pile (AC: 1)
- [x] Créer le composant `ZenSuccessState.tsx` avec l'animation (AC: 2)
- [x] Intégrer la redirection automatique via `setActiveTab` (AC: 3)
- [x] Gérer le délai de redirection pour permettre de savourer l'instant (AC: 3)

## Dev Notes

- **Animations** : `framer-motion` est déjà utilisé dans le projet.
- **État global** : Utiliser la prop `setActiveTab` passée depuis `App.tsx` ou un event.
- **UX** : L'animation doit être subtile et ne pas être perçue comme un obstacle.

### Project Structure Notes

- Le composant de succès peut être placé dans `src/features/inbox/components/`.

### References

- [x] <!-- id: 4 --> **Visualiser la transition/Zero State**
    - [x] <!-- id: 5 --> Créer le composant `ZenSuccessState`
    - [x] <!-- id: 6 --> Implémenter la logique de détection "plus de transactions" dans `TransactionStack`
    - [x] <!-- id: 7 --> Déclencher `onComplete` après un délai (2-3s)

#### Files
- `src/features/inbox/components/TransactionStack.tsx`
- `src/features/inbox/components/ZenSuccessState.tsx`
- `src/features/inbox/components/TransactionStack.test.tsx`
- `src/features/inbox/components/ZenSuccessState.test.tsx`
- `src/App.tsx`

#### Status
done
