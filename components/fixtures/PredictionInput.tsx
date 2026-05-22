"use client";

import { useState } from "react";
import { useUserSession } from "@/hooks/useUserSession";

interface Props {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  initialHomeScore?: number;
  initialAwayScore?: number;
}

export function PredictionInput({ matchId, homeTeamName, awayTeamName, initialHomeScore, initialAwayScore }: Props) {
  const { deviceId } = useUserSession();
  const [homeScore, setHomeScore] = useState<number>(initialHomeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(initialAwayScore ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(initialHomeScore !== undefined);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaved(false);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore, awayScore }),
      });
      if (res.ok) setSaved(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show the input if a device session is active
  if (!deviceId) return null;

  return (
    <div className="w-full mt-4 pt-4 border-t border-slate-800/50 flex flex-col items-center gap-3 bg-slate-900/20 rounded-xl p-3 transition-colors hover:bg-slate-900/40">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <span>Fan Pick'em</span>
        {saved && <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">Saved</span>}
      </div>
      
      <div className="flex items-center justify-center gap-4 sm:gap-8 text-slate-200 w-full">
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-xs truncate max-w-[100px] text-slate-300">{homeTeamName}</span>
          <div className="flex items-center gap-2 bg-slate-950/80 rounded-xl p-1 border border-white/5 shadow-inner">
            <button onClick={() => setHomeScore(Math.max(0, homeScore - 1))} className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">-</button>
            <span className="font-mono w-6 text-center text-lg">{homeScore}</span>
            <button onClick={() => setHomeScore(homeScore + 1)} className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">+</button>
          </div>
        </div>
        
        <span className="text-slate-600 font-mono text-sm mt-6">vs</span>
        
        <div className="flex flex-col items-center gap-2 flex-1">
          <span className="text-xs truncate max-w-[100px] text-slate-300">{awayTeamName}</span>
          <div className="flex items-center gap-2 bg-slate-950/80 rounded-xl p-1 border border-white/5 shadow-inner">
            <button onClick={() => setAwayScore(Math.max(0, awayScore - 1))} className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">-</button>
            <span className="font-mono w-6 text-center text-lg">{awayScore}</span>
            <button onClick={() => setAwayScore(awayScore + 1)} className="w-7 h-7 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">+</button>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="mt-2 px-6 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all shadow-md shadow-sky-900/20"
      >
        {isSubmitting ? "Saving..." : saved ? "Update Pick" : "Lock in Pick"}
      </button>
    </div>
  );
}
