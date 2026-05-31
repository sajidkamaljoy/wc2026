"use client";

import { useState, useMemo } from "react";
import { allocateThirdPlaces, encodePredictionState } from "@/lib/bracket-prediction";
import { BracketMatchCard } from "./BracketMatchCard";
import {
  Trophy,
  LayoutGrid,
  CheckCircle,
  HelpCircle,
  Share2,
  Copy,
  Image,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  flagUrl: string | null;
}

interface Group {
  id: string;
  name: string;
  teams: Team[];
}

interface Props {
  prediction: {
    groupRankings: Record<string, string[]>;
    thirdPlaces: string[];
    knockoutPicks: Record<number, string>;
  };
  groups: Group[];
}

export function SharedBracketView({ prediction, groups }: Props) {
  const [activeTab, setActiveTab] = useState<"bracket" | "groups" | "wildcard">("bracket");
  const [copied, setCopied] = useState(false);

  const { groupRankings, thirdPlaces, knockoutPicks } = prediction;

  const predictionCode = useMemo(() => {
    return encodePredictionState(prediction);
  }, [prediction]);

  // Helper to map team ID to full Team details
  const teamsMap = useMemo(() => {
    const map = new Map<string, Team>();
    for (const g of groups) {
      for (const t of g.teams) {
        map.set(t.id, t);
      }
    }
    return map;
  }, [groups]);

  // Dynamically compute the Round of 32 matches
  const r32Matches = useMemo(() => {
    if (groups.length === 0 || Object.keys(groupRankings).length === 0) return {};

    const thirdPlaceAssignments = allocateThirdPlaces(thirdPlaces);
    const getTeam = (id?: string) => (id ? teamsMap.get(id) || null : null);

    return {
      73: { home: getTeam(groupRankings["A"]?.[1]), away: getTeam(groupRankings["B"]?.[1]) },
      74: { home: getTeam(groupRankings["E"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[74]]?.[2]) },
      75: { home: getTeam(groupRankings["C"]?.[0]), away: getTeam(groupRankings["F"]?.[1]) },
      76: { home: getTeam(groupRankings["F"]?.[0]), away: getTeam(groupRankings["C"]?.[1]) },
      77: { home: getTeam(groupRankings["I"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[77]]?.[2]) },
      78: { home: getTeam(groupRankings["E"]?.[1]), away: getTeam(groupRankings["I"]?.[1]) },
      79: { home: getTeam(groupRankings["A"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[79]]?.[2]) },
      80: { home: getTeam(groupRankings["L"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[80]]?.[2]) },
      81: { home: getTeam(groupRankings["D"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[81]]?.[2]) },
      82: { home: getTeam(groupRankings["D"]?.[1]), away: getTeam(groupRankings[thirdPlaceAssignments[82]]?.[2]) },
      83: { home: getTeam(groupRankings["G"]?.[0]), away: getTeam(groupRankings["H"]?.[1]) },
      84: { home: getTeam(groupRankings["H"]?.[0]), away: getTeam(groupRankings["J"]?.[1]) },
      85: { home: getTeam(groupRankings["J"]?.[0]), away: getTeam(groupRankings["K"]?.[1]) },
      86: { home: getTeam(groupRankings["G"]?.[1]), away: getTeam(groupRankings[thirdPlaceAssignments[86]]?.[2]) },
      87: { home: getTeam(groupRankings["K"]?.[0]), away: getTeam(groupRankings["L"]?.[1]) },
      88: { home: getTeam(groupRankings["B"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[88]]?.[2]) },
    };
  }, [groups, groupRankings, thirdPlaces, teamsMap]);

  // Dynamically compute all downstream knockout matches
  const knockoutMatches = useMemo(() => {
    const matches: Record<number, { home: Team | null; away: Team | null }> = { ...r32Matches } as any;
    const getTeam = (id?: string) => (id ? teamsMap.get(id) || null : null);

    // Round of 16 (89 to 96)
    for (let m = 89; m <= 96; m++) {
      const sourceMatch1 = (m - 89) * 2 + 73;
      const sourceMatch2 = (m - 89) * 2 + 74;
      matches[m] = {
        home: getTeam(knockoutPicks[sourceMatch1]),
        away: getTeam(knockoutPicks[sourceMatch2]),
      };
    }

    // Quarter-finals (97 to 100)
    for (let m = 97; m <= 100; m++) {
      const sourceMatch1 = (m - 97) * 2 + 89;
      const sourceMatch2 = (m - 97) * 2 + 90;
      matches[m] = {
        home: getTeam(knockoutPicks[sourceMatch1]),
        away: getTeam(knockoutPicks[sourceMatch2]),
      };
    }

    // Semi-finals (101 and 102)
    for (let m = 101; m <= 102; m++) {
      const sourceMatch1 = (m - 101) * 2 + 97;
      const sourceMatch2 = (m - 101) * 2 + 98;
      matches[m] = {
        home: getTeam(knockoutPicks[sourceMatch1]),
        away: getTeam(knockoutPicks[sourceMatch2]),
      };
    }

    // Third Place Play-off (103)
    const getLoser = (matchNum: number, winnerId?: string) => {
      const match = matches[matchNum];
      if (!match || !match.home || !match.away || !winnerId) return null;
      return match.home.id === winnerId ? match.away : match.home;
    };
    matches[103] = {
      home: getLoser(101, knockoutPicks[101]),
      away: getLoser(102, knockoutPicks[102]),
    };

    // Final (104)
    matches[104] = {
      home: getTeam(knockoutPicks[101]),
      away: getTeam(knockoutPicks[102]),
    };

    return matches;
  }, [r32Matches, knockoutPicks, teamsMap]);

  const championTeam = useMemo(() => {
    const winnerId = knockoutPicks[104];
    if (!winnerId) return null;
    return teamsMap.get(winnerId) || null;
  }, [knockoutPicks, teamsMap]);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Banner */}
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-lg shadow-amber-500/5 backdrop-blur-md">
        <div className="flex flex-col gap-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-bold text-lg uppercase tracking-wider">
            <Share2 className="h-5 w-5 animate-pulse" />
            Viewing Shared Bracket!
          </div>
          <p className="text-sm text-slate-300 max-w-xl">
            You are viewing a custom bracket prediction for the FIFA World Cup 2026™.{championTeam ? ` They picked **${championTeam.name}** to lift the trophy!` : ""}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <button
            onClick={copyLink}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 font-bold text-slate-950 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 grow sm:grow-0"
          >
            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Link Copied!" : "Copy Share Link"}
          </button>

          <a
            href={`/api/predict/bracket/og?p=${predictionCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl border border-white/10 bg-slate-950 font-bold text-slate-200 hover:bg-slate-900 hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-md flex items-center justify-center gap-2 grow sm:grow-0"
          >
            <Image className="h-4 w-4 text-amber-400" />
            Download Card
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2 scrollbar-none overflow-x-auto pb-px">
        {[
          { key: "bracket", label: "Predicted Knockouts", icon: Trophy },
          { key: "groups", label: "Predicted Group Standings", icon: LayoutGrid },
          { key: "wildcard", label: "Predicted Wildcards", icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "bracket" | "groups" | "wildcard")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {/* Knockouts Tab */}
        {activeTab === "bracket" && (
          <div className="flex flex-col gap-12 w-full">
            {/* Champion Banner */}
            {championTeam && (
              <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-500/40 rounded-3xl max-w-md mx-auto text-center gap-3 shadow-2xl relative overflow-hidden">
                <Trophy className="h-16 w-16 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-bounce" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">
                  Predicted Champion
                </span>
                <span className="text-3xl font-extrabold text-white">
                  {championTeam.name}
                </span>
              </div>
            )}

            {/* Round of 32 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 border-b border-white/10 pb-3">
                Round of 32
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 16 }).map((_, idx) => {
                  const matchNum = idx + 73;
                  const match = knockoutMatches[matchNum];
                  return (
                    <div key={matchNum} className="opacity-90 pointer-events-none">
                      <BracketMatchCard
                        matchNumber={matchNum}
                        stageLabel="Round of 32"
                        homeTeam={match?.home}
                        awayTeam={match?.away}
                        winnerId={knockoutPicks[matchNum]}
                        onPickWinner={() => {}}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Round of 16 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 border-b border-white/10 pb-3">
                Round of 16
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const matchNum = idx + 89;
                  const match = knockoutMatches[matchNum];
                  return (
                    <div key={matchNum} className="opacity-90 pointer-events-none">
                      <BracketMatchCard
                        matchNumber={matchNum}
                        stageLabel="Round of 16"
                        homeTeam={match?.home}
                        awayTeam={match?.away}
                        winnerId={knockoutPicks[matchNum]}
                        onPickWinner={() => {}}
                        homePlaceholder={`Winner Match ${(idx * 2) + 73}`}
                        awayPlaceholder={`Winner Match ${(idx * 2) + 74}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quarter-finals */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 border-b border-white/10 pb-3">
                Quarter-finals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const matchNum = idx + 97;
                  const match = knockoutMatches[matchNum];
                  return (
                    <div key={matchNum} className="opacity-90 pointer-events-none">
                      <BracketMatchCard
                        matchNumber={matchNum}
                        stageLabel="Quarter-final"
                        homeTeam={match?.home}
                        awayTeam={match?.away}
                        winnerId={knockoutPicks[matchNum]}
                        onPickWinner={() => {}}
                        homePlaceholder={`Winner Match ${(idx * 2) + 89}`}
                        awayPlaceholder={`Winner Match ${(idx * 2) + 90}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Semi-finals */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 border-b border-white/10 pb-3">
                Semi-finals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {Array.from({ length: 2 }).map((_, idx) => {
                  const matchNum = idx + 101;
                  const match = knockoutMatches[matchNum];
                  return (
                    <div key={matchNum} className="opacity-90 pointer-events-none">
                      <BracketMatchCard
                        matchNumber={matchNum}
                        stageLabel="Semi-final"
                        homeTeam={match?.home}
                        awayTeam={match?.away}
                        winnerId={knockoutPicks[matchNum]}
                        onPickWinner={() => {}}
                        homePlaceholder={`Winner Match ${(idx * 2) + 97}`}
                        awayPlaceholder={`Winner Match ${(idx * 2) + 98}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Third Place & Final */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Third Place */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 border-b border-white/10 pb-3">
                  Third Place Play-off
                </h2>
                <div className="opacity-90 pointer-events-none">
                  <BracketMatchCard
                    matchNumber={103}
                    stageLabel="Third Place"
                    homeTeam={knockoutMatches[103]?.home}
                    awayTeam={knockoutMatches[103]?.away}
                    winnerId={knockoutPicks[103]}
                    onPickWinner={() => {}}
                    homePlaceholder="Loser Match 101"
                    awayPlaceholder="Loser Match 102"
                  />
                </div>
              </div>

              {/* Final */}
              <div className="flex flex-col gap-4">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-400 border-b border-white/10 pb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Grand Final
                </h2>
                <div className="opacity-90 pointer-events-none">
                  <BracketMatchCard
                    matchNumber={104}
                    stageLabel="Grand Final"
                    homeTeam={knockoutMatches[104]?.home}
                    awayTeam={knockoutMatches[104]?.away}
                    winnerId={knockoutPicks[104]}
                    onPickWinner={() => {}}
                    homePlaceholder="Winner Match 101"
                    awayPlaceholder="Winner Match 102"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group) => {
              const rankings = groupRankings[group.id] || [];
              return (
                <div
                  key={group.id}
                  className="flex flex-col bg-slate-900/30 rounded-2xl border border-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="text-base font-extrabold text-amber-400 mb-4 border-b border-white/5 pb-2 uppercase tracking-wide">
                    {group.name}
                  </div>

                  <div className="flex flex-col gap-2">
                    {rankings.map((teamId, idx) => {
                      const team = group.teams.find((t) => t.id === teamId);
                      if (!team) return null;

                      let numberBadgeClass = "bg-slate-800 text-slate-400";
                      if (idx === 0) numberBadgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
                      if (idx === 1) numberBadgeClass = "bg-sky-500/10 text-sky-400 border border-sky-500/25";
                      if (idx === 2) numberBadgeClass = "bg-amber-500/10 text-amber-300 border border-amber-500/20";

                      return (
                        <div
                          key={teamId}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/5 gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${numberBadgeClass}`}>
                              {idx + 1}
                            </span>
                            {team.flagUrl && (
                              <img
                                src={team.flagUrl}
                                alt=""
                                className="h-5 w-7 object-cover rounded shadow-sm border border-white/5"
                              />
                            )}
                            <span className="text-sm font-semibold text-slate-200 truncate">
                              {team.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Wildcards Tab */}
        {activeTab === "wildcard" && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groups.map((group) => {
                const thirdPlaceTeamId = groupRankings[group.id]?.[2];
                const thirdPlaceTeam = group.teams.find((t) => t.id === thirdPlaceTeamId);
                const isSelected = thirdPlaces.includes(group.id);

                if (!thirdPlaceTeam) return null;

                return (
                  <div
                    key={group.id}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/5 shadow-md shadow-amber-500/5"
                        : "border-white/5 bg-slate-900/30"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                      Group {group.id} 3rd
                    </span>

                    {thirdPlaceTeam.flagUrl && (
                      <img
                        src={thirdPlaceTeam.flagUrl}
                        alt=""
                        className="h-8 w-12 object-cover rounded-md shadow border border-white/5"
                      />
                    )}

                    <span className="text-sm font-bold text-slate-200">
                      {thirdPlaceTeam.name}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-950 text-slate-500"
                    }`}>
                      {isSelected ? "QUALIFIED" : "ELIMINATED"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
