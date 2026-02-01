# Story 10.2 : Projection du Solde

Status: done

## Story

As a user prévoyant,
I want to see a chart of my projected balance for the next 30 days,
So that I can anticipate potential financial gaps.

## Acceptance Criteria

- [x] A line chart shows the evolution of the balance day by day.
- [x] The calculation starts from the current real balance.
- [x] Upcoming recurring expenses (auto-validated) are deducted on their respective due dates.
- [x] The chart covers exactly 30 days into the future.
- [x] The final projected balance at J+30 is clearly displayed.

## Dev Notes
- Use a simple SVG polyline for the chart to avoid heavy dependencies if possible, or a lightweight library if available.
- Reuse `getUpcomingProjections` from `projectionService.ts`.
