"use client";

import { useState, useEffect, useRef } from "react";
import { FixtureFilters } from "./FixtureFilters";
import { FixtureCard } from "./FixtureCard";
import { TimezoneBanner } from "../TimezoneBanner";
import type { MatchWithTeams } from "@/types";
import { getLocalDateLabel, isToday } from "@/lib/timezone";
import { useFavorites } from "@/hooks/useFavorites";
import { Loader2, Calendar } from "lucide-react";

export function FixtureList({ initialMatches = [] }: { initialMatches?: MatchWithTeams[] }) {
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [userPredictions, setUserPredictions] = useState<Record<string, { homeScore: number, awayScore: number }>>({});
  
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const { favorites, isLoaded: favoritesLoaded } = useFavorites();
  const isFirstMount = useRef(true);

  // Load the list of teams once on mount
  useEffect(() => {
    fetch("/api/teams")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.teams) {
          setTeams(data.teams);
        }
      })
      .catch((err) => console.error("Failed to fetch teams list:", err));

    // Fetch user predictions
    fetch("/api/predictions")
      .then(res => res.json())
      .then(data => {
        if (data.predictions) {
          const map: Record<string, any> = {};
          data.predictions.forEach((p: any) => {
            map[p.matchId] = p;
          });
          setUserPredictions(map);
        }
      })
      .catch((err) => console.error("Failed to fetch predictions:", err));
  }, []);

  useEffect(() => {
    // If it's the first mount and we have initialMatches, skip the client fetch
    if (isFirstMount.current && initialMatches.length > 0) {
      isFirstMount.current = false;
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setVisibleCount(10);

    const params = new URLSearchParams({ sort: "date" });
    if (stageFilter) {
      params.set("stage", stageFilter);
    }
    if (teamFilter) {
      params.set("team", teamFilter);
    }

    fetch(`/api/fixtures?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch fixtures");
        return r.json();
      })
      .then((data) => {
        if (active && data && data.matches) {
          setMatches(data.matches);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [stageFilter, teamFilter]);

  // Apply favorites filtering in-memory
  const displayedMatches = favoritesOnly
    ? matches.filter(
      (m) =>
        (m.homeTeam?.id && favorites.includes(m.homeTeam.id)) ||
        (m.awayTeam?.id && favorites.includes(m.awayTeam.id))
    )
    : matches;

  // Reset scroll page whenever favorites filter changes
  useEffect(() => {
    setVisibleCount(10);
  }, [favoritesOnly]);

  // Sort matches so that today's matches are first, then other matches chronologically
  const sortedMatches = [...displayedMatches].sort((a, b) => {
    const aToday = isToday(a.kickoffUtc);
    const bToday = isToday(b.kickoffUtc);
    if (aToday && !bToday) return -1;
    if (!aToday && bToday) return 1;
    // Otherwise keep chronological order
    return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
  });

  // Slice matches according to visibleCount for infinite scroll
  const slicedMatches = sortedMatches.slice(0, visibleCount);

  // Group by date
  const grouped = groupByDate(slicedMatches);

  return (
    <div className="w-full">
      {/* Timezone Info */}
      <TimezoneBanner />

      {/* Filter Toolbar */}
      <FixtureFilters
        stage={stageFilter}
        onStageChange={setStageFilter}
        team={teamFilter}
        onTeamChange={setTeamFilter}
        teams={teams}
        favoritesOnly={favoritesOnly}
        onFavoritesOnlyChange={setFavoritesOnly}
      />

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <span className="text-sm font-medium tracking-wide">Loading tournament fixtures…</span>
        </div>
      ) : displayedMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
          <Calendar className="h-10 w-10 text-slate-600" />
          <span className="text-sm font-semibold text-center px-4">
            {favoritesOnly && favorites.length === 0
              ? "You haven't starred any teams yet! Star some teams in standings or matches."
              : "No matches found matching the criteria."}
          </span>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, dayMatches]) => {
            const isDayToday = dayMatches.length > 0 && isToday(dayMatches[0].kickoffUtc);
            return (
              <div key={dateLabel} className="space-y-3">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400/90 pl-1 border-l-2 border-amber-400 flex items-center gap-2">
                  <span>{dateLabel}</span>
                  {isDayToday && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-black text-amber-400 uppercase tracking-wider">
                      Today
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"})
                  </span>
                </h2>
                <div className="grid gap-3">
                  {dayMatches.map((m) => (
                    <FixtureCard key={m.id} match={m} userPrediction={userPredictions[m.id]} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {displayedMatches.length > visibleCount && (
            <div className="flex justify-center pt-8">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 10, displayedMatches.length))}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] active:duration-75"
              >
                <span>Load More Matches</span>
                <span className="text-xs font-normal text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-200">
                  ({displayedMatches.length - visibleCount} remaining)
                </span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function groupByDate(matches: MatchWithTeams[]): Record<string, MatchWithTeams[]> {
  return matches.reduce<Record<string, MatchWithTeams[]>>((acc, m) => {
    try {
      const dateLabel = getLocalDateLabel(m.kickoffUtc);
      (acc[dateLabel] ??= []).push(m);
    } catch {
      (acc["Date Unavailable"] ??= []).push(m);
    }
    return acc;
  }, {});
}
