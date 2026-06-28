import { prisma } from "./db";
import { allocateThirdPlaces } from "./bracket-prediction";
import { Stage, MatchStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";

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
      console.log(`[Knockout Resolver] Group stage is not yet complete (${uncompletedGroupStageMatches} matches remaining). Skipping knockout population.`);
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
      console.log("[Knockout Resolver] All pairings are already up to date.");
    }
  } catch (error) {
    console.error("[Knockout Resolver] Error auto-resolving knockouts:", error);
  }
}
