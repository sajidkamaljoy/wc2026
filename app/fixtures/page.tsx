import { FixturesTabsContainer } from "@/components/fixtures/FixturesTabsContainer";
import { NewsFeed } from "@/components/news/NewsFeed";
import { LiveMatchBanner } from "@/components/live/LiveMatchBanner";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Tournament Fixtures & Calendar",
  description: "View the official 104-match schedule of the FIFA World Cup 2026, filtered by group or knockout stages, automatically translated to your timezone.",
  alternates: {
    canonical: "/fixtures",
  },
  openGraph: {
    url: "/fixtures",
  },
};

const fetchFixtures = unstable_cache(
  async () => {
    try {
      const dbMatches = await prisma.match.findMany({
        include: {
          homeTeam: { select: { id: true, name: true, flagUrl: true } },
          awayTeam: { select: { id: true, name: true, flagUrl: true } },
          venue: { select: { name: true, city: true, country: true } },
        },
        orderBy: { kickoffUtc: "asc" },
      });

      return dbMatches.map((m) => ({
        id: m.id,
        matchNumber: m.matchNumber,
        stage: m.stage,
        groupId: m.groupId,
        kickoffUtc: m.kickoffUtc.toISOString(),
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homePlaceholder: m.homePlaceholder,
        awayPlaceholder: m.awayPlaceholder,
        venue: m.venue,
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
      }));
    } catch (error) {
      console.error("⚠️ [Prisma] Could not load fixtures. Database is unreachable. Falling back to empty state.", error);
      return [];
    }
  },
  ["fixtures-page-all"],
  { revalidate: 30, tags: ["fixtures"] }
);

export default async function FixturesPage() {
  const initialMatches = await fetchFixtures();

  return (
    <div className="w-full">
      <NewsFeed />

      {/* Live Match Announcement Banner */}
      <LiveMatchBanner matches={initialMatches} />

      {/* Page Header */}
      <div className="mt-12 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Tournament Fixtures
        </h1>
      </div>

      {/* Fixtures tabbed container */}
      <FixturesTabsContainer initialMatches={initialMatches} />
    </div>
  );
}
