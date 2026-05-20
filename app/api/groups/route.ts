import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

const getGroups = unstable_cache(
  async () => {
    return prisma.group.findMany({
      include: {
        teams: {
          orderBy: [
            { points: "desc" },
            { goalsFor: "desc" },
          ],
        },
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

    const formatted = groups.map((g) => ({
      id: g.id,
      name: g.name,
      teams: g.teams.map((t) => ({
        ...t,
        goalDiff: t.goalsFor - t.goalsAgainst,
      })),
    }));

    return NextResponse.json({ groups: formatted });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
