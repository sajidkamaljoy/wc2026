import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

// Cache keyed by sort+stage — revalidates every 30 seconds.
// Sorting/filtering happens in-memory on the cached result to avoid
// separate DB queries for every permutation of filters.
const getAllFixtures = unstable_cache(
  async () => {
    return prisma.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true, flagUrl: true } },
        awayTeam: { select: { id: true, name: true, flagUrl: true } },
        venue: { select: { name: true, city: true, country: true } },
      },
      orderBy: { kickoffUtc: "asc" },
    });
  },
  ["fixtures-all"],
  { revalidate: 30, tags: ["fixtures"] }
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const sort = searchParams.get("sort") ?? "date";
    const stageFilter = searchParams.get("stage");
    const statusFilter = searchParams.get("status");
    const teamFilter = searchParams.get("team");

    // Fetch once from cache — then filter/sort in-memory
    let matches = await getAllFixtures();

    // Apply filters in-memory (no extra DB round-trip)
    if (stageFilter) {
      matches = matches.filter((m) => m.stage === stageFilter);
    }
    if (statusFilter) {
      matches = matches.filter((m) => m.status === statusFilter);
    }
    if (teamFilter) {
      matches = matches.filter(
        (m) => m.homeTeamId === teamFilter || m.awayTeamId === teamFilter
      );
    }

    // Apply sort in-memory
    if (sort === "team") {
      matches = [...matches].sort((a, b) => {
        const aName = a.homeTeam?.name ?? a.homePlaceholder ?? "";
        const bName = b.homeTeam?.name ?? b.homePlaceholder ?? "";
        return aName.localeCompare(bName) || a.kickoffUtc.getTime() - b.kickoffUtc.getTime();
      });
    }
    // Default sort is already by kickoffUtc asc from the DB query

    return NextResponse.json(
      { matches },
      {
        headers: {
          // Shared cache: fresh for 30s, then stale-while-revalidate for 5 min
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
