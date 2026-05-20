import type { LiveScore } from "@/types";
import { prisma } from "./db";

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

    return (data.matches ?? []).map((m: any): LiveScore => ({
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

// Cache the external→internal ID map in memory with a 10-minute TTL.
// Without a TTL, stale IDs would persist if matches are updated in the DB.
const ID_MAP_TTL_MS = 10 * 60 * 1000; // 10 minutes
let idMap: Map<string, string> | null = null;
let idMapFetchedAt = 0;

async function getIdMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (idMap && now - idMapFetchedAt < ID_MAP_TTL_MS) return idMap;

  const matches = await prisma.match.findMany({
    select: { id: true, externalId: true },
    where: { externalId: { not: null } },
  });
  idMap = new Map(matches.map((m) => [m.externalId!, m.id]));
  idMapFetchedAt = now;
  return idMap;
}

export async function getLiveScoresMapped(): Promise<LiveScore[]> {
  const raw = await getLiveScores();
  const map = await getIdMap();
  return raw
    .map((s) => ({
      ...s,
      matchId: map.get(s.matchId) ?? s.matchId,
    }))
    .filter((s) => map.has(s.matchId) || map.size === 0);
}
