# Technology Stack

> Mapped: 2026-05-21

## Languages & Runtime

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Primary Language | TypeScript | ^5 | Strict mode enabled in `tsconfig.json` |
| Runtime | Node.js | — | Target ES2017, module resolution "bundler" |
| JSX | react-jsx | — | Configured in `tsconfig.json` |

## Frameworks

| Framework | Version | Role |
|-----------|---------|------|
| **Next.js** | 16.2.6 | Full-stack React framework (App Router) |
| **React** | 19.2.4 | UI library |
| **React DOM** | 19.2.4 | Browser rendering |
| **Prisma** | ^6.19.3 | ORM & database toolkit |

## Key Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^6.19.3 | Auto-generated DB client for PostgreSQL |
| `date-fns` | ^4.2.1 | Date utility library (imported but timezone handled via Intl) |
| `date-fns-tz` | ^3.2.0 | Timezone-aware date formatting (imported but `lib/timezone.ts` uses raw Intl API) |
| `lucide-react` | ^1.16.0 | Icon library (Trophy, Calendar, Star, etc.) |
| `zod` | ^4.4.3 | Schema validation (declared but not yet used in application code) |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin for Tailwind v4 |
| `prisma` | ^6.19.3 | Prisma CLI (migrations, generate, seed) |
| `tsx` | ^4.22.3 | TypeScript execution engine for scripts/seeding |
| `dotenv` | ^17.4.2 | Environment variable loading in scripts |
| `eslint` | ^9 | Linting |
| `eslint-config-next` | 16.2.6 | Next.js ESLint rules (core-web-vitals + TypeScript) |

## Build & Development

| Task | Command | Notes |
|------|---------|-------|
| Dev Server | `npm run dev` → `next dev` | Hot reload on `http://localhost:3000` |
| Production Build | `npm run build` → `prisma generate && next build` | Prisma client generated before Next build |
| Start Production | `npm run start` → `next start` | Serves production bundle |
| Lint | `npm run lint` → `eslint` | Uses `eslint.config.mjs` flat config |
| DB Seed | `tsx prisma/seed.ts` | Configured via `prisma.config.ts` |

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript strict mode, path aliases (`@/*` → `./*`) |
| `next.config.ts` | Next.js config (currently empty/default) |
| `postcss.config.mjs` | PostCSS with `@tailwindcss/postcss` plugin |
| `eslint.config.mjs` | Flat ESLint config with core-web-vitals + TypeScript |
| `prisma.config.ts` | Prisma config with seed command and datasource URL |
| `.env` / `.env.local` | Environment variables (DATABASE_URL, API keys) |
| `.gitignore` | Excludes `node_modules`, `.next`, `.env*`, build artifacts |

## Path Aliases

```json
{
  "@/*": ["./*"]
}
```

All imports use `@/` prefix (e.g., `@/lib/db`, `@/components/NavBar`, `@/types`).

## CSS & Styling

- **Tailwind CSS v4** via PostCSS plugin
- Global styles in `app/globals.css`:
  - CSS custom properties for `--background` (slate-950) and `--foreground` (slate-100)
  - `@theme inline` block for Tailwind CSS v4 theme tokens
  - Custom `fade-in` keyframe animation for page transitions
- **Dark mode**: Applied globally via `dark` class on `<html>` element
- **Typography**: Google Fonts `Inter` loaded via `next/font/google`

## Font Loading

```tsx
const inter = Inter({ subsets: ["latin"], display: "swap" });
```

Applied to `<html>` element `className`.
