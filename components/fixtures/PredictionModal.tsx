"use client";

import { useEffect } from "react";
import { X, Trophy } from "lucide-react";
import { PredictionInput } from "./PredictionInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeFlagUrl?: string | null;
  awayFlagUrl?: string | null;
  initialHomeScore?: number;
  initialAwayScore?: number;
  onSave?: (homeScore: number, awayScore: number) => void;
}

export function PredictionModal({
  isOpen,
  onClose,
  matchId,
  homeTeamName,
  awayTeamName,
  homeFlagUrl,
  awayFlagUrl,
  initialHomeScore,
  initialAwayScore,
  onSave,
}: Props) {
  // ESC key handler to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-[0_10px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Predict Score</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Flag Visualizer */}
        <div className="flex items-center justify-between gap-6 py-4 px-2 bg-slate-950/40 rounded-2xl border border-white/5 mb-4">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 flex-1 text-center">
            {homeFlagUrl ? (
              <img
                src={homeFlagUrl}
                alt={homeTeamName}
                className="h-10 w-16 object-cover rounded-lg shadow-md border border-white/10"
              />
            ) : (
              <div className="h-10 w-16 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">TBD</div>
            )}
            <span className="font-semibold text-xs text-slate-200 truncate max-w-[100px]">{homeTeamName}</span>
          </div>

          <span className="text-slate-600 font-mono text-sm font-bold uppercase tracking-wider">vs</span>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1 text-center">
            {awayFlagUrl ? (
              <img
                src={awayFlagUrl}
                alt={awayTeamName}
                className="h-10 w-16 object-cover rounded-lg shadow-md border border-white/10"
              />
            ) : (
              <div className="h-10 w-16 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">TBD</div>
            )}
            <span className="font-semibold text-xs text-slate-200 truncate max-w-[100px]">{awayTeamName}</span>
          </div>
        </div>

        {/* Prediction Input Form */}
        <div className="w-full">
          <PredictionInput
            matchId={matchId}
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
            initialHomeScore={initialHomeScore}
            initialAwayScore={initialAwayScore}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
}
