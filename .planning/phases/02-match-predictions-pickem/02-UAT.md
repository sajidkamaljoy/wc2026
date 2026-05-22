---
status: testing
phase: 02-match-predictions-pickem
source: [".planning/phases/02-match-predictions-pickem/02-01-SUMMARY.md"]
started: "2026-05-22T17:05:00Z"
updated: "2026-05-22T17:07:00Z"
---

## Current Test

number: 2
name: Anonymous Device Cookie Session
expected: |
  Opening the site sets the `wc2026_device_id` cookie in the browser. In the database, a corresponding `User` record is created automatically with a random nickname (e.g., `Fan_XXXX`).
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: pass

### 2. Anonymous Device Cookie Session
expected: |
  Opening the site sets the `wc2026_device_id` cookie in the browser. In the database, a corresponding `User` record is created automatically with a random nickname (e.g., `Fan_XXXX`).
result: [pending]

### 3. Score Prediction Input Form
expected: |
  For a scheduled match, the prediction input widget is visible at the bottom of the fixture card. You can use the `+` and `-` buttons to change scorelines, and clicking 'Lock in Pick' saves the prediction to the database without page reload.
result: [pending]

### 4. Scoring Logic & Grading Engine
expected: |
  When a match status changes to FINISHED and scores are input, running the grading utility updates the user's prediction status. Exact score gets +3 points, correct winner/outcome gets +1 point, and others get 0 points, updating their total points.
result: [pending]

### 5. Dedicated `/pickem` Standings Page
expected: |
  Navigating to `/pickem` shows the user's nickname, total points, prediction history, and a styled top 50 global leaderboard table with the current user highlighted.
result: [pending]

## Summary

total: 5
passed: 1
issues: 0
pending: 4
skipped: 0

## Gaps

[none yet]

