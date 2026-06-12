import type { LiveScore } from "@/types";
import { prisma } from "./db";
import { MatchStatus as DBStatus } from "@prisma/client";
import { gradePredictionsForMatch } from "./gradePredictions";
import { recalculateGroupStandings } from "./standings";
import { revalidateTag } from "next/cache";

interface FootballDataMatch {
  id: number;
  status: string;
  utcDate: string;
  minute?: number;
  homeTeam?: {
    name: string;
  };
  awayTeam?: {
    name: string;
  };
  score?: {
    fullTime?: {
      home: number | null;
      away: number | null;
    };
  };
}

const BASE = process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";
const KEY  = process.env.FOOTBALL_DATA_API_KEY || "";
const COMP = process.env.FOOTBALL_DATA_COMPETITION_ID || "2000";

async function fdFetch(path: string) {
  if (!KEY) {
    // If no key is set yet, return an empty mock structure
    return { matches: [] };
  }
  const res = await fetch(`${BASE}${path}`, {
    headers: { "X-Auth-Token": KEY },
    next: { revalidate: 0 }, // always fresh
  });
  if (!res.ok) throw new Error(`football-data error: ${res.status}`);
  return res.json();
}

export async function getLiveScores(): Promise<LiveScore[]> {
  try {
    const data = await fdFetch(
      `/competitions/${COMP}/matches?status=IN_PLAY,PAUSED,FINISHED`
    );

    return (data.matches ?? []).map((m: FootballDataMatch): LiveScore => ({
      matchId: m.id.toString(), // Note: this is the external ID; map to our DB ID below
      homeScore: m.score?.fullTime?.home ?? null,
      awayScore: m.score?.fullTime?.away ?? null,
      status: mapStatus(m.status),
      minute: m.minute ?? undefined,
    }));
  } catch {
    return [];
  }
}

function mapStatus(fdStatus: string): LiveScore["status"] {
  const map: Record<string, LiveScore["status"]> = {
    SCHEDULED: "SCHEDULED",
    TIMED: "SCHEDULED",
    IN_PLAY: "LIVE",
    PAUSED: "HALF_TIME",
    FINISHED: "FINISHED",
    POSTPONED: "POSTPONED",
    CANCELLED: "CANCELLED",
  };
  return map[fdStatus] ?? "SCHEDULED";
}

function mapToDBStatus(fdStatus: string): DBStatus {
  const map: Record<string, DBStatus> = {
    SCHEDULED: DBStatus.SCHEDULED,
    TIMED: DBStatus.SCHEDULED,
    IN_PLAY: DBStatus.LIVE,
    PAUSED: DBStatus.HALF_TIME,
    FINISHED: DBStatus.FINISHED,
    POSTPONED: DBStatus.POSTPONED,
    CANCELLED: DBStatus.CANCELLED,
  };
  return map[fdStatus] ?? DBStatus.SCHEDULED;
}

// Cache the external→internal ID map in memory with a 10-minute TTL.
// Without a TTL, stale IDs would persist if matches are updated in the DB.
const ID_MAP_TTL_MS = 10 * 60 * 1000; // 10 minutes
let idMap: Map<string, string> | null = null;
let idMapFetchedAt = 0;

async function getIdMap(forceRefresh = false): Promise<Map<string, string>> {
  const now = Date.now();
  if (!forceRefresh && idMap && now - idMapFetchedAt < ID_MAP_TTL_MS) return idMap;

  const matches = await prisma.match.findMany({
    select: { id: true, externalId: true },
    where: { externalId: { not: null } },
  });
  idMap = new Map(matches.map((m) => [m.externalId!, m.id]));
  idMapFetchedAt = now;
  return idMap;
}

export async function getLiveScoresMapped(): Promise<LiveScore[]> {
  try {
    if (!KEY) {
      return [];
    }

    const data = await fdFetch(`/competitions/${COMP}/matches?status=IN_PLAY,PAUSED,FINISHED`);
    const apiMatches: FootballDataMatch[] = data.matches ?? [];
    if (apiMatches.length === 0) {
      return [];
    }

    // Load matches from DB to compare and auto-link/auto-sync
    const dbMatches = await prisma.match.findMany({
      include: {
        homeTeam: { select: { name: true, shortName: true } },
        awayTeam: { select: { name: true, shortName: true } },
      },
    });

    const byExternalId = new Map(
      dbMatches
        .filter((m) => m.externalId !== null)
        .map((m) => [m.externalId!, m])
    );

    let dbUpdated = false;

    for (const apiMatch of apiMatches) {
      const externalId = apiMatch.id.toString();
      const newStatus = mapToDBStatus(apiMatch.status);
      const homeScore: number | null = apiMatch.score?.fullTime?.home ?? null;
      const awayScore: number | null = apiMatch.score?.fullTime?.away ?? null;
      const apiHomeTeamName: string = apiMatch.homeTeam?.name ?? "";
      const apiAwayTeamName: string = apiMatch.awayTeam?.name ?? "";
      const apiDate = new Date(apiMatch.utcDate);

      let dbMatch = byExternalId.get(externalId) ?? null;

      // Fuzzy match fallback for unlinked games (e.g. game starts or finished matches check)
      if (!dbMatch) {
        const oneDayMs = 24 * 60 * 60 * 1000;
        dbMatch =
          dbMatches.find((m) => {
            const kickoff = new Date(m.kickoffUtc);
            const dateDiff = Math.abs(kickoff.getTime() - apiDate.getTime());
            if (dateDiff > oneDayMs) return false;

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

      if (dbMatch) {
        const needsExternalId = dbMatch.externalId !== externalId;
        const needsScoreUpdate =
          dbMatch.homeScore !== homeScore ||
          dbMatch.awayScore !== awayScore ||
          dbMatch.status !== newStatus;

        if (needsExternalId || needsScoreUpdate) {
          await prisma.match.update({
            where: { id: dbMatch.id },
            data: {
              externalId,
              status: newStatus,
              homeScore,
              awayScore,
            },
          });
          dbUpdated = true;

          // Auto-grade predictions if status changed to FINISHED
          if (newStatus === DBStatus.FINISHED && dbMatch.status !== DBStatus.FINISHED) {
            try {
              await gradePredictionsForMatch(dbMatch.id);
            } catch (err) {
              console.error(`Error grading predictions for match ${dbMatch.id}:`, err);
            }
          }
        }
      }
    }

    if (dbUpdated) {
      await recalculateGroupStandings();
      try {
        revalidateTag("fixtures", "max");
      } catch (err) {
        console.warn("revalidateTag warning (expected if outside Next.js request context):", err);
      }
    }

    const map = await getIdMap(dbUpdated);
    return apiMatches
      .map((m: any): LiveScore => {
        const extId = m.id.toString();
        const internalId = map.get(extId) ?? extId;
        return {
          matchId: internalId,
          homeScore: m.score?.fullTime?.home ?? null,
          awayScore: m.score?.fullTime?.away ?? null,
          status: mapStatus(m.status),
          minute: m.minute ?? undefined,
        };
      })
      .filter((s) => map.has(s.matchId) || map.size === 0);
  } catch (error) {
    console.error("Error in getLiveScoresMapped:", error);
    return [];
  }
}
