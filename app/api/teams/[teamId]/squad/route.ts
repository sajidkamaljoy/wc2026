import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PositionType, SquadStatusType } from "@/types";

const POSITION_ORDER: Record<PositionType, number> = {
  GK: 1,
  DEF: 2,
  MID: 3,
  FWD: 4,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const upperTeamId = teamId.toUpperCase();

  try {
    // 1. Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: upperTeamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // 2. Fetch all players for the team
    const dbPlayers = await prisma.player.findMany({
      where: { teamId: upperTeamId },
    });

    // 3. If no players are found (unlikely due to seeding but good safety),
    // we return an empty array with TBD status.
    if (dbPlayers.length === 0) {
      return NextResponse.json({
        teamId: upperTeamId,
        squadStatus: "TBD" as SquadStatusType,
        players: [],
      });
    }

    // 4. Sort players by position GK -> DEF -> MID -> FWD, then by sortIndex
    const sortedPlayers = [...dbPlayers].sort((a, b) => {
      const posA = POSITION_ORDER[a.position as PositionType] ?? 99;
      const posB = POSITION_ORDER[b.position as PositionType] ?? 99;
      if (posA !== posB) {
        return posA - posB;
      }
      return a.sortIndex - b.sortIndex;
    });

    // 5. Overall status is determined by the players' status (they will match)
    const squadStatus = (sortedPlayers[0]?.squadStatus ?? "TBD") as SquadStatusType;

    return NextResponse.json({
      teamId: upperTeamId,
      squadStatus,
      players: sortedPlayers,
    });
  } catch (error) {
    console.error(`Error fetching squad for team ${upperTeamId}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
