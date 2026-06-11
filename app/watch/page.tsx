import { prisma } from "@/lib/db";
import { LiveWatchClient } from "@/components/live/LiveWatchClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Match Center — Mexico vs South Africa",
  description: "Watch the FIFA World Cup 2026™ match between Mexico and South Africa live. Access stream player, live fan chat, interactive cheering stats, and game analytics.",
  alternates: {
    canonical: "/watch",
  },
  openGraph: {
    url: "/watch",
    title: "Live Match Center — Mexico vs South Africa",
    description: "Watch the FIFA World Cup 2026™ match between Mexico and South Africa live. Access stream player, live fan chat, interactive cheering stats, and game analytics.",
  },
};

export default async function WatchPage() {
  let match = null;

  try {
    const dbMatch = await prisma.match.findFirst({
      where: {
        matchNumber: 1,
      },
      include: {
        homeTeam: { select: { id: true, name: true, flagUrl: true } },
        awayTeam: { select: { id: true, name: true, flagUrl: true } },
        venue: { select: { name: true, city: true, country: true } },
      },
    });

    if (dbMatch) {
      match = {
        id: dbMatch.id,
        matchNumber: dbMatch.matchNumber,
        stage: dbMatch.stage,
        groupId: dbMatch.groupId,
        kickoffUtc: dbMatch.kickoffUtc.toISOString(),
        homeTeam: dbMatch.homeTeam,
        awayTeam: dbMatch.awayTeam,
        homePlaceholder: dbMatch.homePlaceholder,
        awayPlaceholder: dbMatch.awayPlaceholder,
        venue: dbMatch.venue,
        status: dbMatch.status,
        homeScore: dbMatch.homeScore,
        awayScore: dbMatch.awayScore,
      };
    }
  } catch (error) {
    console.error("⚠️ Failed to load match #1 from DB for live watch page:", error);
  }

  // Fallback to seeded opening match details if database is unreachable or query returns null
  if (!match) {
    match = {
      id: "mex-vs-zaf-1",
      matchNumber: 1,
      stage: "GROUP" as const,
      groupId: "A",
      kickoffUtc: "2026-06-11T19:00:00Z",
      homeTeam: { id: "MEX", name: "Mexico", flagUrl: "https://flagcdn.com/w40/mx.png" },
      awayTeam: { id: "ZAF", name: "South Africa", flagUrl: "https://flagcdn.com/w40/za.png" },
      homePlaceholder: null,
      awayPlaceholder: null,
      venue: { name: "Estadio Azteca", city: "Mexico City", country: "Mexico" },
      status: "LIVE" as const,
      homeScore: 1,
      awayScore: 1,
    };
  }

  return (
    <div className="w-full">
      <LiveWatchClient match={match} />
    </div>
  );
}
