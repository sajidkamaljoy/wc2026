import { prisma } from "./db";
import { Stage, MatchStatus } from "@prisma/client";
import { revalidateTag } from "next/cache";
import { autoResolveKnockouts } from "./knockout-resolver";

export async function recalculateGroupStandings(): Promise<void> {
  try {
    // 1. Fetch all teams to initialize the standings map
    const teams = await prisma.team.findMany({
      select: { id: true },
    });

    const standingsMap = new Map<
      string,
      {
        played: number;
        won: number;
        drawn: number;
        lost: number;
        goalsFor: number;
        goalsAgainst: number;
        points: number;
      }
    >();

    for (const team of teams) {
      standingsMap.set(team.id, {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      });
    }

    // 2. Fetch all finished group matches with scores
    const finishedMatches = await prisma.match.findMany({
      where: {
        stage: Stage.GROUP,
        status: MatchStatus.FINISHED,
        homeScore: { not: null },
        awayScore: { not: null },
      },
    });

    // 3. Accumulate stats for each finished group match
    for (const match of finishedMatches) {
      const homeId = match.homeTeamId;
      const awayId = match.awayTeamId;

      if (!homeId || !awayId) continue;

      const homeStats = standingsMap.get(homeId);
      const awayStats = standingsMap.get(awayId);

      if (!homeStats || !awayStats) continue;

      const hScore = match.homeScore!;
      const aScore = match.awayScore!;

      // Increment played
      homeStats.played += 1;
      awayStats.played += 1;

      // Accumulate goals
      homeStats.goalsFor += hScore;
      homeStats.goalsAgainst += aScore;

      awayStats.goalsFor += aScore;
      awayStats.goalsAgainst += hScore;

      // Determine outcome and points
      if (hScore > aScore) {
        homeStats.won += 1;
        homeStats.points += 3;
        awayStats.lost += 1;
      } else if (hScore < aScore) {
        awayStats.won += 1;
        awayStats.points += 3;
        homeStats.lost += 1;
      } else {
        homeStats.drawn += 1;
        homeStats.points += 1;
        awayStats.drawn += 1;
        awayStats.points += 1;
      }
    }

    // 4. Save the updated stats to the DB inside a transaction
    await prisma.$transaction(
      Array.from(standingsMap.entries()).map(([teamId, stats]) =>
        prisma.team.update({
          where: { id: teamId },
          data: {
            played: stats.played,
            won: stats.won,
            drawn: stats.drawn,
            lost: stats.lost,
            goalsFor: stats.goalsFor,
            goalsAgainst: stats.goalsAgainst,
            points: stats.points,
          },
        })
      )
    );

    console.log(`[Standings] Recalculated standings for ${teams.length} teams.`);

    // 5. Invalidate the Next.js cache for the groups page
    try {
      revalidateTag("groups", "max");
    } catch (err) {
      console.warn(
        "revalidateTag warning for groups (expected if outside Next.js request context):",
        err
      );
    }

    // 6. Auto-populate knockout pairings if group stage is completed
    await autoResolveKnockouts();
  } catch (error) {
    console.error("Error recalculating group standings:", error);
  }
}
