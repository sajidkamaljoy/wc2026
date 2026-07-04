import { prisma } from "@/lib/db";
import { Stage, MatchStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { allocateThirdPlaces } from "@/lib/bracket-prediction";

// ─── WINNER / LOSER HELPERS ────────────────────────────────────────────────
/**
 * Returns the winning teamId from a finished match.
 * Considers full-time, extra-time, and penalty results.
 * Returns null if result is indeterminate.
 */
function getWinner(match: {
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homeScoreET: number | null;
  awayScoreET: number | null;
  homeScorePens: number | null;
  awayScorePens: number | null;
}): string | null {
  if (!match.homeTeamId || !match.awayTeamId) return null;
  const home = match.homeScore ?? 0;
  const away = match.awayScore ?? 0;
  if (home > away) return match.homeTeamId;
  if (away > home) return match.awayTeamId;
  // Tied — check ET
  const homeET = match.homeScoreET;
  const awayET = match.awayScoreET;
  if (homeET !== null && awayET !== null) {
    if (homeET > awayET) return match.homeTeamId;
    if (awayET > homeET) return match.awayTeamId;
  }
  // Still tied — check Penalties
  const homePens = match.homeScorePens;
  const awayPens = match.awayScorePens;
  if (homePens !== null && awayPens !== null) {
    if (homePens > awayPens) return match.homeTeamId;
    if (awayPens > homePens) return match.awayTeamId;
  }
  return null; // truly indeterminate
}

function getLoser(match: Parameters<typeof getWinner>[0]): string | null {
  const winner = getWinner(match);
  if (!winner) return null;
  return winner === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
}

// ─── PROGRESSION MAP ───────────────────────────────────────────────────────
// Describes how completed matches feed into the next stage.
// matchNumber → which feeder matches determine its home/away team.
// isWinner: true = take winner, false = take loser (3rd place match)
const PROGRESSION: Record<
  number,
  {
    homeFeeder: number;
    homeIsWinner: boolean;
    awayFeeder: number;
    awayIsWinner: boolean;
  }
> = {
  // ── Round of 16 (fed by R32) ──
  89: { homeFeeder: 74, homeIsWinner: true, awayFeeder: 77, awayIsWinner: true },
  90: { homeFeeder: 73, homeIsWinner: true, awayFeeder: 75, awayIsWinner: true },
  91: { homeFeeder: 76, homeIsWinner: true, awayFeeder: 78, awayIsWinner: true },
  92: { homeFeeder: 79, homeIsWinner: true, awayFeeder: 80, awayIsWinner: true },
  93: { homeFeeder: 83, homeIsWinner: true, awayFeeder: 84, awayIsWinner: true },
  94: { homeFeeder: 81, homeIsWinner: true, awayFeeder: 82, awayIsWinner: true },
  95: { homeFeeder: 86, homeIsWinner: true, awayFeeder: 88, awayIsWinner: true },
  96: { homeFeeder: 85, homeIsWinner: true, awayFeeder: 87, awayIsWinner: true },
  // ── Quarter-Finals (fed by R16) ──
  97: { homeFeeder: 89, homeIsWinner: true, awayFeeder: 90, awayIsWinner: true },
  98: { homeFeeder: 93, homeIsWinner: true, awayFeeder: 94, awayIsWinner: true },
  99: { homeFeeder: 91, homeIsWinner: true, awayFeeder: 92, awayIsWinner: true },
  100: { homeFeeder: 95, homeIsWinner: true, awayFeeder: 96, awayIsWinner: true },
  // ── Semi-Finals (fed by QF) ──
  101: { homeFeeder: 97, homeIsWinner: true, awayFeeder: 98, awayIsWinner: true },
  102: { homeFeeder: 99, homeIsWinner: true, awayFeeder: 100, awayIsWinner: true },
  // ── 3rd Place Play-off (losers of SF) ──
  103: { homeFeeder: 101, homeIsWinner: false, awayFeeder: 102, awayIsWinner: false },
  // ── Final (winners of SF) ──
  104: { homeFeeder: 101, homeIsWinner: true, awayFeeder: 102, awayIsWinner: true },
};

// ─── GROUP STAGE RESOLVER ─────────────────────────────────────────────────

/**
 * Checks if the group stage is complete, and if so,
 * automatically populates the qualified teams into the Round of 32 fixtures.
 */
export async function autoResolveKnockouts(): Promise<void> {
  try {
    // 1. Check if there are any uncompleted group stage matches
    const uncompletedGroupStageMatches = await prisma.match.count({
      where: {
        stage: Stage.GROUP,
        status: { not: MatchStatus.FINISHED },
      },
    });

    if (uncompletedGroupStageMatches > 0) {
      console.log(`[Knockout Resolver] Group stage is not yet complete (${uncompletedGroupStageMatches} matches remaining). Skipping Round of 32 population.`);
      return;
    }

    console.log("[Knockout Resolver] Group stage is complete! Auto-resolving Round of 32 pairings...");

    // 2. Fetch all groups and teams
    const groups = await prisma.group.findMany({
      include: { teams: true },
    });

    const groupRankings: Record<string, string[]> = {};
    const allThirds: {
      teamId: string;
      name: string;
      groupId: string;
      points: number;
      gd: number;
      gf: number;
    }[] = [];

    // Sort each group and extract rankings
    for (const group of groups) {
      const sorted = [...group.teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.id.localeCompare(b.id);
      });

      groupRankings[group.id] = sorted.map((t) => t.id);

      if (sorted[2]) {
        allThirds.push({
          teamId: sorted[2].id,
          name: sorted[2].name,
          groupId: group.id,
          points: sorted[2].points,
          gd: sorted[2].goalsFor - sorted[2].goalsAgainst,
          gf: sorted[2].goalsFor,
        });
      }
    }

    // 3. Determine best 8 third-place teams
    const sortedThirds = [...allThirds].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.teamId.localeCompare(b.teamId);
    });

    const advancingThirds = sortedThirds.slice(0, 8);
    const advancingThirdsGroupIds = advancingThirds.map((t) => t.groupId);

    // 4. Allocate 3rd places to match numbers using the tournament algorithm
    const thirdPlaceAssignments = allocateThirdPlaces(advancingThirdsGroupIds);

    // 5. Fetch all Round of 32 matches
    const r32Matches = await prisma.match.findMany({
      where: { stage: Stage.ROUND_OF_32 },
    });

    // 6. Update each Round of 32 match in the DB
    let updatedCount = 0;
    for (const match of r32Matches) {
      const homePlaceholder = match.homePlaceholder;
      const awayPlaceholder = match.awayPlaceholder;

      let homeTeamId: string | null = null;
      let awayTeamId: string | null = null;

      // Resolve Home Team
      if (homePlaceholder) {
        const winnerMatch = homePlaceholder.match(/^Winner Group ([A-L])$/i);
        const runnerUpMatch = homePlaceholder.match(/^Runner-up Group ([A-L])$/i);

        if (winnerMatch) {
          const gId = winnerMatch[1].toUpperCase();
          homeTeamId = groupRankings[gId]?.[0] ?? null;
        } else if (runnerUpMatch) {
          const gId = runnerUpMatch[1].toUpperCase();
          homeTeamId = groupRankings[gId]?.[1] ?? null;
        } else if (homePlaceholder.toLowerCase().startsWith("3rd place")) {
          const assignedGroup = thirdPlaceAssignments[match.matchNumber];
          if (assignedGroup) {
            homeTeamId = groupRankings[assignedGroup]?.[2] ?? null;
          }
        }
      }

      // Resolve Away Team
      if (awayPlaceholder) {
        const winnerMatch = awayPlaceholder.match(/^Winner Group ([A-L])$/i);
        const runnerUpMatch = awayPlaceholder.match(/^Runner-up Group ([A-L])$/i);

        if (winnerMatch) {
          const gId = winnerMatch[1].toUpperCase();
          awayTeamId = groupRankings[gId]?.[0] ?? null;
        } else if (runnerUpMatch) {
          const gId = runnerUpMatch[1].toUpperCase();
          awayTeamId = groupRankings[gId]?.[1] ?? null;
        } else if (awayPlaceholder.toLowerCase().startsWith("3rd place")) {
          const assignedGroup = thirdPlaceAssignments[match.matchNumber];
          if (assignedGroup) {
            awayTeamId = groupRankings[assignedGroup]?.[2] ?? null;
          }
        }
      }

      // Only update if IDs changed to avoid redundant writes
      if (
        (homeTeamId && match.homeTeamId !== homeTeamId) ||
        (awayTeamId && match.awayTeamId !== awayTeamId)
      ) {
        await prisma.match.update({
          where: { id: match.id },
          data: {
            homeTeamId,
            awayTeamId,
          },
        });
        console.log(`[Knockout Resolver] Match #${match.matchNumber}: Updated ${homePlaceholder} -> ${homeTeamId} vs ${awayPlaceholder} -> ${awayTeamId}`);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`[Knockout Resolver] Successfully populated/updated ${updatedCount} Round of 32 pairings.`);
      try {
        revalidateTag("fixtures", "max");
      } catch (err) {
        console.warn("[Knockout Resolver] revalidateTag warning for fixtures (expected if outside Next.js request context):", err);
      }
    } else {
      console.log("[Knockout Resolver] All Round of 32 pairings are already up to date.");
    }
  } catch (error) {
    console.error("[Knockout Resolver] Error auto-resolving knockouts:", error);
  }
}

// ─── KNOCKOUT PROGRESSION RESOLVER ────────────────────────────────────────

/**
 * After any knockout match (R32, R16, QF, SF) finishes,
 * look up the progression map and automatically set the teams in the next
 * stage's match.
 *
 * Call this whenever a knockout match transitions to FINISHED.
 */
export async function autoResolveNextRound(): Promise<void> {
  try {
    // Load all finished knockout matches keyed by matchNumber
    const finishedKnockouts = await prisma.match.findMany({
      where: {
        stage: { in: [Stage.ROUND_OF_32, Stage.ROUND_OF_16, Stage.QUARTER_FINAL, Stage.SEMI_FINAL] },
        status: MatchStatus.FINISHED,
        homeTeamId: { not: null },
        awayTeamId: { not: null },
      },
      select: {
        matchNumber: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
        homeScoreET: true,
        awayScoreET: true,
        homeScorePens: true,
        awayScorePens: true,
      },
    });

    // Build a map: matchNumber → match
    const byNumber = new Map(finishedKnockouts.map((m) => [m.matchNumber, m]));

    // Load all future knockout matches that still have no teams set
    // (matches that need to be resolved)
    const futureMatches = await prisma.match.findMany({
      where: {
        stage: { in: [Stage.ROUND_OF_16, Stage.QUARTER_FINAL, Stage.SEMI_FINAL, Stage.THIRD_PLACE, Stage.FINAL] },
      },
      select: {
        id: true,
        matchNumber: true,
        homeTeamId: true,
        awayTeamId: true,
        homePlaceholder: true,
        awayPlaceholder: true,
      },
    });

    let updatedCount = 0;

    for (const futureMatch of futureMatches) {
      const prog = PROGRESSION[futureMatch.matchNumber];
      if (!prog) continue;

      const homeFeeder = byNumber.get(prog.homeFeeder);
      const awayFeeder = byNumber.get(prog.awayFeeder);

      // Resolve home team
      let newHomeTeamId: string | null = null;
      if (homeFeeder) {
        newHomeTeamId = prog.homeIsWinner ? getWinner(homeFeeder) : getLoser(homeFeeder);
      }

      // Resolve away team
      let newAwayTeamId: string | null = null;
      if (awayFeeder) {
        newAwayTeamId = prog.awayIsWinner ? getWinner(awayFeeder) : getLoser(awayFeeder);
      }

      // Skip if nothing changed
      const homeChanged = newHomeTeamId && futureMatch.homeTeamId !== newHomeTeamId;
      const awayChanged = newAwayTeamId && futureMatch.awayTeamId !== newAwayTeamId;
      if (!homeChanged && !awayChanged) continue;

      // Build update payload — only override what we have
      const updateData: { homeTeamId?: string; awayTeamId?: string } = {};
      if (homeChanged && newHomeTeamId) updateData.homeTeamId = newHomeTeamId;
      if (awayChanged && newAwayTeamId) updateData.awayTeamId = newAwayTeamId;

      await prisma.match.update({
        where: { id: futureMatch.id },
        data: updateData,
      });

      console.log(
        `[Knockout Resolver] Match #${futureMatch.matchNumber} (${futureMatch.homePlaceholder ?? "?"} vs ${futureMatch.awayPlaceholder ?? "?"}): ` +
          `Resolved home=${newHomeTeamId ?? "?"} away=${newAwayTeamId ?? "?"}`
      );
      updatedCount++;
    }

    if (updatedCount > 0) {
      console.log(`[Knockout Resolver] Propagated winners to ${updatedCount} next-stage match(es).`);
      try {
        revalidateTag("fixtures", "max");
        revalidateTag("bracket", "max");
      } catch (err) {
        console.warn("[Knockout Resolver] revalidateTag warning (expected outside Next.js context):", err);
      }
    } else {
      console.log("[Knockout Resolver] No next-stage matches needed updating.");
    }
  } catch (error) {
    console.error("[Knockout Resolver] Error in autoResolveNextRound:", error);
  }
}
