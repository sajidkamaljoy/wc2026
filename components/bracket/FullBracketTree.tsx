"use client";

import { useMemo } from "react";
import { Trophy, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Props {
  matches: any[];
}

const STAGES = [
  { key: "ROUND_OF_32", label: "Round of 32" },
  { key: "ROUND_OF_16", label: "Round of 16" },
  { key: "QUARTER_FINAL", label: "Quarter-finals" },
  { key: "SEMI_FINAL", label: "Semi-finals" },
  { key: "THIRD_PLACE", label: "Third place play-off" },
  { key: "FINAL", label: "Final" },
];

export function FullBracketTree({ matches }: Props) {
  const matchesByStage = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const match of matches) {
      if (!map.has(match.stage)) {
        map.set(match.stage, []);
      }
      map.get(match.stage)!.push(match);
    }
    return map;
  }, [matches]);

  return (
    <div className="flex flex-col gap-12 w-full">
      {STAGES.map((stage) => {
        const stageMatches = matchesByStage.get(stage.key) || [];
        if (stageMatches.length === 0) return null;

        return (
          <div key={stage.key} className="flex flex-col gap-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 flex items-center gap-2 border-b border-white/10 pb-3">
              {stage.key === "FINAL" && <Trophy className="h-5 w-5" />}
              {stage.label}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stageMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchCard({ match }: { match: any }) {
  const homeDisplay = match.homeTeam?.name || match.homePlaceholder || "TBD";
  const awayDisplay = match.awayTeam?.name || match.awayPlaceholder || "TBD";

  return (
    <div className="flex flex-col rounded-xl border border-white/5 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/80 hover:border-white/10">
      <div className="text-[10px] uppercase font-bold text-slate-500 mb-3 flex justify-end items-center">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {format(new Date(match.kickoffUtc), "MMM d, HH:mm")}
        </span>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             {match.homeTeam?.flagUrl ? (
                <img src={match.homeTeam.flagUrl} alt="" className="h-5 w-7 object-cover rounded-sm shadow-sm" />
             ) : (
                <div className="h-5 w-7 bg-slate-800 rounded-sm border border-white/5" />
             )}
             <span className="text-sm font-semibold text-slate-200 truncate max-w-[120px]">{homeDisplay}</span>
          </div>
          <span className="font-bold font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
             {match.homeScore ?? "-"}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             {match.awayTeam?.flagUrl ? (
                <img src={match.awayTeam.flagUrl} alt="" className="h-5 w-7 object-cover rounded-sm shadow-sm" />
             ) : (
                <div className="h-5 w-7 bg-slate-800 rounded-sm border border-white/5" />
             )}
             <span className="text-sm font-semibold text-slate-200 truncate max-w-[120px]">{awayDisplay}</span>
          </div>
          <span className="font-bold font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
             {match.awayScore ?? "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
