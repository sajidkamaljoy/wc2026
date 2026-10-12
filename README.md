# FIFA World Cup 2026 Fan Companion

**Live site: [fifawc2026.me](https://fifawc2026.me)**

A full-stack fan companion for the FIFA World Cup 2026. Follow fixtures and live scores, track group standings, predict the knockout bracket, play Pick'em against other fans and see how each team's fans are feeling.

## Features

- **Fixtures & live scores.** Every match with kick-off times shown in your own time zone. Live scores are pushed to the browser over **Server-Sent Events**, refreshed from the server every 30 seconds.
- **Group standings.** Tables for all 12 groups, calculated from match results.
- **Bracket predictor.** Fill in the knockout bracket and share it with a link. The whole bracket is encoded in the URL, so no account is needed.
- **Pick'em & leaderboard.** Predict match results, have them graded automatically when matches finish, and climb the leaderboard. Players are identified by an anonymous device ID, so there is no sign-up.
- **Team pages.** Squad, recent form, fixtures, head-to-head records, the team's possible path through the knockouts, and a news feed.
- **Fan mood.** Headlines about each team are scored for sentiment with an LLM on **Groq** (Llama 3.3 70B). If Groq is unavailable, the site falls back to a local lexicon-based analyzer.
- **Live match center** with fan chat and cheering stats.
- **Favorites, light and dark theme, and mobile bottom navigation.**
- **SEO:** sitemap, robots, canonical URLs and Open Graph images.

## Tech stack

| Layer | Tools |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, lucide-react icons |
| Data | Prisma 6 ORM, PostgreSQL (Neon) |
| Validation | Zod |
| External APIs | [football-data.org](https://www.football-data.org/) (fixtures and scores), a news API, Groq (sentiment) |
| Testing | Vitest |
| Hosting | Vercel, with Vercel Analytics |

## Project structure

```
app/            pages (fixtures, groups, bracket, pickem, teams, watch) and API routes under app/api
components/     UI by feature: bracket, fixtures, groups, live, pickem, team, news, squad
hooks/          client hooks: bracket prediction, favorites, theme, device session
lib/            data access and logic: standings, knockout resolver, prediction grading, API clients, caching, rate limiting
prisma/         schema, migrations and seed data (teams, venues, squads)
scripts/        maintenance scripts: score sync, knockout population, prediction backfill, data checks
tests/          Vitest tests for API routes, components, hooks and lib
```

## Data model

`Group`, `Team`, `Venue`, `Match` and `Player` hold the tournament data. `User`, `Prediction` and `BracketPrediction` store fans' picks.

## Getting started

**Requirements:** Node.js 20+ and a PostgreSQL database (a free [Neon](https://neon.tech) database works).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
   FOOTBALL_DATA_API_KEY="your-football-data-key"
   FOOTBALL_DATA_BASE_URL="https://api.football-data.org/v4"
   FOOTBALL_DATA_COMPETITION_ID="2000"  # optional; 2000 is the World Cup and is the default
   GROQ_API_KEY="your-groq-key"        # optional; falls back to the local analyzer
   NEWS_API_KEY="your-news-api-key"    # optional; powers team news
   ```

3. Set up the database and seed tournament data:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client, apply migrations, then build Next.js |
| `npm start` | Run the production build |
| `npm test` | Run the Vitest suite once (`npm run test:watch` to watch) |
| `npm run lint` | Lint with ESLint |
| `npm run sync:scores` | Pull finished and live scores from football-data.org into the database |

## Deployment

The site is deployed on **Vercel**. The build command runs `prisma migrate deploy` before `next build`, so set `DATABASE_URL` (and the API keys above) in the Vercel project's environment variables.

---

*An unofficial fan project, not affiliated with FIFA.*
