# Story 10.3 : Alertes Anti-Découvert

Status: completed

## Story

As a user "Zen",
I want to be alerted if my projected balance falls below zero,
So that I can take action (transfer money, cancel a subscription) before it's too late.

## Acceptance Criteria

- [ ] The system detects the first date where the projected balance becomes negative.
- [ ] A visual alert is displayed in the dashboard sidebar.
- [ ] The alert shows the expected date and the negative amount.
- [ ] The alert disappears if the projection returns above zero (e.g. after adding income).
- [ ] The alert has a distinct "Critical" look (ZenAlert colors).

## Dev Notes
- Reuse logic from Story 10.2.
- No new database table needed yet; logic remains client-side/service-side for now.
