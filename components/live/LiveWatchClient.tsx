"use client";

import { useState, useEffect, useRef } from "react";
import type { MatchWithTeams } from "@/types";
import {
  Tv,
  Flame,
  Volume2,
  VolumeX,
  Maximize2
} from "lucide-react";

interface Props {
  match: MatchWithTeams;
}

export function LiveWatchClient({ match }: Props) {
  // Interaction: Cheering Poll
  const [cheerVotes, setCheerVotes] = useState({ home: 62, away: 38 });
  const [hasCheered, setHasCheered] = useState<"home" | "away" | null>(null);
  const [mounted, setMounted] = useState(false);

  // Sound / Player settings
  const [isMuted, setIsMuted] = useState(true);
  const [showMuteTooltip, setShowMuteTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
    setShowMuteTooltip(true);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowMuteTooltip(false);
    }, 4500);
  };

  // Load initial cheer state on mount
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setMounted(true);
      const storedCheer = localStorage.getItem(`wc2026_cheer_${match.id}`);
      if (storedCheer === "home" || storedCheer === "away") {
        setHasCheered(storedCheer);
        setCheerVotes((prev) => ({
          home: storedCheer === "home" ? prev.home + 1 : prev.home,
          away: storedCheer === "away" ? prev.away + 1 : prev.away,
        }));
      }
    }, 0);

    return () => {
      clearTimeout(initTimer);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [match.id]);

  const handleCheer = (side: "home" | "away") => {
    if (hasCheered) return;
    setHasCheered(side);
    localStorage.setItem(`wc2026_cheer_${match.id}`, side);
    setCheerVotes((prev) => ({
      ...prev,
      [side]: prev[side] + 1
    }));
  };

  const totalVotes = cheerVotes.home + cheerVotes.away;
  const homePercent = Math.round((cheerVotes.home / totalVotes) * 100) || 50;
  const awayPercent = 100 - homePercent;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      {/* ── Title Header ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Tv className="h-6 w-6 text-amber-400 shrink-0" />
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase">
            Live Stream — {match.homeTeam?.name} vs {match.awayTeam?.name}
          </h1>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] font-extrabold text-red-400 uppercase tracking-widest animate-pulse">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
          </span>
          Live Match
        </span>
      </div>

      {/* ── Video Player Container ── */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-2xl transition-all duration-300 hover:border-white/20 shadow-red-500/5 hover:shadow-red-500/10">
        {/* Ambient glow backlight */}
        <div className="absolute -inset-px -z-10 bg-gradient-to-tr from-amber-500/5 via-transparent to-red-500/5 opacity-50 blur-lg rounded-2xl" />
        
        {/* Aspect Ratio Embed */}
        <div className="relative aspect-video w-full bg-slate-950">
          <iframe
            title="Mexico vs South Africa Player"
            marginHeight={0}
            marginWidth={0}
            src="https://embed.st/embed/admin/ppv-mexico-vs-south-africa/1"
            scrolling="no"
            allowFullScreen={true}
            allow="autoplay; encrypted-media; picture-in-picture;"
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>

        {/* Quick Player Bar */}
        <div className="bg-slate-950/90 px-4 py-3 flex items-center justify-between border-t border-white/5 backdrop-blur text-slate-400 text-xs">
          <div className="flex items-center gap-3 relative">
            <button
              onClick={handleToggleMute}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 font-semibold bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-white/5"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4 text-red-400" />
                  <span>Unmute Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                  <span>Audio Active</span>
                </>
              )}
            </button>
            
            {showMuteTooltip && (
              <div className="absolute left-0 bottom-full mb-2 w-64 p-3 rounded-xl bg-slate-900 border border-amber-500/20 text-amber-400 text-[11px] font-medium shadow-xl backdrop-blur animate-fade-in z-20">
                💡 <span className="font-bold">Audio Control Tip:</span> Cross-origin browser policies prevent external pages from altering the stream sound. Please click the speaker icon in the player&apos;s control bar directly to unmute!
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              1080p Stream HD
            </span>
            <button 
              onClick={() => {
                const iframe = document.querySelector("iframe");
                if (iframe) {
                  try {
                    iframe.requestFullscreen();
                  } catch {
                    alert("To view full screen, please click the full-screen button inside the player controls.");
                  }
                }
              }}
              className="hover:text-white transition-colors cursor-pointer"
              title="Expand to Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Interactive Cheering Poll ── */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm tracking-wide flex items-center gap-1.5 uppercase">
            <Flame className="h-4 w-4 text-amber-500 shrink-0" />
            Fan Cheer Meter
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-950/50 border border-white/5 px-2 py-0.5 rounded">
            Live Voting
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-6 w-full rounded-full bg-slate-950/80 overflow-hidden border border-white/5 flex items-center justify-between px-3 text-[10px] font-extrabold font-mono tracking-wider shadow-inner">
          {/* Home Team Bar */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600/40 via-emerald-500/30 to-emerald-400/20 border-r border-emerald-500/30 transition-all duration-700"
            style={{ width: `${homePercent}%` }}
          />
          {/* Away Team Bar */}
          <div
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-yellow-600/40 via-amber-500/30 to-amber-400/20 border-l border-amber-500/30 transition-all duration-700"
            style={{ width: `${awayPercent}%` }}
          />

          <span className="z-10 text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold">
            {match.homeTeam?.name || "Home"} {homePercent}%
          </span>
          <span className="z-10 text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-semibold">
            {awayPercent}% {match.awayTeam?.name || "Away"}
          </span>
        </div>

        {/* Voting buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleCheer("home")}
            disabled={!!hasCheered}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
              hasCheered === "home"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 cursor-default"
                : hasCheered
                ? "bg-slate-900/20 border-white/5 text-slate-500 cursor-not-allowed opacity-50"
                : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.98]"
            }`}
          >
            {match.homeTeam?.flagUrl ? (
              <img src={match.homeTeam.flagUrl} alt="" className="h-3 w-5 object-cover rounded shadow-sm inline shrink-0" />
            ) : "⚽"}
            <span>Cheer {match.homeTeam?.name || "Home"}</span>
          </button>
          
          <button
            onClick={() => handleCheer("away")}
            disabled={!!hasCheered}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer flex items-center justify-center gap-2 ${
              hasCheered === "away"
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400 cursor-default"
                : hasCheered
                ? "bg-slate-900/20 border-white/5 text-slate-500 cursor-not-allowed opacity-50"
                : "bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20 active:scale-[0.98]"
            }`}
          >
            {match.awayTeam?.flagUrl ? (
              <img src={match.awayTeam.flagUrl} alt="" className="h-3 w-5 object-cover rounded shadow-sm inline shrink-0" />
            ) : "⚽"}
            <span>Cheer {match.awayTeam?.name || "Away"}</span>
          </button>
        </div>
        
        {mounted && hasCheered && (
          <p className="text-[10px] text-slate-400 text-center italic pt-0.5 animate-fade-in">
            Thanks for cheering! Your vote has been recorded on this device.
          </p>
        )}
      </div>
    </div>
  );
}
