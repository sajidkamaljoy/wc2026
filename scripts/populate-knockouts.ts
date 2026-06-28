import { prisma } from "../lib/db";
import { allocateThirdPlaces } from "../lib/bracket-prediction";
import { Stage } from "@prisma/client";

async function main() {
  console.log("🏆 Resolving Group Stage Standings and Populating Round of 32 Matches...");

  // 1. Fetch all groups and teams
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

  // 2. Determine best 8 third-place teams
  const sortedThirds = [...allThirds].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.teamId.localeCompare(b.teamId);
  });

  const advancingThirds = sortedThirds.slice(0, 8);
  const advancingThirdsGroupIds = advancingThirds.map((t) => t.groupId);

  console.log(`Advancing 3rd place groups: ${advancingThirdsGroupIds.join(", ")}`);

  // 3. Allocate 3rd places to match numbers using the tournament algorithm
  const thirdPlaceAssignments = allocateThirdPlaces(advancingThirdsGroupIds);
  console.log("3rd place match assignments:", thirdPlaceAssignments);

  // 4. Fetch all Round of 32 matches
  const r32Matches = await prisma.match.findMany({
    where: { stage: Stage.ROUND_OF_32 },
    orderBy: { matchNumber: "asc" },
  });

  // 5. Update each Round of 32 match in the DB
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

    if (homeTeamId || awayTeamId) {
      await prisma.match.update({
        where: { id: match.id },
        data: {
          homeTeamId,
          awayTeamId,
        },
      });
      console.log(`Match #${match.matchNumber}: Updated ${homePlaceholder} -> ${homeTeamId || "TBD"} vs ${awayPlaceholder} -> ${awayTeamId || "TBD"}`);
      updatedCount++;
    }
  }

  console.log(`\n✅ Finished populating Round of 32. Updated ${updatedCount} matches.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
