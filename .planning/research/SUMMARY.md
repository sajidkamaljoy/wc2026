# Research Summary: Bracket Auto-Sync

> Mapped: 2026-07-07

This summary outlines the technical choices, required features, and architectural integrations needed to deliver the predictions auto-sync feature.

## Key Findings

### 1. Stack
No additional NPM packages or framework configurations are required. The existing Next.js App Router, Prisma ORM, and Tailwind CSS v4 stack is fully capable of supporting the sync functionality.

### 2. Feature Table Stakes
- **"Sync with Live Bracket" button** in the UI with a spinner state.
- **Visual indicators** showing lock icons for real resolved games vs editable badges for user guesses.
- **Resolving Extra-Time & Penalties** correctly to determine match winners.
- **Prevention of silent overrides**: the sync must be triggered explicitly by the user.

### 3. Architecture & Integration
- Extend client-side hook `useBracketPrediction` with a `syncKnockoutsWithActual()` action.
- Retrieve resolved matches from the Next.js database layer.
- Update `localStorage` cache and upsert the user's remote prediction profile in parallel.

### 4. Watch Out For (Pitfalls)
- **Cascading resets**: Syncing intermediate matches might clear later round picks. Warning overlays are required.
- **Hydration safety**: Ensure all updates are rendered client-safe via double-mount guards.
