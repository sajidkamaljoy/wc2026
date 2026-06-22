"use client";

import { useState } from "react";
import { useLiveScores } from "@/components/live/useLiveScores";
import { KickoffTime } from "@/components/fixtures/KickoffTime";
import { PredictionModal } from "@/components/fixtures/PredictionModal";
import { 
  Trophy, 
  Target, 
  Clock, 
  Edit2, 
  HelpCircle,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  History
} from "lucide-react";
import Link from "next/link";

interface SerializedMatch {
  id: string;
  matchNumber: number;
  stage: string;
  groupId: string | null;
  kickoffUtc: string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: string; name: string; flagUrl: string | null } | null;
  awayTeam: { id: string; name: string; flagUrl: string | null } | null;
  venue: { name: string; city: string; country: string };
}

interface SerializedPrediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned: number | null;
  createdAt: string;
  updatedAt: string;
  match: SerializedMatch;
}

interface Props {
  initialPredictions: SerializedPrediction[];
}

export function PredictionHistory({ initialPredictions }: Props) {
  const [predictions, setPredictions] = useState<SerializedPrediction[]>(initialPredictions);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  
  // Modal state
  const [editingPrediction, setEditingPrediction] = useState<SerializedPrediction | null>(null);

  const { getScore } = useLiveScores();

  // Statistics calculation
  const totalPicks = predictions.length;
  const exactScores = predictions.filter(p => p.pointsEarned === 3).length;
  const correctOutcomes = predictions.filter(p => p.pointsEarned === 1).length;
  const incorrectPicks = predictions.filter(p => p.pointsEarned === 0).length;
  const pendingPicks = predictions.filter(p => p.pointsEarned === null).length;
  const totalPoints = predictions.reduce((acc, p) => acc + (p.pointsEarned ?? 0), 0);

  // Filter predictions
  const filteredPredictions = predictions.filter((pred) => {
    if (filter === "pending") {
      return pred.pointsEarned === null;
    }
    if (filter === "completed") {
      return pred.pointsEarned !== null;
    }
    return true;
  });

  const handleEditSave = (homeScore: number, awayScore: number) => {
    if (!editingPrediction) return;
    setPredictions((prev) =>
      prev.map((p) =>
        p.id === editingPrediction.id
          ? { ...p, homeScore, awayScore }
          : p
      )
    );
    setEditingPrediction(null);
  };

  const getStatusLabel = (matchStatus: string) => {
    switch (matchStatus) {
      case "LIVE":
      case "HALF_TIME":
        return "Live";
      case "FINISHED":
        return "Finished";
      default:
        return "Scheduled";
    }
  };

  const stageName = (stage: string, groupId: string | null): string => {
    if (groupId) return `Group ${groupId}`;
    const map: Record<string, string> = {
      GROUP: "Group Stage",
      ROUND_OF_32: "Round of 32",
      ROUND_OF_16: "Round of 16",
      QUARTER_FINAL: "Quarter-Finals",
      SEMI_FINAL: "Semi-Finals",
      THIRD_PLACE: "3rd Place Match",
      FINAL: "Final",
    };
    return map[stage] ?? stage;
  };

  return (
    <div className="space-y-8">
      {/* Summary statistics */}
      {totalPicks > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-sky-400" />
              Total Predictions
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-slate-100">{totalPicks}</div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-400 animate-pulse" />
              Exact Scores (+3)
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-amber-400">{exactScores}</div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Winner/Outcome (+1)
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-emerald-400">{correctOutcomes}</div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-slate-500" />
              Wrong / Pending
            </div>
            <div className="mt-2 text-3xl font-bold font-mono text-slate-400">
              {incorrectPicks} <span className="text-slate-600 text-sm font-normal">/ {pendingPicks} pnd</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs and prediction history list */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-slate-950/50 p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-sky-400" />
            Your Predictions
          </h2>

          {/* Filter tabs */}
          {totalPicks > 0 && (
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "all"
                    ? "bg-sky-500/20 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({totalPicks})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "pending"
                    ? "bg-sky-500/20 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Pending ({pendingPicks})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "completed"
                    ? "bg-sky-500/20 text-sky-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Graded ({totalPicks - pendingPicks})
              </button>
            </div>
          )}
        </div>

        {/* Prediction List Content */}
        <div className="p-4 sm:p-6 divide-y divide-white/5 space-y-4">
          {totalPicks === 0 ? (
            <div className="text-center py-12 px-4">
              <Target className="h-12 w-12 text-slate-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-200">No predictions yet</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                Predict scores for upcoming matches to earn points and climb the global leaderboard!
              </p>
              <Link
                href="/fixtures"
                className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all text-xs active:scale-[0.98] shadow-md shadow-amber-500/10"
              >
                <Calendar className="h-4 w-4" />
                View Upcoming Fixtures
              </Link>
            </div>
          ) : filteredPredictions.length === 0 ? (
            <div className="text-center py-12 text-slate-500 italic">
              No predictions match the selected filter.
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {filteredPredictions.map((pred) => {
                const liveData = getScore(pred.matchId);
                const actualHomeScore = liveData?.homeScore ?? pred.match.homeScore;
                const actualAwayScore = liveData?.awayScore ?? pred.match.awayScore;
                const status = liveData?.status ?? pred.match.status;
                const isLive = status === "LIVE" || status === "HALF_TIME";
                
                return (
                  <div
                    key={pred.id}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isLive
                        ? "border-red-500/20 bg-gradient-to-r from-red-500/5 via-slate-900/30 to-slate-900/30 shadow-[0_4px_16px_rgba(239,68,68,0.04)]"
                        : "border-white/5 bg-slate-900/20 hover:border-white/10 hover:bg-slate-900/40"
                    } p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}
                  >
                    {/* Left details (Match Stage + Date/Time + Location) */}
                    <div className="flex flex-col gap-1.5 md:w-48 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                          {stageName(pred.match.stage, pred.match.groupId)}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Match #{pred.match.matchNumber}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-300 font-medium">
                        <KickoffTime utcIso={pred.match.kickoffUtc} showAbbr={true} />
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <MapPin className="h-3 w-3 text-slate-600 shrink-0" />
                        <span className="truncate">{pred.match.venue.city}, {pred.match.venue.country}</span>
                      </div>
                    </div>

                    {/* Center Teams Matchup and Predicted/Actual Scores */}
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
                      {/* Home Team */}
                      <div className="flex items-center justify-end gap-2.5 text-right w-full sm:w-2/5 max-w-[160px]">
                        <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate">{pred.match.homeTeam?.name ?? "TBD"}</span>
                        {pred.match.homeTeam?.flagUrl && (
                          <img
                            src={pred.match.homeTeam.flagUrl}
                            alt={pred.match.homeTeam.name}
                            className="h-4 w-6 object-cover rounded shadow-sm border border-white/10"
                          />
                        )}
                      </div>

                      {/* Score comparison display */}
                      <div className="flex flex-col items-center justify-center shrink-0 min-w-[80px]">
                        {status === "SCHEDULED" ? (
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest py-1 px-3 bg-slate-950/40 rounded-lg border border-white/5">vs</span>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className={`font-mono font-extrabold text-lg sm:text-xl ${isLive ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "text-slate-100"}`}>
                              {actualHomeScore ?? 0} – {actualAwayScore ?? 0}
                            </span>
                            {isLive && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 uppercase tracking-wider animate-pulse mt-0.5">
                                Live {liveData?.minute && `• ${liveData.minute}'`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center justify-start gap-2.5 text-left w-full sm:w-2/5 max-w-[160px]">
                        {pred.match.awayTeam?.flagUrl && (
                          <img
                            src={pred.match.awayTeam.flagUrl}
                            alt={pred.match.awayTeam.name}
                            className="h-4 w-6 object-cover rounded shadow-sm border border-white/10"
                          />
                        )}
                        <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate">{pred.match.awayTeam?.name ?? "TBD"}</span>
                      </div>
                    </div>

                    {/* Right Details (Your prediction, Points status, Edit Button) */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:w-44 shrink-0 border-t border-white/5 pt-3 md:border-t-0 md:pt-0">
                      {/* Your Prediction Badge */}
                      <div className="flex flex-col items-start md:items-end">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Your Pick</span>
                        <span className="font-mono text-sm font-bold text-sky-300 bg-sky-500/5 px-2.5 py-1 rounded-xl border border-sky-500/10 mt-0.5">
                          {pred.homeScore} – {pred.awayScore}
                        </span>
                      </div>

                      {/* Result / Points Badge / Edit Trigger */}
                      <div className="flex items-center gap-2">
                        {pred.pointsEarned === 3 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs font-bold text-amber-400">
                            <Trophy className="h-3.5 w-3.5" />
                            +3 pts Exact
                          </span>
                        )}
                        {pred.pointsEarned === 1 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            +1 pt Winner
                          </span>
                        )}
                        {pred.pointsEarned === 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-white/5 text-xs font-bold text-slate-400">
                            <XCircle className="h-3.5 w-3.5" />
                            0 pts
                          </span>
                        )}
                        {pred.pointsEarned === null && (
                          <>
                            {status === "SCHEDULED" ? (
                              <button
                                onClick={() => setEditingPrediction(pred)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] border border-white/5 text-xs font-bold text-slate-200 transition-all cursor-pointer"
                              >
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs font-bold text-sky-400 animate-pulse">
                                <Clock className="h-3.5 w-3.5" />
                                Pending
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Prediction Modal */}
      {editingPrediction && editingPrediction.match.homeTeam && editingPrediction.match.awayTeam && (
        <PredictionModal
          isOpen={editingPrediction !== null}
          onClose={() => setEditingPrediction(null)}
          matchId={editingPrediction.matchId}
          homeTeamName={editingPrediction.match.homeTeam.name}
          awayTeamName={editingPrediction.match.awayTeam.name}
          homeFlagUrl={editingPrediction.match.homeTeam.flagUrl}
          awayFlagUrl={editingPrediction.match.awayTeam.flagUrl}
          initialHomeScore={editingPrediction.homeScore}
          initialAwayScore={editingPrediction.awayScore}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
