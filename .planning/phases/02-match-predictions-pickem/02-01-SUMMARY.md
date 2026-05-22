---
phase: 02-match-predictions-pickem
plan: "02-01"
subsystem: gamification
tags: ["nextjs", "prisma", "cookies", "leaderboard"]
provides:
  - "Frictionless Match Predictions game using anonymous device cookie identity"
  - "Database models for User and Prediction"
  - "Prediction grading and point scoring engine (+3 exact, +1 outcome)"
  - "Dedicated `/pickem` global leaderboard page"
affects: "fixtures, navigation"
tech-stack:
  added: []
  patterns: ["anonymous-session-tracking", "score-prediction-grading"]
key-files:
  created:
    - "app/api/predictions/route.ts"
    - "app/api/leaderboard/route.ts"
    - "app/pickem/page.tsx"
    - "components/fixtures/PredictionInput.tsx"
    - "hooks/useUserSession.ts"
    - "lib/gradePredictions.ts"
  modified:
    - "prisma/schema.prisma"
    - "components/NavBar.tsx"
    - "components/fixtures/FixtureCard.tsx"
    - "components/fixtures/FixtureList.tsx"
key-decisions:
  - "Use long-lived browser cookies for user session identity rather than complex high-friction signup flow"
  - "Locked predictions at kickoff status change to preserve competition integrity"
duration: 15min
completed: 2026-05-22
---

# Phase 2: Match Predictions & Fan Pick'em Game Summary

**Shipped a complete, premium, and frictionless match outcome prediction gamification layer with a real-time global top 50 leaderboard.**

## Performance
- **Duration:** 15 min
- **Tasks:** 4 completed
- **Files modified:** 16

## Accomplishments
- **Anonymous User Profiles:** Set up automatic unique `deviceId` session creation mapped to persistent DB profiles, randomly generating unique nicknames for leaderboard displays.
- **Dynamic Prediction Input:** Upgraded scheduled fixture cards with micro-animated score prediction inputs.
- **Scoring Engine:** Developed and verified a precise point calculations helper (+3 exact match, +1 correct win/draw outcome).
- **Global Leaderboard:** Created the `/pickem` hub with a beautiful high-contrast top 50 table highlighting the user.

## Task Commits
1. **feat: implement Match Predictions and Fan Pick'em Game (Phase 2)** - `984be1d`

## Files Created/Modified
- `prisma/schema.prisma` - Appended `User` and `Prediction` schema models.
- `lib/gradePredictions.ts` - Scoring engine logic.
- `hooks/useUserSession.ts` - Device cookie controller.
- `components/fixtures/PredictionInput.tsx` - Score selection client component.
- `app/pickem/page.tsx` - Dedicated global leaderboard UI view.

## Decisions & Deviations
- None - followed plan as specified.

## Next Phase Readiness
- Gamification core fully implemented. Ready for verification and milestone packaging.
