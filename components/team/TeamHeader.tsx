"use client";

import Link from "next/link";
import { ArrowLeft, Trophy, Compass, ShieldAlert, Award } from "lucide-react";

export interface TeamWithStats {
  id: string;
  name: string;
  shortName: string;
  flagUrl: string | null;
  groupId: string;
  confederation: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

interface Props {
  team: TeamWithStats;
  groupPosition: number;
}

export function TeamHeader({ team, groupPosition }: Props) {
  const goalDifference = team.goalsFor - team.goalsAgainst;
  const isThirdPlacePosition = groupPosition === 3;
  const isEliminatedPosition = groupPosition > 3;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Sleek Breadcrumb/Back link */}
      <Link
        href="/groups"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-white transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Standings
      </Link>

      {/* Main Glassmorphic Profile Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-md shadow-2xl p-6 md:p-8 flex flex-col lg:flex-row items-stretch justify-between gap-6">
        
        {/* Subtle Decorative Glow Backgrounds */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left Side: Brand Identity (Flag + Text) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 z-10">
          {/* Country Flag Container with Hover Scale */}
          <div className="relative shrink-0 group self-start sm:self-auto">
            {team.flagUrl ? (
              <img
                src={team.flagUrl}
                alt={`${team.name} flag`}
                className="w-24 h-16 sm:w-28 sm:h-18 object-cover rounded-xl shadow-lg border border-white/10 transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-24 h-16 sm:w-28 sm:h-18 bg-slate-800 rounded-xl border border-white/5 flex items-center justify-center">
                <Compass className="h-8 w-8 text-slate-600" />
              </div>
            )}
            <span className="absolute -top-2 -right-2 text-[10px] font-bold font-mono text-slate-400 bg-slate-950/90 border border-white/10 px-2 py-0.5 rounded shadow-md uppercase tracking-wider">
              {team.id}
            </span>
          </div>

          {/* Text Info */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-slate-100 via-white to-slate-300 bg-clip-text">
                {team.name}
              </h1>
              {/* Confederation Badge */}
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 uppercase">
                {team.confederation}
              </span>
            </div>

            {/* Subtitles: Group + Qualification Status */}
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-400 font-medium">
              <span>Group {team.groupId}</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span>Currently</span>
                <span className="text-amber-400 font-bold font-mono">
                  {ordinal(groupPosition)}
                </span>
                <span>place</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              
              {/* Seeding Zone Badge */}
              {isEliminatedPosition ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-wide">
                  <ShieldAlert className="h-3 w-3" />
                  Not Qualified
                </span>
              ) : isThirdPlacePosition ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                  <Award className="h-3 w-3" />
                  Conditional
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  <Trophy className="h-3 w-3" />
                  Seeding Zone
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Mini-Standings Dashboard (Compact Stats Grid) */}
        <div className="grid grid-cols-6 sm:grid-cols-6 lg:flex items-center gap-2 lg:gap-3 bg-slate-950/30 border border-white/5 rounded-2xl p-4 md:p-5 shrink-0 z-10">
          {/* Played Pill */}
          <div className="flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-slate-900/30 border border-white/5 min-w-[48px] sm:min-w-[60px] lg:min-w-[64px]">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">PL</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-200 mt-0.5 font-mono">{team.played}</span>
          </div>

          {/* Won Pill */}
          <div className="flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-slate-900/30 border border-white/5 min-w-[48px] sm:min-w-[60px] lg:min-w-[64px]">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">W</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5 font-mono">{team.won}</span>
          </div>

          {/* Drawn Pill */}
          <div className="flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-slate-900/30 border border-white/5 min-w-[48px] sm:min-w-[60px] lg:min-w-[64px]">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">D</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-400 mt-0.5 font-mono">{team.drawn}</span>
          </div>

          {/* Lost Pill */}
          <div className="flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-slate-900/30 border border-white/5 min-w-[48px] sm:min-w-[60px] lg:min-w-[64px]">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">L</span>
            <span className="text-sm sm:text-base font-extrabold text-red-400 mt-0.5 font-mono">{team.lost}</span>
          </div>

          {/* Goal Difference Pill */}
          <div className="flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-slate-900/30 border border-white/5 min-w-[48px] sm:min-w-[60px] lg:min-w-[64px]">
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">GD</span>
            <span className={`text-sm sm:text-base font-extrabold mt-0.5 font-mono ${
              goalDifference > 0 ? "text-emerald-400" : goalDifference < 0 ? "text-red-400" : "text-slate-200"
            }`}>
              {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
            </span>
          </div>

          {/* Points Pill (Highlighted) */}
          <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/15 min-w-[54px] sm:min-w-[68px] lg:min-w-[72px] shadow-[0_0_12px_rgba(245,158,11,0.05)]">
            <span className="text-[10px] font-black tracking-wider text-amber-500/80 uppercase">PTS</span>
            <span className="text-base sm:text-lg font-black text-amber-400 mt-0.5 font-mono">{team.points}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
