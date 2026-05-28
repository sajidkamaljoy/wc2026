import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

const getAllTeams = unstable_cache(
  async () => {
    return prisma.team.findMany({
      select: {
        id: true,
        name: true,
        flagUrl: true,
      },
      orderBy: { name: "asc" },
    });
  },
  ["teams-list-all"],
  { revalidate: 3600 } // Cache for 1 hour since the team list doesn't change
);

export async function GET() {
  try {
    const teams = await getAllTeams();
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching teams list:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
