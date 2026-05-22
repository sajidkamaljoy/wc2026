# Phase 2: Match Predictions & Fan Pick'em Game - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 02-Match Predictions & Fan Pick'em Game
**Areas discussed:** User Auth, Scoring System, Leaderboard Scope

---

## Session & Identity Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Anonymous Device Cookie Session | Track users frictionless using a client-side device ID cookie, auto-generating user profiles with random nicknames. | ✓ |
| Traditional Authentication | Use Clerk or NextAuth. High friction, requires database-backed password storage or external accounts prior to making any predictions. | |

**User's choice:** Anonymous Device Cookie Session

---

## Scoring Logic

| Option | Description | Selected |
|--------|-------------|----------|
| 3 Points Exact / 1 Point Outcome | Standard pick'em scoring schema (+3 exact, +1 correct winner/outcome). Simplifies standings. | ✓ |
| Weighted Goal-difference scoring | Additional points for predicting precise goals scored or margins. Deemed too complex for v1. | |

**User's choice:** 3 Points Exact / 1 Point Outcome

---

## Leaderboard & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /pickem Hub | Build a dedicated dashboard housing user rank, score, submissions history, and the global top 50 table. | ✓ |
| Sidebar Widget | Place a mini standings table on the fixtures page sidebar only. High visual noise, poor mobile scaling. | |

**User's choice:** Dedicated /pickem Hub
