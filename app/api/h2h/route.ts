import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const teamAId = url.searchParams.get("teamAId");
  const teamBId = url.searchParams.get("teamBId");

  if (!teamAId || !teamBId) {
    return NextResponse.json(
      { error: "Both teamAId and teamBId parameters are required" },
      { status: 400 }
    );
  }

  // 1. Get both teams' names and flags from our database
  const [teamA, teamB] = await Promise.all([
    prisma.team.findUnique({
      where: { id: teamAId },
      select: { name: true, flagUrl: true }
    }),
    prisma.team.findUnique({
      where: { id: teamBId },
      select: { name: true, flagUrl: true }
    })
  ]);

  if (!teamA || !teamB) {
    return NextResponse.json(
      { error: "One or both teams not found in database" },
      { status: 404 }
    );
  }

  try {
    // 2. Fetch the martj42 international results CSV
    const res = await fetch("https://raw.githubusercontent.com/martj42/international_results/master/results.csv", {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) throw new Error("Failed to fetch international results data");
    const text = await res.text();
    const lines = text.split("\n");

    let totalPlayed = 0;
    let teamAWins = 0;
    let teamBWins = 0;
    let draws = 0;
    const history = [];

    const teamAName = teamA.name;
    const teamBName = teamB.name;

    // 3. Parse backwards to find matches between these two teams
    for (let i = lines.length - 1; i > 0; i--) {
      if (!lines[i]) continue;

      const cols = lines[i].split(",");
      if (cols.length < 5) continue;

      const date = cols[0];
      const homeTeam = cols[1];
      const awayTeam = cols[2];
      const homeScoreStr = cols[3];
      const awayScoreStr = cols[4];

      if (homeScoreStr === "NA" || awayScoreStr === "NA") continue; // Skip unplayed matches

      const isHomeA = homeTeam === teamAName;
      const isAwayA = awayTeam === teamAName;
      const isHomeB = homeTeam === teamBName;
      const isAwayB = awayTeam === teamBName;

      // Check if this match is between Team A and Team B
      if ((isHomeA && isAwayB) || (isHomeB && isAwayA)) {
        const homeScore = parseInt(homeScoreStr, 10);
        const awayScore = parseInt(awayScoreStr, 10);
        totalPlayed++;

        let winner: "A" | "B" | "D" = "D";
        if (homeScore > awayScore) {
          winner = isHomeA ? "A" : "B";
        } else if (homeScore < awayScore) {
          winner = isHomeA ? "B" : "A";
        }

        if (winner === "A") teamAWins++;
        else if (winner === "B") teamBWins++;
        else draws++;

        // Keep up to 10 most recent appearances for the timeline detail
        if (history.length < 10) {
          let outcome: "W" | "D" | "L" = "D";
          if (winner === "A") outcome = "W";
          else if (winner === "B") outcome = "L";

          history.push({
            id: `h2h-${history.length}`,
            outcome,
            opponent: isHomeA ? awayTeam : homeTeam,
            score: isHomeA ? `${homeScore}-${awayScore}` : `${awayScore}-${homeScore}`,
            date: new Date(date).toISOString(),
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
          });
        }
      }
    }

    return NextResponse.json({
      stats: {
        totalPlayed,
        teamAWins,
        teamBWins,
        draws
      },
      teamA: {
        id: teamAId,
        name: teamAName,
        flagUrl: teamA.flagUrl
      },
      teamB: {
        id: teamBId,
        name: teamBName,
        flagUrl: teamB.flagUrl
      },
      history
    });
  } catch (error) {
    console.error("Error calculating head-to-head data:", error);
    return NextResponse.json({ error: "Failed to load H2H records" }, { status: 500 });
  }
}
