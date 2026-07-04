import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { Trophy, Target, User } from "lucide-react";
import type { Metadata } from "next";
import { PredictionHistory } from "@/components/pickem/PredictionHistory";

export const metadata: Metadata = {
  title: "Fan Pick'em Leaderboard",
  description: "Predict match outcomes and compete on the global leaderboard.",
  alternates: {
    canonical: "/pickem",
  },
  openGraph: {
    url: "/pickem",
  },
};

export const dynamic = "force-dynamic";

export default async function PickemPage() {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get("deviceId")?.value;

  let currentUser = null;
  let serializedPredictions: any[] = [];

  if (deviceId) {
    currentUser = await prisma.user.findUnique({
      where: { deviceId },
      include: {
        predictions: {
          include: { 
            match: { 
              include: { 
                homeTeam: { select: { id: true, name: true, flagUrl: true } }, 
                awayTeam: { select: { id: true, name: true, flagUrl: true } },
                venue: { select: { name: true, city: true, country: true } }
              } 
            } 
          },
          orderBy: { match: { kickoffUtc: 'desc' } }
        }
      }
    });

    if (currentUser && currentUser.predictions) {
      serializedPredictions = currentUser.predictions.map((pred) => ({
        id: pred.id,
        userId: pred.userId,
        matchId: pred.matchId,
        homeScore: pred.homeScore,
        awayScore: pred.awayScore,
        pointsEarned: pred.pointsEarned,
        createdAt: pred.createdAt.toISOString(),
        updatedAt: pred.updatedAt.toISOString(),
        match: {
          id: pred.match.id,
          matchNumber: pred.match.matchNumber,
          stage: pred.match.stage,
          groupId: pred.match.groupId,
          kickoffUtc: pred.match.kickoffUtc.toISOString(),
          status: pred.match.status,
          homeScore: pred.match.homeScore,
          awayScore: pred.match.awayScore,
          homeScoreET: pred.match.homeScoreET,
          awayScoreET: pred.match.awayScoreET,
          homeScorePens: pred.match.homeScorePens,
          awayScorePens: pred.match.awayScorePens,
          homeTeam: pred.match.homeTeam,
          awayTeam: pred.match.awayTeam,
          venue: pred.match.venue
        }
      }));
    }
  }

  const leaderboard = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 50,
    select: { id: true, nickname: true, points: true }
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-sky-400" />
          Fan Pick'em
        </h1>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto">
          Predict match outcomes for the FIFA World Cup 2026™. Earn +3 points for exact scores and +1 for the correct winner.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* User Stats Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-400" />
              Your Profile
            </h2>
            
            {currentUser ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500">Nickname</div>
                  <div className="text-lg font-semibold text-slate-200">{currentUser.nickname}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Total Points</div>
                  <div className="text-3xl font-mono font-bold text-amber-400">{currentUser.points}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Predictions Made</div>
                  <div className="text-lg font-semibold text-slate-200">{currentUser.predictions.length}</div>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm italic bg-slate-950/50 p-4 rounded-xl border border-white/5">
                Start predicting matches on the Fixtures page to automatically create your profile and join the leaderboard!
              </div>
            )}
          </div>
        </div>

        {/* Global Leaderboard */}
        <div className="md:col-span-2">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-950/50 p-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-rose-400" />
                Global Top 50
              </h2>
            </div>
            
            <div className="divide-y divide-white/5">
              {leaderboard.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic">No predictions on the board yet.</div>
              ) : (
                leaderboard.map((user, idx) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-4 transition-colors hover:bg-slate-800/30 ${
                      currentUser?.id === user.id ? 'bg-sky-900/20 border-l-2 border-sky-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-400">
                        {idx + 1}
                      </div>
                      <div className="font-semibold text-slate-200">
                        {user.nickname}
                        {currentUser?.id === user.id && <span className="ml-2 text-[10px] uppercase bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">You</span>}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg">
                      {user.points} pts
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User's Prediction History */}
      <div className="mt-12">
        <PredictionHistory initialPredictions={serializedPredictions} />
      </div>
    </div>
  );
}
