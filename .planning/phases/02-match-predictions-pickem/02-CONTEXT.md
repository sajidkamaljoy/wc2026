# Phase 2: Match Predictions & Fan Pick'em Game - Context

**Gathered:** 2026-05-22
**Status:** Completed

<domain>
## Phase Boundary

Build a frictionless match outcome prediction system ("Pick'em" game) to drive fan engagement for the World Cup 2026 application. Due to the lack of an existing authentication provider, this system must utilize anonymous device sessions tracked via a secure device ID cookie, ensuring immediate and zero-friction participation. The phase comprises designing and implementing database models (`User` and `Prediction`) in Prisma, building backend API endpoints to submit/fetch predictions and generate a global leaderboard, implementing precise grading logic (+3 points for an exact score prediction, +1 point for a correct match outcome/winner), building interactive prediction input forms directly into scheduled fixture cards, and creating a dedicated `/pickem` dashboard page displaying the top 50 users alongside user stats and prediction history.

</domain>

<decisions>
## Implementation Decisions

### Session & Identity Mechanics
- **D-01:** **Anonymous Device Sessions**: To avoid user drop-off, participation is completely frictionless. Users are tracked using a secure, long-lived `deviceId` cookie, which is automatically generated on their first visit.
- **D-02:** **Implicit Profile Creation**: The first time a device ID interacts with the prediction system, a `User` record is created in the database with a randomly generated default nickname (e.g., "Fan_4821") to allow immediate inclusion in the global leaderboard.
- **D-03:** **Nickname Customization**: Users can change their leaderboard display name directly from the `/pickem` page, helping personalize their experience.

### Gamification & Scoring Logic
- **D-04:** **Point Distribution**: 
  - **+3 Points**: Exact score line matches the final score (e.g., predicted 2-1, final 2-1).
  - **+1 Point**: Correct outcome (e.g., predicted 3-0, final 1-0; or predicted 1-1, final 2-2).
  - **0 Points**: Incorrect outcome.
- **D-05:** **Lock-in Rules**: Predictions are only allowed for matches in the `SCHEDULED` status. Once a match begins (status becomes `LIVE`, `FINISHED`, etc.), the submission window is strictly locked.

### UI & UX Integration
- **D-06:** **Fixture Card Inline Form**: The `PredictionInput` form is embedded directly within scheduled fixture cards, allowing users to make picks while browsing the fixture schedule.
- **D-07:** **Dedicated Leaderboard Page (`/pickem`)**: A highly polished, dedicated dashboard page displays the user's score, rank, past predictions (graded and pending), and the top 50 global fans on a beautifully styled table.

</decisions>

<canonical_refs>
## Canonical References

### Database Schema
- `prisma/schema.prisma` — Schema definitions for `User` and `Prediction` models.

### API Routing
- `app/api/predictions/route.ts` — API endpoints for submitting and retrieving predictions.
- `app/api/leaderboard/route.ts` — API endpoint for returning the top 50 leaderboard standings.

### Business & Scoring Logic
- `lib/gradePredictions.ts` — Scoring calculation utility.

### Frontend Components & Views
- `hooks/useUserSession.ts` — Cookie-based session hook.
- `components/fixtures/PredictionInput.tsx` — Dynamic client component for score predictions.
- `components/fixtures/FixtureCard.tsx` — Upgraded card that embeds `PredictionInput`.
- `app/pickem/page.tsx` — Main Pick'em dashboard page containing stats, predictions list, and leaderboard.
- `components/NavBar.tsx` — Main navigation bar integrating the link to `/pickem`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Database and Data Fetching
- Prisma models are connected to the Neon serverless PostgreSQL database. Matches are queried from the database, and predictions are grouped/queried via Prisma relationships.

### Cookie-based Anonymous Sessions
- Using Next.js `cookies` or standard document cookie manipulations. The hook `useUserSession` safely sets a unique UUID `wc2026_device_id` inside the browser cookies.

### Visual Styling
- The Pick'em forms and leaderboard page adopt the beautiful Slate-950 and Gold theme system constructed in Phase 1, ensuring a coherent premium UI under both light and dark mode conditions.

</code_context>

<specifics>
## Specific Ideas

- The prediction input component displays neat increment/decrement buttons (`+` and `-`) for home and away scores to make mobile selection extremely simple.
- Leaderboard table highlights the current user's entry using a soft gold border/background, giving immediate visual feedback.

</specifics>

<deferred>
## Deferred Ideas

- **Social Sharing**: A shareable card depicting a user's picks or leaderboard position has been deferred to v1.1.
- **Full Social Sign-In**: Traditional password/OAuth authentication (Clerk) is deferred until user profiles require synchronization across multiple separate devices.

</deferred>

---

*Phase: 02-Match Predictions & Fan Pick'em Game*
*Context gathered: 2026-05-22*
