import { prisma } from "@/lib/db";
import { LiveWatchClient } from "@/components/live/LiveWatchClient";
import type { Metadata } from "next";
import { Tv, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Live Match Center — World Cup 2026",
  description: "Watch FIFA World Cup 2026™ matches live. Access stream player, live fan chat, interactive cheering stats, and game analytics.",
  alternates: {
    canonical: "/watch",
  },
  openGraph: {
    url: "/watch",
    title: "Live Match Center — World Cup 2026",
    description: "Watch FIFA World Cup 2026™ matches live. Access stream player, live fan chat, interactive cheering stats, and game analytics.",
  },
};

interface PageProps {
  searchParams: Promise<{
    matchNumber?: string;
    id?: string;
    streamedId?: string;
    streamedTitle?: string;
    category?: string;
  }>;
}

export default async function WatchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const matchId = params.id;
  const matchNumberParam = params.matchNumber ? parseInt(params.matchNumber, 10) : undefined;
  const streamedId = params.streamedId;
  const streamedTitle = params.streamedTitle;
  const category = params.category;
  
  let match = null;

  try {
    if (streamedId) {
      const title = streamedTitle ? decodeURIComponent(streamedTitle) : "Live Match";
      const parts = title.split(/\s+vs\s+|\s+-\s+/i);
      const homeName = parts[0] || "Home Team";
      const awayName = parts[1] || "Away Team";
      
      match = {
        id: streamedId,
        matchNumber: 0,
        stage: "GROUP" as const,
        groupId: "LIVE",
        kickoffUtc: new Date().toISOString(),
        homeTeam: { id: "HOME", name: homeName, flagUrl: null },
        awayTeam: { id: "AWAY", name: awayName, flagUrl: null },
        homePlaceholder: null,
        awayPlaceholder: null,
        venue: { name: "Live Broadcaster", city: category || "Sports", country: "streamed.pk" },
        status: "LIVE" as const,
        homeScore: null,
        awayScore: null,
      };
    } else if (matchId || matchNumberParam) {
      // User explicitly requested a specific match (e.g. by clicking "Watch Live Stream" on a fixture card)
      const whereClause: { id?: string; matchNumber?: number } = {};
      if (matchId) {
        whereClause.id = matchId;
      } else if (matchNumberParam) {
        whereClause.matchNumber = matchNumberParam;
      }

      const dbMatch = await prisma.match.findFirst({
        where: whereClause,
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
    } else {
      // No query parameter provided: find a match currently in progress (within kickoff + 4 hours window) and not FINISHED
      const now = new Date();
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
      
      const dbMatch = await prisma.match.findFirst({
        where: {
          kickoffUtc: {
            gte: fourHoursAgo,
            lte: now,
          },
          status: {
            not: "FINISHED",
          },
        },
        include: {
          homeTeam: { select: { id: true, name: true, flagUrl: true } },
          awayTeam: { select: { id: true, name: true, flagUrl: true } },
          venue: { select: { name: true, city: true, country: true } },
        },
        orderBy: [
          { kickoffUtc: "desc" },
          { matchNumber: "desc" },
        ],
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
    }
  } catch (error) {
    console.error("⚠️ Failed to load match from DB for live watch page:", error);
  }

  // Fallback to seeded opening match details ONLY if they explicitly requested match number 1/opening match
  // and the database failed or returned null (guarantees the demo matches can load under db downtime)
  if (!match && (matchNumberParam === 1 || matchId === "mex-vs-zaf-1")) {
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

  // Premium Empty State if no active match is running and none was explicitly requested
  if (!match) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="relative inline-flex items-center justify-center p-6 bg-slate-900/80 border border-white/10 rounded-full mb-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-red-500/10 rounded-full blur-xl opacity-60" />
          <Tv className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-amber-400 via-rose-400 to-red-500 bg-clip-text text-transparent">
          No Match Live Streaming
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          There are currently no live World Cup matches playing in their active broadcast window. Please check the schedule to view upcoming games or check back during kickoff!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/fixtures"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4" />
            <span>View Match Schedule</span>
          </Link>
          <Link
            href="/fixtures"
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Fixtures</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <LiveWatchClient match={match} />
    </div>
  );
}
