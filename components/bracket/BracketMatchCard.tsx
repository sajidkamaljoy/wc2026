"use client";

import { Award, ChevronRight } from "lucide-react";
import { Team } from "@/hooks/useBracketPrediction";

interface Props {
  matchNumber: number;
  stageLabel: string;
  homeTeam: Team | null;
  awayTeam: Team | null;
  winnerId?: string;
  onPickWinner: (matchNumber: number, winnerId: string) => void;
  homePlaceholder?: string;
  awayPlaceholder?: string;
}

export function BracketMatchCard({
  matchNumber,
  stageLabel,
  homeTeam,
  awayTeam,
  winnerId,
  onPickWinner,
  homePlaceholder = "TBD",
  awayPlaceholder = "TBD",
}: Props) {
  const isHomeSelected = homeTeam && winnerId === homeTeam.id;
  const isAwaySelected = awayTeam && winnerId === awayTeam.id;
  const hasSelected = isHomeSelected || isAwaySelected;

  const handleSelectHome = () => {
    if (homeTeam) onPickWinner(matchNumber, homeTeam.id);
  };

  const handleSelectAway = () => {
    if (awayTeam) onPickWinner(matchNumber, awayTeam.id);
  };

  return (
    <div
      className={`flex flex-col rounded-xl border p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300 relative ${
        hasSelected
          ? "border-amber-500/40 shadow-[0_0_15px_rgba(251,191,36,0.15)] bg-slate-900/80"
          : "border-white/5 hover:border-white/10 hover:bg-slate-900/60"
      }`}
    >
      <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 mb-3 border-b border-white/5 pb-2">
        <span>Match {matchNumber}</span>
        <span className="text-amber-400 font-mono tracking-wider">{stageLabel}</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Home Team */}
        <button
          onClick={handleSelectHome}
          disabled={!homeTeam}
          className={`flex items-center justify-between p-2 rounded-lg transition-all text-left ${
            homeTeam
              ? "cursor-pointer hover:bg-white/5"
              : "cursor-not-allowed opacity-50"
          } ${
            isHomeSelected
              ? "bg-amber-500/10 text-white font-bold ring-1 ring-amber-500/30"
              : "text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {homeTeam?.flagUrl ? (
              <img
                src={homeTeam.flagUrl}
                alt=""
                className="h-5 w-7 object-cover rounded-sm shadow-sm shrink-0 border border-white/5"
              />
            ) : (
              <div className="h-5 w-7 bg-slate-800 rounded-sm border border-white/5 shrink-0 flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase">
                TBD
              </div>
            )}
            <span className="text-sm truncate font-medium">
              {homeTeam ? homeTeam.name : homePlaceholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isHomeSelected && (
              <Award className="h-4 w-4 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
            )}
            {homeTeam && !isHomeSelected && (
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400" />
            )}
          </div>
        </button>

        {/* Away Team */}
        <button
          onClick={handleSelectAway}
          disabled={!awayTeam}
          className={`flex items-center justify-between p-2 rounded-lg transition-all text-left ${
            awayTeam
              ? "cursor-pointer hover:bg-white/5"
              : "cursor-not-allowed opacity-50"
          } ${
            isAwaySelected
              ? "bg-amber-500/10 text-white font-bold ring-1 ring-amber-500/30"
              : "text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {awayTeam?.flagUrl ? (
              <img
                src={awayTeam.flagUrl}
                alt=""
                className="h-5 w-7 object-cover rounded-sm shadow-sm shrink-0 border border-white/5"
              />
            ) : (
              <div className="h-5 w-7 bg-slate-800 rounded-sm border border-white/5 shrink-0 flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase">
                TBD
              </div>
            )}
            <span className="text-sm truncate font-medium">
              {awayTeam ? awayTeam.name : awayPlaceholder}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAwaySelected && (
              <Award className="h-4 w-4 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
            )}
            {awayTeam && !isAwaySelected && (
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
