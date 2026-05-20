import { GroupGridServer } from "@/components/groups/GroupGridServer";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { GroupWithStandings } from "@/types";

export const metadata: Metadata = {
  title: "Group Standings — FIFA World Cup 2026™",
  description:
    "Track live group standings for all 48 national teams across Groups A to L. Visual indicators for qualification and best third-place slots.",
};

// Server-side cache: revalidates every 60 seconds
const fetchGroups = unstable_cache(
  async (): Promise<GroupWithStandings[]> => {
    const groups = await prisma.group.findMany({
      include: {
        teams: {
          orderBy: [{ points: "desc" }, { goalsFor: "desc" }],
        },
      },
      orderBy: { id: "asc" },
    });

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      teams: g.teams.map((t) => ({
        id: t.id,
        name: t.name,
        flagUrl: t.flagUrl,
        played: t.played,
        won: t.won,
        drawn: t.drawn,
        lost: t.lost,
        goalsFor: t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        goalDiff: t.goalsFor - t.goalsAgainst,
        points: t.points,
        groupId: t.groupId,
      })),
    }));
  },
  ["groups-page"],
  { revalidate: 60, tags: ["groups"] }
);

// Async Server Component — fetches data on the server, zero client-side spinner
export default async function GroupsPage() {
  const groups = await fetchGroups();

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Group Standings
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          Real-time tournament tables for Groups A through L.
        </p>
      </div>

      {/* Standings Grid — receives pre-fetched data, renders immediately */}
      <GroupGridServer groups={groups} />
    </div>
  );
}
