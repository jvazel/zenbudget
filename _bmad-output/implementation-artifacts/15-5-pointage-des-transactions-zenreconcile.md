# Story 15.5 : Pointage des Transactions (ZenReconcile)

**Status:** Done
**Epic:** 15

## Description
As a user,
I want to manually mark transactions as "reconciled" or "checked",
So that I can ensure my records match my bank statement.

## Acceptance Criteria
- [x] **Reconcile Action**: Toggle status on transaction (`is_checked` flag).
- [x] **Visual Indicator**: Icon showing reconciled status (Check button in Dashboard).
- [x] **Filter**: View only reconciled or unreconciled transactions (`TransactionFilters`).

## Implementation Notes
- **Backend:** `transactionService.toggleTransactionCheck` updates the `is_checked` boolean field in `transactions` table.
- **Frontend:** `ZenDashboard.tsx` exposes a toggle button on each transaction row.
- **Filtering:** `TransactionFilters` component allows filtering by "Pointées" / "Non pointées".

## Technical Debt Resolved
- Feature was implemented but known as `toggleTransactionCheck` internally.
- Verified via unit tests (`src/services/transactionService.test.ts`).
