"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity, ShieldAlert, Award, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TeamOption {
  id: string;
  name: string;
  flagUrl: string | null;
}

interface H2HMatch {
  id: string;
  outcome: "W" | "D" | "L";
  opponent: string;
  score: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

interface H2HData {
  stats: {
    totalPlayed: number;
    teamAWins: number;
    teamBWins: number;
    draws: number;
  };
  teamA: {
    id: string;
    name: string;
    flagUrl: string | null;
  };
  teamB: {
    id: string;
    name: string;
    flagUrl: string | null;
  };
  history: H2HMatch[];
}

export function HeadToHead() {
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [teamAId, setTeamAId] = useState<string>("ARG");
  const [teamBId, setTeamBId] = useState<string>("BRA");
  const [h2hData, setH2HData] = useState<H2HData | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingH2H, setLoadingH2H] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch the list of teams on mount
  useEffect(() => {
    fetch("/api/teams")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        return res.json();
      })
      .then((data) => {
        if (data && data.teams) {
          setTeams(data.teams);
        }
      })
      .catch((err) => {
        console.error("Error fetching teams list:", err);
        setError("Unable to load team list.");
      })
      .finally(() => setLoadingTeams(false));
  }, []);

  // 2. Fetch H2H statistics when team selections change
  useEffect(() => {
    if (teamAId === teamBId) {
      setH2HData(null);
      return;
    }

    let active = true;
    setLoadingH2H(true);
    setError(null);

    fetch(`/api/h2h?teamAId=${teamAId}&teamBId=${teamBId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load head-to-head records");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setH2HData(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching H2H details:", err);
        if (active) {
          setError("Failed to fetch match history between these teams.");
        }
      })
      .finally(() => {
        if (active) {
          setLoadingH2H(false);
        }
      });

    return () => {
      active = false;
    };
  }, [teamAId, teamBId]);

  const selectedTeamA = teams.find((t) => t.id === teamAId);
  const selectedTeamB = teams.find((t) => t.id === teamBId);

  // Calculate percentages for the stats split bar
  const total = h2hData?.stats.totalPlayed ?? 0;
  const winAPct = total > 0 ? ((h2hData?.stats.teamAWins ?? 0) / total) * 100 : 0;
  const drawPct = total > 0 ? ((h2hData?.stats.draws ?? 0) / total) * 100 : 0;
  const winBPct = total > 0 ? ((h2hData?.stats.teamBWins ?? 0) / total) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Selection Dropdowns Panel ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm">
        {/* Team A Select */}
        <div className="flex flex-col gap-2 w-full md:w-5/12">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            First Team
          </label>
          <div className="flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2">
            {selectedTeamA?.flagUrl && (
              <img
                src={selectedTeamA.flagUrl}
                alt=""
                className="h-5 w-8 object-cover rounded shadow-sm border border-white/10 shrink-0"
              />
            )}
            <select
              value={teamAId}
              disabled={loadingTeams}
              onChange={(e) => setTeamAId(e.target.value)}
              className="w-full bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-950 text-white text-sm">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* VS Spacer */}
        <div className="flex items-center justify-center shrink-0">
          <span className="text-xs font-black tracking-widest text-amber-500/60 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-full uppercase">
            VS
          </span>
        </div>

        {/* Team B Select */}
        <div className="flex flex-col gap-2 w-full md:w-5/12">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Second Team
          </label>
          <div className="flex items-center gap-3 bg-slate-950/60 border border-white/10 rounded-xl px-4 py-2">
            {selectedTeamB?.flagUrl && (
              <img
                src={selectedTeamB.flagUrl}
                alt=""
                className="h-5 w-8 object-cover rounded shadow-sm border border-white/10 shrink-0"
              />
            )}
            <select
              value={teamBId}
              disabled={loadingTeams}
              onChange={(e) => setTeamBId(e.target.value)}
              className="w-full bg-transparent text-sm text-white font-medium focus:outline-none cursor-pointer"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-950 text-white text-sm">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Same Team Warning */}
      {teamAId === teamBId && (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-amber-500/10 bg-amber-500/5 text-amber-300 text-sm font-medium">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
          <span>Please select two different teams to view their historical head-to-head records.</span>
        </div>
      )}

      {/* ── loading / error / results rendering ── */}
      {loadingH2H ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 border border-white/5 rounded-2xl bg-slate-900/20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <span className="text-sm font-medium tracking-wide">Fetching historical records...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 rounded-2xl border border-red-500/10 bg-red-500/5 text-red-400 text-sm font-medium">
          <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      ) : h2hData ? (
        <div className="flex flex-col gap-6">
          
          {/* ── 1. Statistics Overview Card ── */}
          <div className="flex flex-col gap-6 p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-white/5 pb-3">
              <Award className="h-5 w-5 text-amber-400" />
              <h2 className="text-base uppercase tracking-wider font-extrabold">All-Time Head-To-Head Stats</h2>
            </div>

            {/* Comparison Flags Row */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              {/* Team A */}
              <div className="flex flex-col items-center gap-2 text-center">
                {h2hData.teamA.flagUrl ? (
                  <img
                    src={h2hData.teamA.flagUrl}
                    alt={h2hData.teamA.name}
                    className="h-12 sm:h-16 w-20 sm:w-28 object-cover rounded-xl shadow-lg border border-white/10 hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="h-12 sm:h-16 w-20 sm:w-28 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                    {h2hData.teamA.id}
                  </div>
                )}
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">{h2hData.teamA.name}</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {h2hData.stats.teamAWins} Wins
                </span>
              </div>

              {/* Total Matches Midpoint */}
              <div className="flex flex-col items-center text-center shrink-0">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">{total}</span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Matches Played</span>
              </div>

              {/* Team B */}
              <div className="flex flex-col items-center gap-2 text-center">
                {h2hData.teamB.flagUrl ? (
                  <img
                    src={h2hData.teamB.flagUrl}
                    alt={h2hData.teamB.name}
                    className="h-12 sm:h-16 w-20 sm:w-28 object-cover rounded-xl shadow-lg border border-white/10 hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="h-12 sm:h-16 w-20 sm:w-28 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                    {h2hData.teamB.id}
                  </div>
                )}
                <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">{h2hData.teamB.name}</span>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  {h2hData.stats.teamBWins} Wins
                </span>
              </div>
            </div>

            {/* Split Bar Graphic */}
            {total > 0 ? (
              <div className="w-full space-y-2 mt-2">
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-850">
                  {h2hData.stats.teamAWins > 0 && (
                    <div
                      style={{ width: `${winAPct}%` }}
                      className="bg-emerald-500 h-full transition-all duration-500"
                      title={`${h2hData.teamA.name} Wins: ${h2hData.stats.teamAWins}`}
                    />
                  )}
                  {h2hData.stats.draws > 0 && (
                    <div
                      style={{ width: `${drawPct}%` }}
                      className="bg-slate-500 h-full transition-all duration-500"
                      title={`Draws: ${h2hData.stats.draws}`}
                    />
                  )}
                  {h2hData.stats.teamBWins > 0 && (
                    <div
                      style={{ width: `${winBPct}%` }}
                      className="bg-amber-400 h-full transition-all duration-500"
                      title={`${h2hData.teamB.name} Wins: ${h2hData.stats.teamBWins}`}
                    />
                  )}
                </div>
                {/* Labels Row */}
                <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono px-1.5">
                  <span className="text-emerald-400">{winAPct.toFixed(0)}% {h2hData.teamA.id}</span>
                  <span className="text-slate-500">{drawPct.toFixed(0)}% Draws ({h2hData.stats.draws})</span>
                  <span className="text-amber-400">{winBPct.toFixed(0)}% {h2hData.teamB.id}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-2 italic">
                No historical competitive matches found in dataset.
              </div>
            )}
          </div>

          {/* ── 2. Last 10 Appearances Card (MATCHES RECENT FORM UI) ── */}
          {h2hData.history.length > 0 && (
            <div className="flex flex-col gap-4 p-5 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
                <Activity className="h-5 w-5 text-amber-400" />
                <h2 className="text-base uppercase tracking-wider font-extrabold">Last 10 Appearances</h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-2 mb-2 leading-relaxed">
                Chronological timeline of past matches. Results color-coded relative to <strong>{h2hData.teamA.name}</strong>: W (Win) is green, L (Loss) is red, and D (Draw) is grey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {h2hData.history.map((match) => (
                  <div key={match.id} className="flex flex-col items-center min-w-[100px] shrink-0 gap-2 p-2 rounded-xl bg-slate-950/20 border border-white/0 hover:border-white/5 hover:bg-slate-950/40 transition-all">
                    {/* Outcome Circular Badge */}
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-transform duration-300 hover:scale-105 ${
                        match.outcome === "W"
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                          : match.outcome === "D"
                          ? "bg-slate-500/10 border-slate-500/50 text-slate-400"
                          : "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                      }`}
                    >
                      {match.outcome}
                    </div>
                    
                    {/* Match Info Details */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-slate-300">
                        {match.homeTeam === h2hData.teamA.name ? "vs " + h2hData.teamB.id : "@ " + h2hData.teamB.id}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">{match.score}</span>
                      <span className="text-[9px] text-slate-600 mt-1 font-semibold flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 opacity-60" />
                        {format(new Date(match.date), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
