"use client";

import { useState, useEffect } from "react";
import { FixtureFilters } from "./FixtureFilters";
import { FixtureCard } from "./FixtureCard";
import { TimezoneBanner } from "../TimezoneBanner";
import type { MatchWithTeams } from "@/types";
import { getLocalDateLabel } from "@/lib/timezone";
import { Loader2, Calendar } from "lucide-react";

export function FixtureList() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [sort, setSort] = useState<"date" | "team">("date");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [teamFilter, setTeamFilter] = useState<string>("");
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const params = new URLSearchParams({ sort });
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
  }, [sort, stageFilter, teamFilter]);

  // Group by date for "date" sort
  const grouped = groupByDate(matches, sort);

  return (
    <div className="w-full">
      {/* Timezone Info */}
      <TimezoneBanner />

      {/* Filter Toolbar */}
      <FixtureFilters
        sort={sort}
        onSortChange={setSort}
        stage={stageFilter}
        onStageChange={setStageFilter}
        team={teamFilter}
        onTeamChange={setTeamFilter}
        teams={teams}
      />

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <span className="text-sm font-medium tracking-wide">Loading tournament fixtures…</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
          <Calendar className="h-10 w-10 text-slate-600" />
          <span className="text-sm font-semibold">No matches found matching the criteria.</span>
        </div>
      ) : sort === "date" ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, dayMatches]) => (
            <div key={dateLabel} className="space-y-3">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400/90 pl-1 border-l-2 border-amber-400 flex items-center gap-2">
                <span>{dateLabel}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({dayMatches.length} {dayMatches.length === 1 ? "match" : "matches"})
                </span>
              </h2>
              <div className="grid gap-3">
                {dayMatches.map((m) => (
                  <FixtureCard key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {matches.map((m) => (
            <FixtureCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function groupByDate(
  matches: MatchWithTeams[],
  sort: string
): Record<string, MatchWithTeams[]> {
  if (sort !== "date") return {};
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
