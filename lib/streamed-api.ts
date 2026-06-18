import type { Stream } from "@/types";
import { prisma } from "./db";

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: {
    home?: {
      name: string;
      badge: string;
    };
    away?: {
      name: string;
      badge: string;
    };
  };
  sources: {
    source: string;
    id: string;
  }[];
}

export interface TeamInfo {
  id: string;
  name: string;
  shortName?: string | null;
}

const STREAMED_API_BASE = "https://streamed.pk/api";

function getTeamSynonyms(team: string | TeamInfo): string[] {
  const synonyms = new Set<string>();

  let id = "";
  let name = "";
  let shortName = "";

  if (typeof team === "string") {
    name = team;
  } else if (team) {
    id = team.id || "";
    name = team.name || "";
    shortName = team.shortName || "";
  }

  // Helper to register variations of a specific name string
  const addNameVariants = (n: string) => {
    const lower = n.toLowerCase().trim();
    if (!lower) return;
    
    synonyms.add(lower);

    // Common abbreviations and hard overrides
    if (lower === "united states" || lower === "united states of america" || lower === "usa") {
      synonyms.add("usa");
      synonyms.add("united states");
    }
    if (lower === "south korea" || lower === "korea republic" || lower === "korea rep") {
      synonyms.add("korea");
      synonyms.add("south korea");
      synonyms.add("korea rep");
      synonyms.add("korea republic");
    }
    if (lower === "saudi arabia") {
      synonyms.add("saudi");
    }
    if (lower === "south africa") {
      synonyms.add("south africa");
      synonyms.add("zaf");
    }

    // Add stripped down versions (e.g., removing FC, United, City, etc.)
    const cleaned = lower
      .replace(/\b(fc|united|city|cf|real|ac|c\.f\.|f\.c\.)\b/gi, "")
      .replace(/[^a-z0-9\s]/gi, "")
      .trim();

    if (cleaned) {
      synonyms.add(cleaned);
    }
  };

  // Add all primary keys
  if (id) synonyms.add(id.toLowerCase());
  if (name) addNameVariants(name);
  if (shortName) addNameVariants(shortName);

  return Array.from(synonyms);
}

function matchTeams(
  apiMatch: APIMatch,
  homeTeam: string | TeamInfo,
  awayTeam: string | TeamInfo
): boolean {
  const title = apiMatch.title.toLowerCase();
  const homeSyns = getTeamSynonyms(homeTeam);
  const awaySyns = getTeamSynonyms(awayTeam);

  const apiHomeName = apiMatch.teams?.home?.name?.toLowerCase() || "";
  const apiAwayName = apiMatch.teams?.away?.name?.toLowerCase() || "";

  const hasHome = homeSyns.some((syn) => {
    if (title.includes(syn)) return true;
    if (apiHomeName.includes(syn)) return true;
    if (apiAwayName.includes(syn)) return true;
    return false;
  });

  const hasAway = awaySyns.some((syn) => {
    if (title.includes(syn)) return true;
    if (apiHomeName.includes(syn)) return true;
    if (apiAwayName.includes(syn)) return true;
    return false;
  });

  return hasHome && hasAway;
}

export async function getLiveStreamsForMatch(
  homeTeam: TeamInfo,
  awayTeam: TeamInfo
): Promise<Stream[]> {
  try {
    // 1. Fetch all football matches from streamed.pk
    const res = await fetch(`${STREAMED_API_BASE}/matches/football`, {
      next: { revalidate: 30 }, // cache for 30s
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch matches from streamed.pk: ${res.status}`);
    }

    const matches: APIMatch[] = await res.json();
    if (!matches || !Array.isArray(matches)) {
      return [];
    }

    // 2. Find a match that fuzzy matches our home and away teams
    const matchedMatch = matches.find((m) => matchTeams(m, homeTeam, awayTeam));
    if (!matchedMatch) {
      console.log(`ℹ️ No streamed.pk match found for: ${homeTeam.name} vs ${awayTeam.name}`);
      return [];
    }

    console.log(`✅ Found matching streamed.pk match: "${matchedMatch.title}" (ID: ${matchedMatch.id})`);

    // 3. For each source, fetch its stream links in parallel
    const streamPromises = matchedMatch.sources.map(async (src) => {
      try {
        const streamRes = await fetch(`${STREAMED_API_BASE}/stream/${src.source}/${src.id}`, {
          next: { revalidate: 30 },
        });

        if (!streamRes.ok) {
          console.warn(`⚠️ Failed to fetch streams for source ${src.source} and ID ${src.id}: ${streamRes.status}`);
          return [];
        }

        const streams: Stream[] = await streamRes.json();
        return Array.isArray(streams) ? streams : [];
      } catch (err) {
        console.error(`Error fetching streams for ${src.source}:`, err);
        return [];
      }
    });

    const results = await Promise.all(streamPromises);
    const allStreams = results.flat();

    // Remove any streams that lack an embed URL
    return allStreams.filter((s) => s.embedUrl);
  } catch (error) {
    console.error("Error in getLiveStreamsForMatch:", error);
    return [];
  }
}

export async function getLiveMatchesFromStreamed(): Promise<{ matchedIds: string[]; rawLive: APIMatch[] }> {
  try {
    const res = await fetch(`${STREAMED_API_BASE}/matches/live`, {
      next: { revalidate: 30 }, // cache for 30s
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch live matches from streamed.pk: ${res.status}`);
    }

    const liveMatches: APIMatch[] = await res.json();
    if (!liveMatches || !Array.isArray(liveMatches) || liveMatches.length === 0) {
      return { matchedIds: [], rawLive: [] };
    }

    // Get all matches from DB to compare (include id, name, shortName)
    const dbMatches = await prisma.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
      },
    });

    const matchedIds: string[] = [];
    const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

    for (const apiMatch of liveMatches) {
      const match = dbMatches.find((m) => {
        const homeInfo = m.homeTeam 
          ? { id: m.homeTeam.id, name: m.homeTeam.name, shortName: m.homeTeam.shortName }
          : { id: "", name: m.homePlaceholder || "" };
        const awayInfo = m.awayTeam 
          ? { id: m.awayTeam.id, name: m.awayTeam.name, shortName: m.awayTeam.shortName }
          : { id: "", name: m.awayPlaceholder || "" };

        // Team names must match
        if (!matchTeams(apiMatch, homeInfo, awayInfo)) return false;

        // Kickoff time must be within ±4 hours of our DB fixture (avoids
        // matching a same-named fixture from a completely different competition)
        if (apiMatch.date) {
          const apiDateMs = apiMatch.date * 1000; // streamed.pk uses Unix seconds
          const kickoffMs = new Date(m.kickoffUtc).getTime();
          if (Math.abs(apiDateMs - kickoffMs) > FOUR_HOURS_MS) return false;
        }

        return true;
      });
      if (match) {
        matchedIds.push(match.id);
      }
    }

    return { matchedIds, rawLive: liveMatches };
  } catch (error) {
    console.error("Error in getLiveMatchesFromStreamed:", error);
    return { matchedIds: [], rawLive: [] };
  }
}

export async function getStreamsForStreamedMatchId(streamedId: string): Promise<Stream[]> {
  try {
    const res = await fetch(`${STREAMED_API_BASE}/matches/all`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch matches from streamed.pk: ${res.status}`);
    }

    const matches: APIMatch[] = await res.json();
    if (!matches || !Array.isArray(matches)) {
      return [];
    }

    const match = matches.find((m) => m.id === streamedId);
    if (!match) {
      console.log(`ℹ️ No streamed.pk match found by ID: ${streamedId}`);
      return [];
    }

    // Fetch streams for sources
    const streamPromises = match.sources.map(async (src) => {
      try {
        const streamRes = await fetch(`${STREAMED_API_BASE}/stream/${src.source}/${src.id}`, {
          next: { revalidate: 30 },
        });

        if (!streamRes.ok) return [];
        const streams: Stream[] = await streamRes.json();
        return Array.isArray(streams) ? streams : [];
      } catch {
        return [];
      }
    });

    const results = await Promise.all(streamPromises);
    const allStreams = results.flat();
    return allStreams.filter((s) => s.embedUrl);
  } catch (error) {
    console.error("Error in getStreamsForStreamedMatchId:", error);
    return [];
  }
}
