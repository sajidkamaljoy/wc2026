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
  const [streamedLiveIds, setStreamedLiveIds] = useState<string[]>([]);
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

  // Fetch live matches from streamed.pk periodically
  useEffect(() => {
    let active = true;
    const fetchLiveStreams = async () => {
      try {
        const res = await fetch("/api/watch/live");
        if (!res.ok) throw new Error("Failed to fetch live streams");
        const data = await res.json();
        if (active) {
          if (data.liveMatchIds && Array.isArray(data.liveMatchIds)) {
            setStreamedLiveIds(data.liveMatchIds);
          }
        }
      } catch (err) {
        console.error("Error fetching streamed live matches:", err);
      }
    };

    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 30000); // check every 30s

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (matches.length === 0) return;

    const findActiveMatch = () => {
      // Helper function to sort matching games by kickoffUtc desc, then matchNumber desc to get the latest one
      const sortByLatest = (list: MatchWithTeams[]) => {
        return [...list].sort((a, b) => {
          const timeDiff = new Date(b.kickoffUtc).getTime() - new Date(a.kickoffUtc).getTime();
          if (timeDiff !== 0) return timeDiff;
          return b.matchNumber - a.matchNumber;
        });
      };

      // 1. Check if there are live matches on streamed.pk first
      if (streamedLiveIds.length > 0) {
        const found = matches.filter((m) => streamedLiveIds.includes(m.id));
        if (found.length > 0) {
          return sortByLatest(found)[0];
        }
      }

      // 2. Check live scores status next
      const liveScoreIds = scores
        .filter((s) => s.status === "LIVE" || s.status === "HALF_TIME")
        .map((s) => s.matchId);
      if (liveScoreIds.length > 0) {
        const found = matches.filter((m) => liveScoreIds.includes(m.id));
        if (found.length > 0) {
          return sortByLatest(found)[0];
        }
      }

      // 3. Fallback: Check if any match is currently running in its scheduled time window (2-hour window after kickoff)
      const now = new Date();
      const runningMatches = matches.filter((m) => {
        const liveData = scores.find((s) => s.matchId === m.id);
        const status = liveData?.status ?? m.status;
        if (status === "FINISHED") return false;

        const kickoff = new Date(m.kickoffUtc);
        const end = new Date(kickoff.getTime() + 2 * 60 * 60 * 1000);
        return now >= kickoff && now <= end;
      });

      if (runningMatches.length > 0) {
        return sortByLatest(runningMatches)[0];
      }

      return null;
    };

    const resolved = findActiveMatch();
    if (resolved?.id !== activeMatch?.id) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setActiveMatch(resolved);
      }, 0);
    }
  }, [matches, scores, streamedLiveIds, activeMatch?.id]);

  if (!mounted) return null;

  // Render active World Cup match if found
  if (activeMatch) {
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


  // Standby Offline Placeholder
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-4 md:p-5 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-slate-700 animate-fade-in mb-8">
      {/* Background glow overlay */}
      <div className="absolute -inset-px -z-10 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-30 blur-lg rounded-2xl" />

      {/* Left Column: Details */}
      <div className="flex flex-col gap-1 text-center md:text-left">
        <div className="flex items-center gap-2 justify-center md:justify-start">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-600 mr-1.5 animate-pulse" />
            Offline
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Live Broadcast Center
          </span>
        </div>

        <h3 className="font-extrabold text-sm text-slate-100 mt-1 uppercase tracking-wide">
          No Live Streams Active
        </h3>
        <p className="text-xs text-slate-400">
          Real-time video broadcasts and fan cheering meters will activate here as soon as matches kickoff.
        </p>
      </div>

      {/* Right Column: Action Button */}
      <Link
        href="/watch"
        className="px-5 py-2.5 rounded-xl font-bold text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-md bg-slate-950 border border-white/10 hover:bg-slate-900 text-slate-300 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
      >
        <Tv className="h-3.5 w-3.5 text-slate-500" />
        <span>Go to Live Player</span>
      </Link>
    </div>
  );
}
