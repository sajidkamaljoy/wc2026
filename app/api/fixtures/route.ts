import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const sort = searchParams.get("sort") ?? "date";
    const teamFilter = searchParams.get("team");
    const stageFilter = searchParams.get("stage");
    const statusFilter = searchParams.get("status");

    const matches = await prisma.match.findMany({
      where: {
        ...(teamFilter && {
          OR: [{ homeTeamId: teamFilter }, { awayTeamId: teamFilter }],
        }),
        ...(stageFilter && { stage: stageFilter as any }),
        ...(statusFilter && { status: statusFilter as any }),
      },
      include: {
        homeTeam: { select: { id: true, name: true, flagUrl: true } },
        awayTeam: { select: { id: true, name: true, flagUrl: true } },
        venue: { select: { name: true, city: true, country: true } },
      },
      orderBy:
        sort === "team"
          ? [
              // Since homeTeam can be null in knockout rounds, order by homeTeamId first
              { homeTeamId: "asc" },
              { kickoffUtc: "asc" },
            ]
          : { kickoffUtc: "asc" },
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
