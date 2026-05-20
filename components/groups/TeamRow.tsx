"use client";

import Link from "next/link";
import type { TeamStanding } from "@/types";
import { ArrowRight, Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface Props {
  team: TeamStanding;
  position: number;
}

export function TeamRow({ team, position }: Props) {
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
  const isFav = isFavorite(team.id);

  const handleStarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(team.id);
  };

  const starButton = isLoaded && (
    <button
      onClick={handleStarClick}
      className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
    >
      <Star
        className={`h-3.5 w-3.5 transition-all ${
          isFav
            ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
            : "text-slate-600 hover:text-slate-400"
        }`}
      />
    </button>
  );

  // Highlights for qualification zones
  // Top 2: Qualify (Green)
  // 3rd: Possible qualification (Yellow)
  // 4th: Disqualified (Red / Default slate)
  const zoneClass =
    position <= 2
      ? "hover:bg-emerald-500/[0.04] transition-colors"
      : position === 3
      ? "hover:bg-amber-500/[0.04] transition-colors"
      : "hover:bg-slate-500/[0.04] transition-colors";

  const dotColor =
    position <= 2
      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
      : position === 3
      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
      : "bg-slate-600";

  return (
    <tr
      className={`group border-b border-white/[0.04] transition-colors cursor-pointer ${zoneClass}`}
    >
      {/* Position and Team */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 font-mono text-xs text-slate-500 group-hover:text-slate-300 font-semibold">
            {position}
          </div>
          {starButton}
          <Link href={`/teams/${team.id}`} className="flex items-center gap-2.5 flex-1">
            {team.flagUrl ? (
              <img
                src={team.flagUrl}
                alt={team.name}
                className="h-4.5 w-7 object-cover rounded shadow border border-white/10 group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <div className="h-4.5 w-7 bg-slate-800 rounded border border-white/5" />
            )}
            <span className="font-semibold text-slate-200 group-hover:text-white transition-colors text-sm truncate">
              {team.name}
            </span>
            {/* Custom Indicator Dot */}
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          </Link>
        </div>
      </td>

      {/* Stats Columns */}
      <td className="text-center font-medium font-mono text-xs text-slate-300 px-2 py-3">
        {team.played}
      </td>
      <td className="text-center font-medium font-mono text-xs text-slate-400 px-2 py-3 hidden sm:table-cell">
        {team.won}
      </td>
      <td className="text-center font-medium font-mono text-xs text-slate-400 px-2 py-3 hidden sm:table-cell">
        {team.drawn}
      </td>
      <td className="text-center font-medium font-mono text-xs text-slate-400 px-2 py-3 hidden sm:table-cell">
        {team.lost}
      </td>
      <td className="text-center font-medium font-mono text-xs text-slate-300 px-2 py-3">
        {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
      </td>
      
      {/* Points */}
      <td className="text-center font-bold font-mono text-sm text-amber-400 px-2 py-3">
        {team.points}
      </td>

      {/* Row arrow indicator */}
      <td className="w-8 text-right pr-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRight className="h-4 w-4 text-amber-400 ml-auto" />
      </td>
    </tr>
  );
}
