# Phase 1: Light Theme Toggle & Responsive Polishing - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a fully responsive and premium light/dark theme toggle system. This includes building a hydration-safe custom hook (`useTheme`) and Context Provider to propagate theme state, injecting an inline script block into `app/layout.tsx`'s `<head>` to prevent the Flash of Unstyled Content (FOUC), and establishing a high-end Clean Slate & Gold light mode theme using Tailwind CSS v4 custom variables in `app/globals.css`. Finally, it includes auditing and polishing the responsiveness of all pages and widgets (including the bracket and squad grids) on mobile viewports.

</domain>

<decisions>
## Implementation Decisions

### Theme State & Hook Mechanics
- **D-01:** **Layout Script Injection**: A tiny, blocking inline script will be injected into the `<head>` of `app/layout.tsx` before the React tree renders. It will instantly inspect `localStorage` for the active theme and toggle the `dark` class on `document.documentElement` to prevent dark mode users from seeing a brief white flash (FOUC).
- **D-02:** **React Context Provider**: We will create a lightweight client-side `ThemeProvider` wrapping the layout and provide a `useTheme()` hook to cleanly toggle the state in active client components.
- **D-03:** **LocalStorage Namespace**: We will use the custom key `wc2026_theme` for persistence, which mirrors our current favorites storage convention.
- **D-04:** **Dark Theme Default**: First-time visitors will default to the existing dark mode to preserve the app's initial branding, but their preference will persist immediately upon toggle.

### UI & Palette Aesthetics
- **D-05:** **Clean Slate & Gold Palette**: Under Light Mode, the application will adapt to a crisp white/slate-50 background, slate-950 main text, and dark contrasting borders, while retaining our signature amber-400 gold highlights for points, stars, and active states.
- **D-06:** **Header-Right Position**: The Lucide Sun/Moon toggle button will be integrated directly in `components/NavBar.tsx` next to the favorites icon, fully accessible on both mobile and desktop viewports.

### user's Discretion
- The exact transition animation durations, Lucide toggle icon hover styles, and minor color shades (e.g. slate-100 vs slate-200 card fills in light mode) are left to the builder's discretion to match the existing premium design system.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Layout & Global Styles
- `app/layout.tsx` — Root layout where the main HTML tag, body classes, and head element reside.
- `app/globals.css` — Global styles defining our custom PostCSS Tailwind v4 variables and custom animation classes.

### Navigation Header
- `components/NavBar.tsx` — Sticky header where the theme toggle button will be integrated.

### State Hooks
- `hooks/useFavorites.ts` — Reference implementation for custom localStorage hook with hydration safety guards.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useFavorites.ts`: Holds the standard `useEffect` mount-guard pattern which is necessary to avoid React 19 SSR hydration mismatches when reading from `localStorage`.
- Lucide React Icons: We already import icons (`Star`, `Search`, etc.) in `NavBar.tsx` and can easily import `Sun` / `Moon` icons from the same library.

### Established Patterns
- Tailwind CSS v4 `@theme inline` block in `app/globals.css`. We should specify our theme colors (`--background`, `--foreground`, etc.) here, using Tailwind's custom selector mapping.
- Page Wrapper Animations: `PageWrapper.tsx` and `animate-fade-in` in `globals.css` animate transitions. We should ensure the theme transition doesn't interfere with this.

### Integration Points
- `app/layout.tsx`: Incorporate the Theme Provider and early head script, and ensure the body classes (`bg-slate-950 text-slate-100`) dynamically adapt when `dark` class is removed.
- `components/NavBar.tsx`: Insert the new interactive Toggle component in the header bar.

</code_context>

<specifics>
## Specific Ideas

- The light mode should feel as premium and sleek as the dark mode, utilizing crisp slate borders (`border-slate-200/80` or similar) to separate panels rather than removing borders completely.
- Make sure that dynamic server components (like standings and fixtures lists) render legible light-mode states by leveraging Tailwind's native `dark:` modifier on class listings.

</specifics>

<deferred>
## Deferred Ideas

- **System Preference Sync**: The user explicitly requested an explicit toggle only, so automatic OS preference syncing is deferred to v2.

</deferred>

---

*Phase: 01-Light Theme Toggle & Responsive Polishing*
*Context gathered: 2026-05-22*
