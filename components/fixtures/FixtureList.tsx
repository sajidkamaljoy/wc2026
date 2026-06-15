"use client";

import { useState, useEffect, useRef } from "react";
import { FixtureFilters } from "./FixtureFilters";
import { FixtureCard } from "./FixtureCard";
import { TimezoneBanner } from "../TimezoneBanner";
import type { MatchWithTeams } from "@/types";
import { getLocalDateLabel, isToday } from "@/lib/timezone";
import { useFavorites } from "@/hooks/useFavorites";
import { Loader2, Calendar, ChevronUp, ChevronDown } from "lucide-react";

export function FixtureList({ initialMatches = [] }: { initialMatches?: MatchWithTeams[] }) {
  const [matches, setMatches] = useState<MatchWithTeams[]>(initialMatches);
  const [stageFilter, setStageFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(initialMatches.length === 0);
  const [userPredictions, setUserPredictions] = useState<Record<string, { homeScore: number, awayScore: number }>>({});
  
  const [mounted, setMounted] = useState(false);
  const [visiblePreviousCount, setVisiblePreviousCount] = useState<number>(0);
  const [visibleNextCount, setVisibleNextCount] = useState<number>(0);

  const { favorites, isLoaded: favoritesLoaded } = useFavorites();
  const isFirstMount = useRef(true);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    setVisiblePreviousCount(0);
    setVisibleNextCount(0);

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
    setVisiblePreviousCount(0);
    setVisibleNextCount(0);
  }, [favoritesOnly]);

  // Sort matches chronologically
  const chronMatches = [...displayedMatches].sort(
    (a, b) => new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
  );

  const userTZ = typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
    timeZone: userTZ,
  }).format(new Date());

  const previousMatches: MatchWithTeams[] = [];
  const todayMatches: MatchWithTeams[] = [];
  const nextMatches: MatchWithTeams[] = [];

  chronMatches.forEach((m) => {
    const matchStr = new Intl.DateTimeFormat("en-CA", {
      year: "numeric", month: "2-digit", day: "2-digit",
      timeZone: userTZ,
    }).format(new Date(m.kickoffUtc));

    if (matchStr === todayStr) {
      todayMatches.push(m);
    } else if (matchStr < todayStr) {
      previousMatches.push(m);
    } else {
      nextMatches.push(m);
    }
  });

  const slicedPrevious = visiblePreviousCount === 0
    ? []
    : previousMatches.slice(-visiblePreviousCount);

  const slicedNext = nextMatches.slice(0, visibleNextCount);

  const groupedPrevious = groupByDate(slicedPrevious);
  const groupedToday = groupByDate(todayMatches);
  const groupedNext = groupByDate(slicedNext);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <span className="text-sm font-medium tracking-wide">Loading tournament fixtures…</span>
      </div>
    );
  }

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
          {/* Previous Matches Control */}
          {previousMatches.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
              {visiblePreviousCount < previousMatches.length ? (
                <button
                  onClick={() => setVisiblePreviousCount(prev => Math.min(prev + 5, previousMatches.length))}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 active:duration-75 group"
                >
                  <ChevronUp className="h-4 w-4 text-amber-400 group-hover:-translate-y-0.5 transition-transform" />
                  <span>
                    {visiblePreviousCount === 0 ? "Show Previous Matches" : "Show 5 More Previous Matches"}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full group-hover:bg-slate-700 transition-colors">
                    ({previousMatches.length - visiblePreviousCount} remaining)
                  </span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium">All previous matches shown</span>
              )}

              {visiblePreviousCount > 0 && (
                <button
                  onClick={() => setVisiblePreviousCount(0)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 underline underline-offset-4 decoration-slate-600 hover:decoration-slate-400 cursor-pointer transition-colors"
                >
                  Collapse Past Matches
                </button>
              )}
            </div>
          )}

          {/* Previous Matches List */}
          {visiblePreviousCount > 0 && Object.keys(groupedPrevious).length > 0 && (
            <div className="space-y-8 border-b border-white/5 pb-8">
              {Object.entries(groupedPrevious).map(([dateLabel, dayMatches]) => (
                <div key={dateLabel} className="space-y-3 animate-fade-in">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400/90 pl-1 border-l-2 border-slate-500 flex items-center gap-2">
                    <span>{dateLabel}</span>
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
              ))}
            </div>
          )}

          {/* Today's Matches List / Placeholder */}
          <div className="space-y-3">
            {todayMatches.length > 0 ? (
              Object.entries(groupedToday).map(([dateLabel, dayMatches]) => (
                <div key={dateLabel} className="space-y-3">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 pl-1 border-l-2 border-amber-400 flex items-center gap-2">
                    <span>{dateLabel}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-black text-amber-400 uppercase tracking-wider animate-pulse">
                      Today
                    </span>
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
              ))
            ) : (
              <div className="space-y-3">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 pl-1 border-l-2 border-amber-400 flex items-center gap-2">
                  <span>{getLocalDateLabel(new Date().toISOString())}</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-black text-amber-400 uppercase tracking-wider animate-pulse">
                    Today
                  </span>
                </h2>
                <div className="flex flex-col items-center justify-center py-8 gap-2.5 text-slate-400 border border-dashed border-white/5 rounded-2xl bg-slate-900/10">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-400">No matches scheduled for today</span>
                </div>
              </div>
            )}
          </div>

          {/* Next Matches List */}
          {visibleNextCount > 0 && Object.keys(groupedNext).length > 0 && (
            <div className="space-y-8 border-t border-white/5 pt-8">
              {Object.entries(groupedNext).map(([dateLabel, dayMatches]) => (
                <div key={dateLabel} className="space-y-3 animate-fade-in">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400/90 pl-1 border-l-2 border-slate-500 flex items-center gap-2">
                    <span>{dateLabel}</span>
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
              ))}
            </div>
          )}

          {/* Next Matches Control */}
          {nextMatches.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
              {visibleNextCount < nextMatches.length ? (
                <button
                  onClick={() => setVisibleNextCount(prev => Math.min(prev + 5, nextMatches.length))}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-200 hover:text-white transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 active:duration-75 group"
                >
                  <ChevronDown className="h-4 w-4 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
                  <span>
                    {visibleNextCount === 0 ? "Show Next Matches" : "Show 5 More Next Matches"}
                  </span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full group-hover:bg-slate-700 transition-colors">
                    ({nextMatches.length - visibleNextCount} remaining)
                  </span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 font-medium">All next matches shown</span>
              )}

              {visibleNextCount > 0 && (
                <button
                  onClick={() => setVisibleNextCount(0)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 underline underline-offset-4 decoration-slate-600 hover:decoration-slate-400 cursor-pointer transition-colors"
                >
                  Collapse Future Matches
                </button>
              )}
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
