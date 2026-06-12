import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

const getGroups = unstable_cache(
  async () => {
    return prisma.group.findMany({
      include: {
        teams: true,
      },
      orderBy: { id: "asc" },
    });
  },
  ["groups"],
  { revalidate: 60 }
);

export async function GET() {
  try {
    const groups = await getGroups();

    const formatted = groups.map((g) => {
      const sortedTeams = [...g.teams].sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) {
          return gdB - gdA;
        }
        return b.goalsFor - a.goalsFor;
      });

      return {
        id: g.id,
        name: g.name,
        teams: sortedTeams.map((t) => ({
          ...t,
          goalDiff: t.goalsFor - t.goalsAgainst,
        })),
      };
    });

    return NextResponse.json({ groups: formatted });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
