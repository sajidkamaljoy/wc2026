"use client";

import { useState, useEffect, useRef } from "react";
import type { MatchWithTeams } from "@/types";
import { useLiveScores } from "./useLiveScores";
import { Tv, MapPin } from "lucide-react";
import Link from "next/link";

interface Props {
  matches: MatchWithTeams[];
}

export function LiveMatchBanner({ matches = [] }: Props) {
  const [activeMatch, setActiveMatch] = useState<MatchWithTeams | null>(null);
  const [mounted, setMounted] = useState(false);
  const { scores } = useLiveScores();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (matches.length === 0) return;

    const findActiveMatch = () => {
      // 1. Check live scores status first
      const liveScoreMatch = scores.find((s) => s.status === "LIVE" || s.status === "HALF_TIME");
      if (liveScoreMatch) {
        const found = matches.find((m) => m.id === liveScoreMatch.matchId);
        if (found) return found;
      }

      // 2. Check time window (kickoff has passed, within 2 hours, status is not FINISHED)
      const now = new Date();
      const timeMatch = matches.find((m) => {
        const kickoff = new Date(m.kickoffUtc);
        const end = new Date(kickoff.getTime() + 2 * 60 * 60 * 1000); // 2 hours window
        return now >= kickoff && now <= end && m.status !== "FINISHED";
      });
      if (timeMatch) return timeMatch;

      return null;
    };

    const resolved = findActiveMatch();
    if (resolved?.id !== activeMatch?.id) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setActiveMatch(resolved);
      }, 0);
    }
  }, [matches, scores, activeMatch?.id]);

  if (!mounted || !activeMatch) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-slate-900/60 p-4 md:p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-red-500 animate-fade-in mb-8">
      {/* Background glow overlay */}
      <div className="absolute -inset-px -z-10 bg-gradient-to-tr from-red-500/5 via-transparent to-transparent opacity-50 blur-lg rounded-2xl" />

      {/* Left Column: Match Details */}
      <div className="flex flex-col gap-1 text-center md:text-left">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[9px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
            <span className="relative flex h-1.5 w-1.5 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
            </span>
            Live Now
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Match #{activeMatch.matchNumber}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-1">
          {/* Home Team */}
          <div className="flex items-center gap-1.5">
            {activeMatch.homeTeam?.flagUrl && (
              <img src={activeMatch.homeTeam.flagUrl} alt="" className="h-3.5 w-5.5 object-cover rounded shadow-sm border border-white/5" />
            )}
            <span className="font-extrabold text-sm text-slate-100">{activeMatch.homeTeam?.name}</span>
          </div>
          
          <span className="text-slate-500 font-bold text-xs">vs</span>

          {/* Away Team */}
          <div className="flex items-center gap-1.5">
            {activeMatch.awayTeam?.flagUrl && (
              <img src={activeMatch.awayTeam.flagUrl} alt="" className="h-3.5 w-5.5 object-cover rounded shadow-sm border border-white/5" />
            )}
            <span className="font-extrabold text-sm text-slate-100">{activeMatch.awayTeam?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-center md:justify-start mt-0.5">
          <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>{activeMatch.venue.name}, {activeMatch.venue.city}</span>
        </div>
      </div>

      {/* Right Column: Action Button */}
      <Link
        href={`/watch?matchNumber=${activeMatch.matchNumber}`}
        className="px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white shrink-0 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Tv className="h-3.5 w-3.5 animate-pulse" />
        <span>Watch Live Stream</span>
      </Link>
    </div>
  );
}
