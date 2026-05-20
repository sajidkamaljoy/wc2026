"use client";

import { useState, useEffect } from "react";
import type { TeamPathway } from "@/types";
import { Trophy, Compass, ArrowRight, ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const ROUND_STYLES: Record<
  string,
  { border: string; bg: string; text: string; shadow: string }
> = {
  ROUND_OF_32: {
    border: "border-blue-500/40 focus-within:border-blue-500",
    bg: "from-blue-500/[0.03] to-slate-900/40",
    text: "text-blue-400",
    shadow: "shadow-[0_0_12px_rgba(59,130,246,0.15)]",
  },
  ROUND_OF_16: {
    border: "border-purple-500/40 focus-within:border-purple-500",
    bg: "from-purple-500/[0.03] to-slate-900/40",
    text: "text-purple-400",
    shadow: "shadow-[0_0_12px_rgba(168,85,247,0.15)]",
  },
  QUARTER_FINAL: {
    border: "border-orange-500/40 focus-within:border-orange-500",
    bg: "from-orange-500/[0.03] to-slate-900/40",
    text: "text-orange-400",
    shadow: "shadow-[0_0_12px_rgba(249,115,22,0.15)]",
  },
  SEMI_FINAL: {
    border: "border-yellow-500/40 focus-within:border-yellow-500",
    bg: "from-yellow-500/[0.03] to-slate-900/40",
    text: "text-yellow-400",
    shadow: "shadow-[0_0_12px_rgba(234,179,8,0.155)]",
  },
  FINAL: {
    border: "border-emerald-500/40 focus-within:border-emerald-500",
    bg: "from-emerald-500/[0.05] to-slate-900/40",
    text: "text-emerald-400",
    shadow: "shadow-[0_0_15px_rgba(16,185,129,0.25)]",
  },
};

interface Props {
  teamId: string;
}

export function PathwayBracket({ teamId }: Props) {
  const [pathway, setPathway] = useState<TeamPathway | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/teams/${teamId}/pathway`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch pathway");
        return r.json();
      })
      .then((d) => {
        if (active && d && d.pathway) {
          setPathway(d.pathway);
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
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <span className="text-sm font-medium tracking-wide">Calculating tournament pathway…</span>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400 border border-dashed border-red-500/10 rounded-3xl bg-red-500/5">
        <ShieldAlert className="h-10 w-10 text-red-500" />
        <span className="text-sm font-bold">Team not found or pathway calculation failed.</span>
        <Link href="/groups" className="text-xs text-amber-400 hover:underline flex items-center gap-1 mt-2">
          <ArrowLeft className="h-3 w-3" /> Back to Standings
        </Link>
      </div>
    );
  }

  const isThirdPlace = pathway.currentGroupPosition === 3;
  const isLower = typeof pathway.currentGroupPosition === "number" && pathway.currentGroupPosition > 3;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/groups"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Groups
      </Link>

      {/* Header Profile Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm shadow-sm mb-8">
        <div className="flex items-center gap-4.5">
          {pathway.team.flagUrl ? (
            <img
              src={pathway.team.flagUrl}
              alt={pathway.team.name}
              className="h-12 w-20 object-cover rounded-lg shadow-lg border border-white/10"
            />
          ) : (
            <div className="h-12 w-20 bg-slate-800 rounded-lg border border-white/5" />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {pathway.team.name}
              <span className="text-xs font-bold font-mono text-slate-500 uppercase bg-slate-950 border border-white/5 px-2 py-0.5 rounded">
                {pathway.team.id}
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-0.5">
              Group {pathway.team.groupId} ·{" "}
              {pathway.currentGroupPosition === "TBD" ? (
                <span className="text-slate-500 italic">Position TBD</span>
              ) : (
                <span className="text-amber-400 font-semibold">
                  Currently {ordinal(Number(pathway.currentGroupPosition))} place
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action badge */}
        <div className="flex items-center">
          {isLower ? (
            <span className="px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              Not Qualified Zone
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Trophy className="h-4 w-4 shrink-0" />
              Potential Seeding
            </span>
          )}
        </div>
      </div>

      {/* Seeding warnings */}
      {isThirdPlace && (
        <div className="flex gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300/80 text-xs font-medium max-w-2xl mb-8 leading-relaxed">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Third-place qualification conditional:</strong> {pathway.team.name} is currently third in Group {pathway.team.groupId}. Under World Cup rules, only the 8 best third-place teams out of 12 groups advance. If they do not rank among the top 8, they will be eliminated.
          </div>
        </div>
      )}

      {isLower && (
        <div className="flex gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300/80 text-xs font-medium max-w-2xl mb-8 leading-relaxed">
          <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-red-300">Elimination Zone:</strong> {pathway.team.name} is currently fourth in Group {pathway.team.groupId}. Under official rules, fourth-place teams are eliminated. The bracket shown below is calculated assuming they improve standings to qualify.
          </div>
        </div>
      )}

      {/* Pathway Timeline */}
      <div className="relative border-l border-white/5 pl-6 sm:pl-8 space-y-6 max-w-2xl ml-4 sm:ml-6">
        {pathway.rounds.map((round, index) => {
          const isLast = index === pathway.rounds.length - 1;
          const styles = ROUND_STYLES[round.round] ?? {
            border: "border-slate-700/50",
            bg: "from-slate-800/10 to-slate-900/40",
            text: "text-slate-400",
            shadow: "",
          };

          return (
            <div key={round.round} className="relative group">
              {/* Timeline Bullet Node */}
              <div className={`absolute -left-[35px] sm:-left-[43px] top-5 h-4.5 w-4.5 rounded-full border-2 bg-slate-950 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                round.round === "FINAL" ? "border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "border-slate-700"
              }`}>
                {round.round === "FINAL" && <Trophy className="h-2 w-2 text-emerald-400" />}
              </div>

              {/* Step Card */}
              <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${styles.border} ${styles.bg} ${styles.shadow} p-5 transition-all duration-300 hover:scale-[1.01] hover:bg-slate-900/50`}>
                <div className="flex items-center justify-between mb-3.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest ${styles.text}`}>
                    {round.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono bg-slate-950/60 border border-white/5 px-2 py-0.5 rounded">
                    {round.bracketSlot}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <Compass className="h-3.5 w-3.5 text-slate-500" />
                    Potential Seeding Opponent(s)
                  </div>
                  
                  <ul className="grid gap-2">
                    {round.possibleOpponents.map((opp, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-200 bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2.5 hover:border-white/10 transition-colors"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate">{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Seeding Description Legend */}
      <div className="mt-12 p-5 rounded-2xl border border-white/5 bg-slate-900/20 text-xs text-slate-400 max-w-2xl leading-relaxed">
        <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-1.5 text-sm">
          <Trophy className="h-4 w-4 text-amber-400 shrink-0" /> How the Seeding Pathway works
        </h3>
        <p className="mb-2">
          This seeding companion matches actual FIFA group results against original seeding tables from the <strong>FIFA World Cup 2026 Seeding Guidelines</strong>.
        </p>
        <p>
          As standings shift dynamically based on real-time scores, the seed pathways update on-the-fly to visualize potential round combinations all the way to the Final at MetLife Stadium.
        </p>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
