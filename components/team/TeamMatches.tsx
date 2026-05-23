"use client";

import { useState, useEffect } from "react";
import { FixtureCard } from "@/components/fixtures/FixtureCard";
import type { MatchWithTeams } from "@/types";
import { Calendar } from "lucide-react";

interface Props {
  matches: MatchWithTeams[];
  teamName: string;
}

export function TeamMatches({ matches, teamName }: Props) {
  const [userPredictions, setUserPredictions] = useState<Record<string, { homeScore: number; awayScore: number }>>({});

  useEffect(() => {
    // Fetch user predictions
    fetch("/api/predictions")
      .then((res) => res.json())
      .then((data) => {
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <span className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/20 shrink-0">
            <Calendar className="h-5 w-5" />
          </span>
          Matches & Results
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xl">
          Track upcoming schedule, live scores, and past match results for {teamName}.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500 border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
          <Calendar className="h-8 w-8 text-slate-600" />
          <span className="text-sm font-semibold text-center px-4">
            No matches scheduled for this team.
          </span>
        </div>
      ) : (
        <div className="grid gap-4">
          {matches.map((match) => (
            <FixtureCard
              key={match.id}
              match={match}
              userPrediction={userPredictions[match.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
