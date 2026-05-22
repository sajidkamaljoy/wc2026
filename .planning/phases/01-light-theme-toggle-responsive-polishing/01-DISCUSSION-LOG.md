# Phase 1: Light Theme Toggle & Responsive Polishing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 01-Light Theme Toggle & Responsive Polishing
**Areas discussed:** Theme State & LocalStorage Hook

---

## Theme State & LocalStorage Hook

| Option | Description | Selected |
|--------|-------------|----------|
| Layout Script Injection | Inject a tiny blocking script in RootLayout (<head>) that reads localStorage and appends/removes the 'dark' class before page paint to prevent white flash. | ✓ |
| Pure useEffect Mount | Initialize only on client mount in useEffect. Highly React-idiomatic, but causes a brief unstyled flash (FOUC) for dark mode users. | |
| You Decide | Use the cleanest hybrid method that ensures both Next.js 16/React 19 compatibility and visual seamlessness. | |

**User's choice:** Layout Script Injection

---

| Option | Description | Selected |
|--------|-------------|----------|
| Custom React Context Provider | Wrap layout in a lightweight ThemeProvider with a useTheme() hook for dynamic client interactions. | ✓ |
| Direct Document Manipulation | Manipulate document.documentElement directly in a simple custom hook without a full React Context overhead. | |

**User's choice:** Custom React Context Provider

---

| Option | Description | Selected |
|--------|-------------|----------|
| wc2026_theme | Matching our existing favorites localstorage structure | ✓ |
| custom_theme | Alternative key | |

**User's choice:** wc2026_theme

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dark Theme | Keep the application's current immersive dark-slate vibe as the default. | ✓ |
| Light Theme | Start first-time visitors in the new crisp white/gold light mode. | |

**User's choice:** Dark Theme

---

## the agent's Discretion

- Minor color shade choices for light cards/containers (e.g. slate-100 vs slate-200 card borders).
- Lucide toggle icon design details (hover effect animations, precise positioning paddings).

## Deferred Ideas

- **System Preference Sync**: Syncing the user's default OS dark/light mode preference has been deferred to Phase v2.
