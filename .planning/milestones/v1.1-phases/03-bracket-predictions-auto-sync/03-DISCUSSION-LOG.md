# Phase 3: Bracket Predictions Auto-Sync - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-07
**Phase:** 3-Bracket Predictions Auto-Sync
**Areas discussed:** Sync Button Location, Status Behavior

---

## Sync Button Location

| Option | Description | Selected |
|--------|-------------|----------|
| In the global actions toolbar | Global action next to "Reset Bracket" accessible across all tabs | ✓ |
| Inside the Bracket tab only | At the top of the knockout tree layout | |
| Contextual sync actions | Contextual sync actions inside individual tabs | |

**User's choice:** Global actions toolbar next to "Reset Bracket".
**Notes:** Makes it easy for fans to sync standings or knockouts at any time regardless of current active view.

---

## Status Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Always active | Always clickable, alerts user and shows status toast | ✓ |
| Always visible but disabled | Disabled with status tooltip when up to date | |
| Dynamically visible | Hidden unless database contains new finished matches | |

**User's choice:** Always active.
**Notes:** Provides a consistent UI affordance; clicking it gives immediate, clear confirmation even if the bracket is already up to date.

---

## the agent's Discretion

- Recalculate downstream paths: recursive clearing of invalid picks when dependencies change.
- Lock styling: dim locked matched cards and disable clicks on completed games.

## Deferred Ideas

None.
