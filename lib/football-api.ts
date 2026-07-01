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
    duration?: string;
    fullTime?: {
      home: number | null;
      away: number | null;
    };
    regularTime?: {
      home: number | null;
      away: number | null;
    };
    extraTime?: {
      home: number | null;
      away: number | null;
    };
    penalties?: {
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

function normalizeTeamName(name: string): string {
  if (!name) return "";
  const n = name.toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  
  if (n === "congo dr" || n === "dr congo" || n === "democratic republic of congo" || n === "cod") {
    return "dr congo";
  }
  return n;
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
      
      const duration = apiMatch.score?.duration;
      let homeScore: number | null = null;
      let awayScore: number | null = null;
      let homeScoreET: number | null = null;
      let awayScoreET: number | null = null;
      let homeScorePens: number | null = null;
      let awayScorePens: number | null = null;

      if (apiMatch.score) {
        if (duration === "PENALTY_SHOOTOUT") {
          homeScore = apiMatch.score.regularTime?.home ?? null;
          awayScore = apiMatch.score.regularTime?.away ?? null;
          homeScoreET = (apiMatch.score.regularTime?.home ?? 0) + (apiMatch.score.extraTime?.home ?? 0);
          awayScoreET = (apiMatch.score.regularTime?.away ?? 0) + (apiMatch.score.extraTime?.away ?? 0);
          homeScorePens = apiMatch.score.penalties?.home ?? null;
          awayScorePens = apiMatch.score.penalties?.away ?? null;
        } else if (duration === "EXTRA_TIME") {
          homeScore = apiMatch.score.regularTime?.home ?? null;
          awayScore = apiMatch.score.regularTime?.away ?? null;
          homeScoreET = (apiMatch.score.regularTime?.home ?? 0) + (apiMatch.score.extraTime?.home ?? 0);
          awayScoreET = (apiMatch.score.regularTime?.away ?? 0) + (apiMatch.score.extraTime?.away ?? 0);
        } else {
          homeScore = apiMatch.score.regularTime?.home ?? apiMatch.score.fullTime?.home ?? null;
          awayScore = apiMatch.score.regularTime?.away ?? apiMatch.score.fullTime?.away ?? null;
        }
      }

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
            ].map((n) => normalizeTeamName(n));
            const awayNames = [
              m.awayTeam?.name ?? "",
              m.awayTeam?.shortName ?? "",
              m.awayPlaceholder ?? "",
            ].map((n) => normalizeTeamName(n));

            const apiHome = normalizeTeamName(apiHomeTeamName);
            const apiAway = normalizeTeamName(apiAwayTeamName);

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
          dbMatch.homeScoreET !== homeScoreET ||
          dbMatch.awayScoreET !== awayScoreET ||
          dbMatch.homeScorePens !== homeScorePens ||
          dbMatch.awayScorePens !== awayScorePens ||
          dbMatch.status !== newStatus;

        if (needsExternalId || needsScoreUpdate) {
          await prisma.match.update({
            where: { id: dbMatch.id },
            data: {
              externalId,
              status: newStatus,
              homeScore,
              awayScore,
              homeScoreET,
              awayScoreET,
              homeScorePens,
              awayScorePens,
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
        
        const duration = m.score?.duration;
        let homeScore: number | null = null;
        let awayScore: number | null = null;
        let homeScoreET: number | null = null;
        let awayScoreET: number | null = null;
        let homeScorePens: number | null = null;
        let awayScorePens: number | null = null;

        if (m.score) {
          if (duration === "PENALTY_SHOOTOUT") {
            homeScore = m.score.regularTime?.home ?? null;
            awayScore = m.score.regularTime?.away ?? null;
            homeScoreET = (m.score.regularTime?.home ?? 0) + (m.score.extraTime?.home ?? 0);
            awayScoreET = (m.score.regularTime?.away ?? 0) + (m.score.extraTime?.away ?? 0);
            homeScorePens = m.score.penalties?.home ?? null;
            awayScorePens = m.score.penalties?.away ?? null;
          } else if (duration === "EXTRA_TIME") {
            homeScore = m.score.regularTime?.home ?? null;
            awayScore = m.score.regularTime?.away ?? null;
            homeScoreET = (m.score.regularTime?.home ?? 0) + (m.score.extraTime?.home ?? 0);
            awayScoreET = (m.score.regularTime?.away ?? 0) + (m.score.extraTime?.away ?? 0);
          } else {
            homeScore = m.score.regularTime?.home ?? m.score.fullTime?.home ?? null;
            awayScore = m.score.regularTime?.away ?? m.score.fullTime?.away ?? null;
          }
        }

        return {
          matchId: internalId,
          homeScore,
          awayScore,
          status: mapStatus(m.status),
          minute: m.minute ?? undefined,
          homeScoreET,
          awayScoreET,
          homeScorePens,
          awayScorePens,
        };
      })
      .filter((s) => map.has(s.matchId) || map.size === 0);
  } catch (error) {
    console.error("Error in getLiveScoresMapped:", error);
    return [];
  }
}
