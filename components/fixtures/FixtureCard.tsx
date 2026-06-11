"use client";

import { useState, useEffect } from "react";
import { useLiveScores } from "@/components/live/useLiveScores";
import type { MatchWithTeams } from "@/types";
import { LiveScoreBadge } from "@/components/live/LiveScoreBadge";
import { KickoffTime } from "./KickoffTime";
import { Countdown } from "./Countdown";
import { useFavorites } from "@/hooks/useFavorites";
import { MapPin, Trophy, Star, Tv } from "lucide-react";
import Link from "next/link";
import { PredictionModal } from "./PredictionModal";

interface Props {
  match: MatchWithTeams;
  userPrediction?: { homeScore: number; awayScore: number };
}

export function FixtureCard({ match, userPrediction }: Props) {
  const { getScore } = useLiveScores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localPrediction, setLocalPrediction] = useState(userPrediction);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocalPrediction(userPrediction);
    }, 0);
    return () => clearTimeout(timer);
  }, [userPrediction]);
  const liveData = getScore(match.id);

  const homeScore = liveData?.homeScore ?? match.homeScore;
  const awayScore = liveData?.awayScore ?? match.awayScore;
  const status = liveData?.status ?? match.status;

  const isLive = status === "LIVE" || status === "HALF_TIME";
  const isKnockout = !match.groupId;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${isLive
        ? "border-red-500/30 bg-gradient-to-r from-red-500/5 via-slate-900/40 to-slate-900/40 shadow-[0_4px_20px_rgba(239,68,68,0.08)]"
        : "border-white/5 bg-slate-900/40 hover:border-white/10 hover:bg-slate-900/60 shadow-sm"
      } flex flex-col w-full`}>

      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 w-full">

        {/* Group or Knockout Stage Badge */}
        <div className="flex items-center gap-2 shrink-0 md:w-36 justify-center md:justify-start">
          {isKnockout ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              <Trophy className="h-3 w-3 shrink-0" />
              {stageName(match.stage)}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
              Group {match.groupId}
            </span>
          )}
        </div>

        {/* Versus Display */}
        <div className="flex items-center justify-center flex-1 w-full gap-4 sm:gap-6">
          {/* Home Team */}
          <TeamDisplay
            team={match.homeTeam}
            placeholder={match.homePlaceholder}
            align="right"
          />

          {/* Score or Local Time display */}
          <div className="flex flex-col items-center justify-center min-w-[100px] shrink-0">
            {status === "SCHEDULED" ? (
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/5 shadow-inner text-center">
                <KickoffTime utcIso={match.kickoffUtc} showAbbr={true} />
                <Countdown utcIso={match.kickoffUtc} />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className={`font-mono font-extrabold text-2xl sm:text-3xl tracking-tight ${isLive ? "text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "text-white"
                  }`}>
                  {homeScore ?? 0} <span className="text-slate-600 font-sans text-xl font-normal mx-0.5">–</span> {awayScore ?? 0}
                </span>
              </div>
            )}
            <LiveScoreBadge status={status} minute={liveData?.minute} />
          </div>

          {/* Away Team */}
          <TeamDisplay
            team={match.awayTeam}
            placeholder={match.awayPlaceholder}
            align="left"
          />
        </div>

        {/* Match Details (Venue) */}
        <div className="flex flex-col items-center md:items-end justify-center gap-1 shrink-0 md:w-44 text-slate-500 text-[11px] font-medium">
          <span className="flex items-center gap-1 text-center md:text-right hover:text-slate-400 transition-colors">
            <MapPin className="h-3 w-3 text-slate-600 shrink-0" />
            {match.venue.city}, {match.venue.country}
          </span>
        </div>
      </div>

      {((status === "SCHEDULED" && match.homeTeam && match.awayTeam) || isLive || match.matchNumber === 1) && (
        <div className="w-full mt-3 pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2 px-4 pb-1.5">
          {status === "SCHEDULED" && match.homeTeam && match.awayTeam && (
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex-1 py-2 px-6 rounded-xl font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${localPrediction
                  ? "bg-sky-500/10 border border-sky-400/20 text-sky-400 hover:bg-sky-500/25 hover:border-sky-400/35 active:scale-[0.98]"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold border border-amber-500/10 active:scale-[0.98]"
                }`}
            >
              {localPrediction ? (
                <>
                  <span>Edit Prediction</span>
                  <span className="bg-sky-400/20 text-sky-300 font-mono font-bold px-2 py-0.5 rounded-full text-[10px]">
                    {localPrediction.homeScore} – {localPrediction.awayScore}
                  </span>
                </>
              ) : (
                <span>Make a Prediction</span>
              )}
            </button>
          )}

          {(isLive || match.matchNumber === 1) && (
            <Link
              href="/watch"
              className="flex-1 py-2 px-6 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-sm bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white active:scale-[0.98]"
            >
              <Tv className="h-3.5 w-3.5" />
              <span>Watch Live Stream</span>
              {isLive && (
                <span className="relative flex h-1.5 w-1.5 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
              )}
            </Link>
          )}
        </div>
      )}

      {status === "SCHEDULED" && match.homeTeam && match.awayTeam && (
        <PredictionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          matchId={match.id}
          homeTeamName={match.homeTeam.name}
          awayTeamName={match.awayTeam.name}
          homeFlagUrl={match.homeTeam.flagUrl}
          awayFlagUrl={match.awayTeam.flagUrl}
          initialHomeScore={localPrediction?.homeScore}
          initialAwayScore={localPrediction?.awayScore}
          onSave={(homeScore, awayScore) => {
            setLocalPrediction({ homeScore, awayScore });
          }}
        />
      )}
    </div>
  );
}

function TeamDisplay({
  team,
  placeholder,
  align,
}: {
  team: { id: string; name: string; flagUrl: string | null } | null;
  placeholder: string | null;
  align: "left" | "right";
}) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const name = team?.name ?? placeholder ?? "TBD";
  const hasTeam = !!team;
  const isFav = team ? isFavorite(team.id) : false;

  const starIndicator = team && isLoaded && isFav && (
    <div
      className="p-1 shrink-0"
      title="Favorited Team"
    >
      <Star
        className="h-3.5 w-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
      />
    </div>
  );

  const content = (
    <div className={`flex items-center gap-2 flex-1 max-w-[150px] sm:max-w-[200px] ${align === "right" ? "justify-end text-right" : "justify-start text-left"
      }`}>
      {align === "right" && starIndicator}
      {align === "right" && team?.flagUrl && (
        <img
          src={team.flagUrl}
          alt={name}
          className="h-4.5 w-7 object-cover rounded shadow-md border border-white/10 group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      )}
      <span className={`font-semibold text-xs sm:text-sm truncate transition-colors ${hasTeam ? "text-slate-100 group-hover:text-white" : "text-slate-500 italic"
        }`}>
        {name}
      </span>
      {align === "left" && team?.flagUrl && (
        <img
          src={team.flagUrl}
          alt={name}
          className="h-4.5 w-7 object-cover rounded shadow-md border border-white/10 group-hover:scale-105 transition-transform"
          loading="lazy"
        />
      )}
      {align === "left" && starIndicator}
    </div>
  );

  // If there's an actual team, wrap in a Link to team details, otherwise keep static
  if (team) {
    return (
      <Link href={`/teams/${team.id}`} className="hover:opacity-85 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

function stageName(stage: string): string {
  const map: Record<string, string> = {
    ROUND_OF_32: "Round of 32",
    ROUND_OF_16: "Round of 16",
    QUARTER_FINAL: "Quarter-Finals",
    SEMI_FINAL: "Semi-Finals",
    THIRD_PLACE: "3rd Place Match",
    FINAL: "Final",
  };
  return map[stage] ?? stage;
}
