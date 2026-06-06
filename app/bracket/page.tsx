import { FullBracketTree } from "@/components/bracket/FullBracketTree";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Knockout Bracket",
  description: "View the full knockout stage bracket for the FIFA World Cup 2026™.",
  alternates: {
    canonical: "/bracket",
  },
  openGraph: {
    url: "/bracket",
  },
};

export default async function BracketPage() {
  let matches: any[] = [];
  try {
    matches = await prisma.match.findMany({
      where: {
        stage: {
          in: ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"],
        },
      },
      include: {
        homeTeam: { select: { id: true, name: true, flagUrl: true } },
        awayTeam: { select: { id: true, name: true, flagUrl: true } },
      },
      orderBy: {
        matchNumber: "asc",
      },
    });
  } catch (error) {
    console.error("⚠️ [Prisma] Could not load knockout matches. Database is unreachable. Falling back to empty state.", error);
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-24 px-4 sm:px-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          Knockout Bracket
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl">
          The path to glory. Follow the journey from the Round of 32 all the way to the Final at MetLife Stadium.
        </p>
      </div>

      {/* Premium Bracket Predictor CTA Banner */}
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-lg shadow-amber-500/5 backdrop-blur-md">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-bold text-lg uppercase tracking-wider">
            <Sparkles className="h-5 w-5 animate-pulse" />
            Bracket Predictor is Live!
          </div>
          <p className="text-sm text-slate-300 max-w-xl">
            Rank groups, choose wildcard 3rd-place teams, and predict every knockout winner. Get your shareable link to show off your bracket!
          </p>
        </div>
        <Link
          href="/bracket/predict"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 font-bold text-slate-950 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-md shadow-amber-500/20"
        >
          Play Bracket Predictor →
        </Link>
      </div>

      <FullBracketTree matches={matches} />
    </div>
  );
}
