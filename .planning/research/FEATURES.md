# Features Research: Bracket Auto-Sync

> Mapped: 2026-07-07

## Feature Categorization

### 1. Table Stakes (Must Have)
- **"Sync with Live Bracket" UI Button**: An easily discoverable, gold-styled action button with a spin animation (`animate-spin` on click) that executes the sync logic.
- **Visual Sync Status Indicators**: Explicit indicators highlighting which matches are "Live Synced & Locked" (using a green check/lock icon) vs which are "User Predictions" (dotted amber borders or help icons).
- **Auto-Resolve Finished Knockouts**: Automatically overwrite user prediction picks for matches that have already completed in the actual tournament (status `FINISHED` in the database).
- **Sync Group Standings to Knockouts**: Integrate the existing `syncAllGroupsWithStandings` command so the transition from group placements to Round of 32 matches happens seamlessly in one step.

### 2. Differentiators (Nice to Have)
- **Downtree Propagation & Recovery**: A smart resolution helper that automatically matches custom user choices for later rounds (e.g. Semi-finals) even after a sync updates intermediate matches, as long as the user's predicted team is still alive.
- **Partial Bracket Syncing**: Allowing the user to sync only the group stage rankings or only the knockout rounds separately.
- **Sync Confirmation Dialog**: A premium glassmorphic modal warning the user that auto-syncing completed rounds will override any manual overrides they set for those specific played matches.

### 3. Anti-Features (What NOT to build)
- **Silent Auto-Syncing**: Syncing the user's prediction sheet silently on page load. This would ruin the core user experience of making a personal guess and checking how it compares to actual results.
- **Admin-only Sync Controls**: Restricting sync actions to administrators; every fan/client must have control over sync state locally.
