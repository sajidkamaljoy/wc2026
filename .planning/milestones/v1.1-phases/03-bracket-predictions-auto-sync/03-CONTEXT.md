# Phase 3: Bracket Predictions Auto-Sync - Context

**Gathered:** 2026-07-07
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers predictions auto-sync logic, client-side hooks, and visual triggers in the Bracket Challenge. It allows users to synchronize their custom bracket predictions with real-world tournament matches from the database.

</domain>

<decisions>
## Implementation Decisions

### Sync Button Location
- **D-01:** Place the "Sync with Real Knockouts" button in the global actions toolbar at the top of the Bracket Challenge component (next to "Reset Bracket"). This makes it consistently accessible across all views (Groups, Wildcard, Bracket, Leaderboard).
- **D-02:** The sync button will remain always active. When clicked, it will run the sync logic, update picks, and show user feedback (e.g. alert/toast message like "Bracket is already up to date" or "Successfully synced matches!").

### the agent's Discretion
- **Conflict Resolution**: If the sync updates intermediate matchups, recursively clear downstream picks that rely on those matches to prevent an invalid bracket tree state. Warn the user via a confirmation modal before running the sync.
- **Lock State Styling**: Synced/completed matches will display lock icons and disable clicking to prevent modifying results of already played matches.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope & Requirements
- `.planning/PROJECT.md` — Core value, current milestone, and active features
- `.planning/REQUIREMENTS.md` — Requirements checklists (SYNC-01 to SYNC-04)
- `.planning/ROADMAP.md` — Execution phases and plans

### Codebase Conventions
- `.planning/codebase/STRUCTURE.md` — Project file layout
- `.planning/codebase/CONVENTIONS.md` — React rendering, state, and hydration patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useBracketPrediction` in `hooks/useBracketPrediction.ts` — Houses the group rankings, wildcards, and knockout picks state machine.
- `syncAllGroupsWithStandings` in `hooks/useBracketPrediction.ts` — Shows the template for syncing client states with raw DB queries.
- `BracketChallenge` in `components/bracket/BracketChallenge.tsx` — Renders the predictor dashboard and toolbar where the new button will reside.
- `autoResolveKnockouts` in `lib/knockout-resolver.ts` — Contains the rules for resolving knockout slots based on standings.

### Established Patterns
- **Mounted Guard Pattern**: Ensures local storage and API cookies do not trigger Next.js hydration warnings.
- **Cascading Reset Pattern**: Wipes invalid downstream bracket selections when upstream nodes are updated.

### Integration Points
- Connecting the new sync action inside `hooks/useBracketPrediction.ts` to `/api/fixtures` to retrieve database matches.
- Rendering a confirmation modal in `components/bracket/BracketChallenge.tsx`.

</code_context>

<specifics>
## Specific Ideas

- The sync button should feature a rotating refresh icon (`RefreshCw` with `animate-spin` on click) to provide immediate visual feedback.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-Bracket Predictions Auto-Sync*
*Context gathered: 2026-07-07*
