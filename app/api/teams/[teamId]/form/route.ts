import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;

  // 1. Get the team's full name from our database
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { name: true }
  });

  if (!team) {
    return NextResponse.json({ form: [] });
  }

  const teamName = team.name;

  try {
    // 2. Fetch the highly reliable martj42 international results CSV
    const res = await fetch('https://raw.githubusercontent.com/martj42/international_results/master/results.csv', {
      next: { revalidate: 3600 } // Cache for 1 hour to keep it fast
    });

    if (!res.ok) throw new Error("Failed to fetch match data");
    const text = await res.text();
    const lines = text.split('\n');

    const form = [];

    // 3. Parse backwards to get the 5 most recent finished matches
    for (let i = lines.length - 1; i >= 0 && form.length < 5; i--) {
      if (!lines[i]) continue;

      const cols = lines[i].split(',');
      if (cols.length < 5) continue;

      const date = cols[0];
      const homeTeam = cols[1];
      const awayTeam = cols[2];
      const homeScoreStr = cols[3];
      const awayScoreStr = cols[4];

      if (homeScoreStr === 'NA' || awayScoreStr === 'NA') continue; // Skip future unplayed matches

      if (homeTeam === teamName || awayTeam === teamName) {
        const homeScore = parseInt(homeScoreStr, 10);
        const awayScore = parseInt(awayScoreStr, 10);
        const isHome = homeTeam === teamName;

        let outcome = 'D';
        if (isHome && homeScore > awayScore) outcome = 'W';
        if (isHome && homeScore < awayScore) outcome = 'L';
        if (!isHome && awayScore > homeScore) outcome = 'W';
        if (!isHome && awayScore < homeScore) outcome = 'L';

        form.push({
          id: `real-${form.length}`,
          outcome,
          opponent: isHome ? awayTeam : homeTeam,
          score: isHome ? `${homeScore}-${awayScore}` : `${awayScore}-${homeScore}`,
          date: new Date(date).toISOString(),
        });
      }
    }

    return NextResponse.json({ form });
  } catch (error) {
    console.error("Error fetching real match data:", error);
    return NextResponse.json({ form: [] });
  }
}
