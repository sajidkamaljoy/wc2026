"use client";

import { useState, useEffect } from "react";
import type { SquadResponse, Player, PositionType } from "@/types";
import { PlayerCard } from "./PlayerCard";
import { Loader2, Users, CheckCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface Props {
  teamId: string;
}

const POSITION_LABELS: Record<PositionType, string> = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

export function SquadView({ teamId }: Props) {
  const [squad, setSquad] = useState<SquadResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/teams/${teamId}/squad`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch squad data");
        return r.json();
      })
      .then((d) => {
        if (active && d) {
          setSquad(d);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setError("Could not load squad details. Please try again later.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <span className="text-sm font-medium tracking-wide">Loading team squad...</span>
      </div>
    );
  }

  if (error || !squad) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-950/20">
        <Users className="h-10 w-10 text-slate-600" />
        <span className="text-sm font-semibold text-slate-500">{error || "Squad details unavailable"}</span>
      </div>
    );
  }

  // Group players by position
  const playersByPosition: Record<PositionType, Player[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  };

  squad.players.forEach((p) => {
    if (playersByPosition[p.position]) {
      playersByPosition[p.position].push(p);
    }
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Squad Status Banner */}
      <div className="w-full">
        {squad.squadStatus === "CONFIRMED" && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.03)]">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="font-bold text-emerald-400 tracking-wide">Official Squad Confirmed</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                This squad is officially submitted to FIFA. All 26 players are confirmed for the tournament roster.
              </p>
            </div>
          </div>
        )}

        {squad.squadStatus === "PRELIMINARY" && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.03)] animate-pulse-subtle">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="font-bold text-amber-400 tracking-wide">Preliminary Squad Released</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Provisional squad announced. Roster is subject to final cuts before the FIFA deadline on June 2, 2026.
              </p>
            </div>
          </div>
        )}

        {squad.squadStatus === "TBD" && (
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-900/[0.08] backdrop-blur-sm">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/30 text-slate-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h4 className="font-bold text-slate-400 tracking-wide">Squad Unannounced</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Official squad selections are pending. Placeholder listings are displayed below for tactical reference.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Squad Sections by Position */}
      <div className="flex flex-col gap-10">
        {(["GK", "DEF", "MID", "FWD"] as PositionType[]).map((pos) => {
          const list = playersByPosition[pos];
          if (!list || list.length === 0) return null;

          return (
            <div key={pos} className="flex flex-col gap-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
                <h3 className="font-bold text-slate-300 tracking-wide text-sm md:text-base">
                  {POSITION_LABELS[pos]}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-500">
                  {list.length}
                </span>
              </div>

              {/* Grid of Players */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {list.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
