# Pitfalls Research: Bracket Auto-Sync

> Mapped: 2026-07-07

## Pitfalls & Mitigation Strategies

When syncing user predictions with a live database bracket, there are several subtle bugs and UX pitfalls to mitigate.

### 1. Cascading Pick Resets (Cascading Deletions)
- **Problem**: In the existing `useBracketPrediction` hook, picking a winner in a match recursively deletes all downstream picks (e.g. picking winner of Match 73 clears Match 89, Match 97, etc.) to ensure valid bracket paths. If a user syncs their bracket with live scores, a change in an early round match (e.g. Round of 32) might clear their custom picks for the Quarter-finals or Semi-finals.
- **Mitigation**: 
  - Show a clear warning dialog before executing the sync.
  - Implement a smart recovery check: if the team the user predicted to win in a downstream round is still mathematically qualified/alive and aligns with the new pathways, keep that pick rather than wiping it.

### 2. Match Draw / Extra-Time / Penalty Resolution
- **Problem**: Evaluating who won a knockout match cannot be determined solely by comparing `homeScore` and `awayScore` because knockout matches can end in a draw at 90 minutes and proceed to extra-time or penalty shootouts (`homeScoreET`, `awayScoreET`, `homeScorePens`, `awayScorePens`).
- **Mitigation**: Use the exact winning resolution logic implemented in `lib/knockout-resolver.ts`:
  1. Compare base scores.
  2. If tied, compare Extra-time scores.
  3. If still tied, compare Penalty scores.

### 3. Hydration Mismatches
- **Problem**: Loading prediction states from cookies or local storage during initial Next.js server rendering will cause a hydration mismatch because the server doesn't have access to browser cookies or `localStorage` on initial load.
- **Mitigation**: Maintain a strict `mounted` guard pattern (`useState(false)` → `useEffect(() => setMounted(true), [])`). Do not render interactive buttons or state-derived elements until the client-side mounting is complete.
