/**
 * sync-scores.ts
 * 
 * Syncs finished/live match scores from football-data.org into the local DB.
 * 
 * Run manually:         npx tsx scripts/sync-scores.ts
 * Run on a schedule:    Add to a cron job / GitHub Action as needed.
 * 
 * What it does:
 *  1. Fetches all IN_PLAY, PAUSED, and FINISHED matches from the WC competition.
 *  2. For each API match, attempts to find the corresponding DB record by:
 *     a. externalId (fast path — already linked)
 *     b. matchday date + home team name (fuzzy fallback for first-run)
 *  3. Writes back: externalId, homeScore, awayScore, status to the DB.
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

const BASE = process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const COMP = process.env.FOOTBALL_DATA_COMPETITION_ID || "2000";

function mapStatus(fdStatus: string): MatchStatus {
  const map: Record<string, MatchStatus> = {
    SCHEDULED: MatchStatus.SCHEDULED,
    TIMED: MatchStatus.SCHEDULED,
    IN_PLAY: MatchStatus.LIVE,
    PAUSED: MatchStatus.HALF_TIME,
    FINISHED: MatchStatus.FINISHED,
    POSTPONED: MatchStatus.POSTPONED,
    CANCELLED: MatchStatus.CANCELLED,
  };
  return map[fdStatus] ?? MatchStatus.SCHEDULED;
}

async function main() {
  if (!KEY) {
    console.error("❌ FOOTBALL_DATA_API_KEY is not set. Aborting.");
    process.exit(1);
  }

  console.log(`🔄 Fetching matches from football-data.org (competition ${COMP})...`);

  const res = await fetch(
    `${BASE}/competitions/${COMP}/matches?status=IN_PLAY,PAUSED,FINISHED`,
    { headers: { "X-Auth-Token": KEY } }
  );

  if (!res.ok) {
    console.error(`❌ API error: ${res.status} ${res.statusText}`);
    const body = await res.text();
    console.error(body);
    process.exit(1);
  }

  const data = await res.json();
  const apiMatches: any[] = data.matches ?? [];

  if (apiMatches.length === 0) {
    console.log("ℹ️  No IN_PLAY, PAUSED or FINISHED matches found. Nothing to sync.");
    return;
  }

  console.log(`📋 Found ${apiMatches.length} match(es) to sync.`);

  // Load ALL db matches once — we'll match by date+team name for unlinked records
  const dbMatches = await prisma.match.findMany({
    include: {
      homeTeam: { select: { name: true, shortName: true } },
      awayTeam: { select: { name: true, shortName: true } },
    },
  });

  // Build a quick lookup by externalId for already-linked matches
  const byExternalId = new Map(
    dbMatches
      .filter((m) => m.externalId !== null)
      .map((m) => [m.externalId!, m])
  );

  let updated = 0;
  let linked = 0;
  let skipped = 0;

  for (const apiMatch of apiMatches) {
    const externalId = apiMatch.id.toString();
    const newStatus = mapStatus(apiMatch.status);
    const homeScore: number | null = apiMatch.score?.fullTime?.home ?? null;
    const awayScore: number | null = apiMatch.score?.fullTime?.away ?? null;
    const apiHomeTeamName: string = apiMatch.homeTeam?.name ?? "";
    const apiAwayTeamName: string = apiMatch.awayTeam?.name ?? "";
    const apiDate = new Date(apiMatch.utcDate);

    // Step 1: fast path — already linked by externalId
    let dbMatch = byExternalId.get(externalId) ?? null;

    // Step 2: fuzzy match by date window (±1 day) + team name similarity
    if (!dbMatch) {
      const oneDayMs = 24 * 60 * 60 * 1000;
      dbMatch =
        dbMatches.find((m) => {
          const kickoff = new Date(m.kickoffUtc);
          const dateDiff = Math.abs(kickoff.getTime() - apiDate.getTime());
          if (dateDiff > oneDayMs) return false;

          // Name comparison (case-insensitive, partial)
          const homeNames = [
            m.homeTeam?.name ?? "",
            m.homeTeam?.shortName ?? "",
            m.homePlaceholder ?? "",
          ].map((n) => n.toLowerCase());
          const awayNames = [
            m.awayTeam?.name ?? "",
            m.awayTeam?.shortName ?? "",
            m.awayPlaceholder ?? "",
          ].map((n) => n.toLowerCase());

          const apiHome = apiHomeTeamName.toLowerCase();
          const apiAway = apiAwayTeamName.toLowerCase();

          const homeMatch = homeNames.some(
            (n) => n && (n.includes(apiHome) || apiHome.includes(n))
          );
          const awayMatch = awayNames.some(
            (n) => n && (n.includes(apiAway) || apiAway.includes(n))
          );

          return homeMatch && awayMatch;
        }) ?? null;
    }

    if (!dbMatch) {
      console.warn(
        `⚠️  No DB match found for API match ${externalId} (${apiHomeTeamName} vs ${apiAwayTeamName} @ ${apiDate.toISOString()})`
      );
      skipped++;
      continue;
    }

    // Determine what needs updating
    const needsExternalId = dbMatch.externalId !== externalId;
    const needsScoreUpdate =
      dbMatch.homeScore !== homeScore ||
      dbMatch.awayScore !== awayScore ||
      dbMatch.status !== newStatus;

    if (!needsExternalId && !needsScoreUpdate) {
      console.log(`✅ Match ${dbMatch.matchNumber} already up to date.`);
      skipped++;
      continue;
    }

    if (needsExternalId) {
      linked++;
      console.log(
        `🔗 Linking match #${dbMatch.matchNumber} (${dbMatch.id}) → externalId ${externalId}`
      );
    }

    await prisma.match.update({
      where: { id: dbMatch.id },
      data: {
        externalId,
        status: newStatus,
        homeScore,
        awayScore,
      },
    });

    console.log(
      `✏️  Updated match #${dbMatch.matchNumber}: ${apiHomeTeamName} ${homeScore ?? "?"} – ${awayScore ?? "?"} ${apiAwayTeamName} [${newStatus}]`
    );
    updated++;
  }

  console.log(
    `\n🏁 Sync complete. Updated: ${updated}, Newly linked: ${linked}, Skipped: ${skipped}`
  );
}

main()
  .catch((err) => {
    console.error("💥 Fatal error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
