---
last_mapped_date: "2026-05-22"
---

# Tech Stack

## Overview
Next.js 16.2.6 application with App Router, React 19, and Prisma ORM for PostgreSQL. Styling is handled via TailwindCSS v4.

## Core Technologies
- **Language**: TypeScript (`^5`)
- **Framework**: Next.js (`16.2.6`), App Router
- **UI Library**: React (`19.2.4`)
- **Database ORM**: Prisma (`^6.19.3`)
- **Database**: PostgreSQL (configured via Prisma datasource)

## Styling & Components
- **CSS Framework**: TailwindCSS (`^4`)
- **Icons**: Lucide React (`^1.16.0`)

## Utilities
- **Date Handling**: `date-fns` (`^4.2.1`), `date-fns-tz` (`^3.2.0`)
- **Validation**: `zod` (`^4.4.3`)
- **Sentiment Analysis**: `sentiment` (`^5.0.2`)
- **Type Checking**: TypeScript (`^5`), `tsx` (`^4.22.3`)

## Infrastructure
- **Node**: `>=20` (inferred from `@types/node`)
- **Linter**: ESLint (`^9`), `eslint-config-next`

## Configuration Files
- `package.json`
- `prisma/schema.prisma`
- `next.config.ts`
- `tailwind.config.ts` / `postcss.config.mjs`
- `eslint.config.mjs`
