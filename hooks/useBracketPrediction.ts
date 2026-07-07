"use client";

import { useState, useEffect, useMemo } from "react";
import { allocateThirdPlaces, KNOCKOUT_FLOW, SEMI_FLOW, MATCH_SOURCES } from "@/lib/bracket-prediction";

export interface Team {
  id: string;
  name: string;
  flagUrl: string | null;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
  goalDiff?: number;
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
}

export function useBracketPrediction() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Core state
  const [groupRankings, setGroupRankings] = useState<Record<string, string[]>>({});
  const [thirdPlaces, setThirdPlaces] = useState<string[]>([]);
  const [knockoutPicks, setKnockoutPicks] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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

  // Load groups and initialize rankings from localStorage
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/groups");
        const data = await res.json();
        if (data.groups) {
          setGroups(data.groups);

          // Restore from localStorage or initialize defaults
          const savedRankings = localStorage.getItem("bracket_groupRankings");
          const savedThirdPlaces = localStorage.getItem("bracket_thirdPlaces");
          const savedKnockoutPicks = localStorage.getItem("bracket_knockoutPicks");
          const savedSubmitted = localStorage.getItem("bracket_isSubmitted");

          if (savedRankings) {
            setGroupRankings(JSON.parse(savedRankings));
          } else {
            // Default: current DB standings order
            const initialRankings: Record<string, string[]> = {};
            for (const g of data.groups) {
              initialRankings[g.id] = g.teams.map((t: Team) => t.id);
            }
            setGroupRankings(initialRankings);
          }

          if (savedThirdPlaces) setThirdPlaces(JSON.parse(savedThirdPlaces));
          if (savedKnockoutPicks) setKnockoutPicks(JSON.parse(savedKnockoutPicks));
          if (savedSubmitted) setIsSubmitted(JSON.parse(savedSubmitted));
        }
      } catch (err) {
        console.error("Error loading group prediction data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Fetch db saved state if available to overwrite/merge
  useEffect(() => {
    if (loading || groups.length === 0) return;
    async function fetchSavedPrediction() {
      try {
        const res = await fetch("/api/predict/bracket");
        const data = await res.json();
        if (data.prediction) {
          const bp = data.prediction;
          if (bp.groupPicks) {
            setGroupRankings(bp.groupPicks);
            localStorage.setItem("bracket_groupRankings", JSON.stringify(bp.groupPicks));
          }
          if (bp.thirdPlaces) {
            setThirdPlaces(bp.thirdPlaces);
            localStorage.setItem("bracket_thirdPlaces", JSON.stringify(bp.thirdPlaces));
          }
          if (bp.knockoutPicks) {
            setKnockoutPicks(bp.knockoutPicks);
            localStorage.setItem("bracket_knockoutPicks", JSON.stringify(bp.knockoutPicks));
          }
          setIsSubmitted(true);
          localStorage.setItem("bracket_isSubmitted", "true");
        }
      } catch (e) {
        console.warn("Could not sync with backend db (running in offline mode)", e);
      }
    }
    fetchSavedPrediction();
  }, [loading, groups.length]);

  // Persist state to localStorage on changes
  const saveToStorage = (
    rankings: Record<string, string[]>,
    thirds: string[],
    picks: Record<number, string>
  ) => {
    localStorage.setItem("bracket_groupRankings", JSON.stringify(rankings));
    localStorage.setItem("bracket_thirdPlaces", JSON.stringify(thirds));
    localStorage.setItem("bracket_knockoutPicks", JSON.stringify(picks));
  };

  const savePredictionRemote = async (
    rankings: Record<string, string[]>,
    thirds: string[],
    picks: Record<number, string>
  ) => {
    try {
      const res = await fetch("/api/predict/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupRankings: rankings,
          thirdPlaces: thirds,
          knockoutPicks: picks,
        }),
      });
      return res.ok;
    } catch (e) {
      console.warn("Could not save prediction to database", e);
      return false;
    }
  };

  // 1. Group Stage Re-ordering
  const rankTeam = (groupId: string, teamId: string, direction: "up" | "down") => {
    const list = [...(groupRankings[groupId] || [])];
    const idx = list.indexOf(teamId);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      list[idx] = list[idx - 1];
      list[idx - 1] = teamId;
    } else if (direction === "down" && idx < list.length - 1) {
      list[idx] = list[idx + 1];
      list[idx + 1] = teamId;
    }

    const nextRankings = { ...groupRankings, [groupId]: list };
    setGroupRankings(nextRankings);
    
    // Cascading effect: modifying group standings invalidates ALL knockout picks
    // because team pathways are recalculated
    const nextPicks = {};
    setKnockoutPicks(nextPicks);
    setIsSubmitted(false);
    saveToStorage(nextRankings, thirdPlaces, nextPicks);
  };

  // Sync a single group's rankings with the current actual DB standings
  const syncGroupWithStandings = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    const sortedIds = group.teams.map((t) => t.id);

    const nextRankings = { ...groupRankings, [groupId]: sortedIds };
    setGroupRankings(nextRankings);

    const nextPicks = {};
    setKnockoutPicks(nextPicks);
    setIsSubmitted(false);
    saveToStorage(nextRankings, thirdPlaces, nextPicks);
  };

  // Sync all groups' rankings with the current actual DB standings
  const syncAllGroupsWithStandings = () => {
    const nextRankings = { ...groupRankings };
    for (const g of groups) {
      nextRankings[g.id] = g.teams.map((t) => t.id);
    }
    setGroupRankings(nextRankings);

    const nextPicks = {};
    setKnockoutPicks(nextPicks);
    setIsSubmitted(false);
    saveToStorage(nextRankings, thirdPlaces, nextPicks);
  };

  // 2. Select 3rd-place teams
  const toggleThirdPlace = (groupId: string) => {
    let nextThirds = [...thirdPlaces];
    if (nextThirds.includes(groupId)) {
      nextThirds = nextThirds.filter((id) => id !== groupId);
    } else {
      if (nextThirds.length >= 8) return; // exactly 8 max
      nextThirds.push(groupId);
    }

    setThirdPlaces(nextThirds);
    const nextPicks = {}; // reset knockout picks as 3rd place mappings change
    setKnockoutPicks(nextPicks);
    setIsSubmitted(false);
    saveToStorage(groupRankings, nextThirds, nextPicks);
  };

  // 3. Dynamically compute the Round of 32 matches
  const r32Matches = useMemo(() => {
    if (groups.length === 0 || Object.keys(groupRankings).length === 0) return {};

    // Get 3rd place assignments
    const thirdPlaceAssignments = allocateThirdPlaces(thirdPlaces);

    const getTeam = (id?: string) => (id ? teamsMap.get(id) || null : null);

    const matches: Record<number, { home: Team | null; away: Team | null }> = {
      // 73: 2A vs 2B
      73: { home: getTeam(groupRankings["A"]?.[1]), away: getTeam(groupRankings["B"]?.[1]) },
      // 74: 1E vs 3rd Place assigned to 74
      74: { home: getTeam(groupRankings["E"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[74]]?.[2]) },
      // 75: 1F vs 2C
      75: { home: getTeam(groupRankings["F"]?.[0]), away: getTeam(groupRankings["C"]?.[1]) },
      // 76: 1C vs 2F
      76: { home: getTeam(groupRankings["C"]?.[0]), away: getTeam(groupRankings["F"]?.[1]) },
      // 77: 1I vs 3rd assigned to 77
      77: { home: getTeam(groupRankings["I"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[77]]?.[2]) },
      // 78: 2E vs 2I
      78: { home: getTeam(groupRankings["E"]?.[1]), away: getTeam(groupRankings["I"]?.[1]) },
      // 79: 1A vs 3rd assigned to 79
      79: { home: getTeam(groupRankings["A"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[79]]?.[2]) },
      // 80: 1L vs 3rd assigned to 80
      80: { home: getTeam(groupRankings["L"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[80]]?.[2]) },
      // 81: 1D vs 3rd assigned to 81
      81: { home: getTeam(groupRankings["D"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[81]]?.[2]) },
      // 82: 1G vs 3rd assigned to 82
      82: { home: getTeam(groupRankings["G"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[82]]?.[2]) },
      // 83: 2K vs 2L
      83: { home: getTeam(groupRankings["K"]?.[1]), away: getTeam(groupRankings["L"]?.[1]) },
      // 84: 1H vs 2J
      84: { home: getTeam(groupRankings["H"]?.[0]), away: getTeam(groupRankings["J"]?.[1]) },
      // 85: 1B vs 3rd assigned to 85
      85: { home: getTeam(groupRankings["B"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[85]]?.[2]) },
      // 86: 1J vs 2H
      86: { home: getTeam(groupRankings["J"]?.[0]), away: getTeam(groupRankings["H"]?.[1]) },
      // 87: 1K vs 3rd assigned to 87
      87: { home: getTeam(groupRankings["K"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[87]]?.[2]) },
      // 88: 2D vs 2G
      88: { home: getTeam(groupRankings["D"]?.[1]), away: getTeam(groupRankings["G"]?.[1]) },
    };

    return matches;
  }, [groups, groupRankings, thirdPlaces, teamsMap]);

  // 4. Dynamically compute all knockout matches (73 to 104) based on knockoutPicks
  const knockoutMatches = useMemo(() => {
    const matches: Record<number, { home: Team | null; away: Team | null }> = { ...r32Matches };

    const getTeam = (id?: string) => (id ? teamsMap.get(id) || null : null);

    // Build downstream rounds in order (89 to 102)
    for (let m = 89; m <= 102; m++) {
      const source = MATCH_SOURCES[m];
      if (source) {
        matches[m] = {
          home: getTeam(knockoutPicks[source.home]),
          away: getTeam(knockoutPicks[source.away]),
        };
      }
    }

    // Third Place Play-off (103) - losing semi-finalists
    const getLoser = (matchNum: number, winnerId?: string) => {
      const match = matches[matchNum];
      if (!match || !match.home || !match.away || !winnerId) return null;
      return match.home.id === winnerId ? match.away : match.home;
    };
    matches[103] = {
      home: getLoser(101, knockoutPicks[101]),
      away: getLoser(102, knockoutPicks[102]),
    };

    // Final (104) - winning semi-finalists
    matches[104] = {
      home: getTeam(knockoutPicks[101]),
      away: getTeam(knockoutPicks[102]),
    };

    return matches;
  }, [r32Matches, knockoutPicks, teamsMap]);

  // Pick winner of a knockout match
  const pickWinner = (matchNumber: number, winnerId: string) => {
    const newPicks = { ...knockoutPicks };
    newPicks[matchNumber] = winnerId;

    // Recursively clear invalid downstream picks
    function clearInvalidDownstream(matchNum: number) {
      const flow = KNOCKOUT_FLOW[matchNum] || SEMI_FLOW[matchNum];
      if (!flow) return;

      const targets = [];
      if (matchNum === 101 || matchNum === 102) {
        targets.push((flow as any).winnerTarget, (flow as any).loserTarget);
      } else {
        targets.push((flow as any).target);
      }

      for (const targetId of targets) {
        const targetWinner = newPicks[targetId];
        if (targetWinner) {
          // If the target winner is no longer one of the qualified teams for that match, clear it
          const finalMatches = getPredictiveMatchTeams(targetId, newPicks);
          if (targetWinner !== finalMatches.homeId && targetWinner !== finalMatches.awayId) {
            delete newPicks[targetId];
            clearInvalidDownstream(targetId);
          }
        }
      }
    }

    clearInvalidDownstream(matchNumber);
    setKnockoutPicks(newPicks);
    setIsSubmitted(false);
    saveToStorage(groupRankings, thirdPlaces, newPicks);
  };

  // Helper to determine home/away of any match dynamically given a state of picks
  const getPredictiveMatchTeams = (matchId: number, picksState: Record<number, string>): { homeId?: string; awayId?: string } => {
    if (matchId <= 88) {
      const match = r32Matches[matchId];
      return { homeId: match?.home?.id, awayId: match?.away?.id };
    }
    const source = MATCH_SOURCES[matchId];
    if (source) {
      return { homeId: picksState[source.home], awayId: picksState[source.away] };
    }
    if (matchId === 103) {
      // Loser SF-M1 and Loser SF-M2
      const sf1 = knockoutMatches[101];
      const sf2 = knockoutMatches[102];
      const p101 = picksState[101];
      const p102 = picksState[102];
      const homeId = sf1?.home?.id === p101 ? sf1?.away?.id : sf1?.home?.id;
      const awayId = sf2?.home?.id === p102 ? sf2?.away?.id : sf2?.home?.id;
      return { homeId, awayId };
    }
    // Final (104)
    return { homeId: picksState[101], awayId: picksState[102] };
  };

  // Sync predictions with real database tournament matches
  const syncWithRealTournament = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/fixtures");
      const data = await res.json();
      if (!data.matches) {
        throw new Error("Failed to fetch fixtures");
      }

      const dbMatches = data.matches;

      // 1. Sync group stage rankings
      const nextRankings: Record<string, string[]> = {};
      const allThirds: {
        teamId: string;
        groupId: string;
        points: number;
        gd: number;
        gf: number;
      }[] = [];

      for (const g of groups) {
        nextRankings[g.id] = g.teams.map((t) => t.id);
        const thirdTeam = g.teams[2];
        if (thirdTeam) {
          allThirds.push({
            teamId: thirdTeam.id,
            groupId: g.id,
            points: thirdTeam.points || 0,
            gd: (thirdTeam.goalsFor || 0) - (thirdTeam.goalsAgainst || 0),
            gf: thirdTeam.goalsFor || 0,
          });
        }
      }

      // 2. Determine best 8 third-place teams
      const sortedThirds = [...allThirds].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.teamId.localeCompare(b.teamId);
      });

      const nextThirds = sortedThirds.slice(0, 8).map((t) => t.groupId);

      // 3. Sync knockout matches
      const finishedMatches = dbMatches.filter(
        (m: any) => m.matchNumber >= 73 && m.matchNumber <= 104 && m.status === "FINISHED"
      );

      const getMatchWinner = (match: any): string | null => {
        if (!match.homeTeamId || !match.awayTeamId) return null;
        const home = match.homeScore ?? 0;
        const away = match.awayScore ?? 0;
        if (home > away) return match.homeTeamId;
        if (away > home) return match.awayTeamId;

        const homeET = match.homeScoreET;
        const awayET = match.awayScoreET;
        if (homeET !== null && awayET !== null) {
          if (homeET > awayET) return match.homeTeamId;
          if (awayET > homeET) return match.awayTeamId;
        }

        const homePens = match.homeScorePens;
        const awayPens = match.awayScorePens;
        if (homePens !== null && awayPens !== null) {
          if (homePens > awayPens) return match.homeTeamId;
          if (awayPens > homePens) return match.awayTeamId;
        }

        return null;
      };

      const finishedWinners: Record<number, string> = {};
      for (const m of finishedMatches) {
        const winnerId = getMatchWinner(m);
        if (winnerId) {
          finishedWinners[m.matchNumber] = winnerId;
        }
      }

      const thirdPlaceAssignments = allocateThirdPlaces(nextThirds);

      const getR32Teams = (mId: number): { homeId?: string; awayId?: string } => {
        switch (mId) {
          case 73: return { homeId: nextRankings["A"]?.[1], awayId: nextRankings["B"]?.[1] };
          case 74: return { homeId: nextRankings["E"]?.[0], awayId: nextRankings[thirdPlaceAssignments[74]]?.[2] };
          case 75: return { homeId: nextRankings["F"]?.[0], awayId: nextRankings["C"]?.[1] };
          case 76: return { homeId: nextRankings["C"]?.[0], awayId: nextRankings["F"]?.[1] };
          case 77: return { homeId: nextRankings["I"]?.[0], awayId: nextRankings[thirdPlaceAssignments[77]]?.[2] };
          case 78: return { homeId: nextRankings["E"]?.[1], awayId: nextRankings["I"]?.[1] };
          case 79: return { homeId: nextRankings["A"]?.[0], awayId: nextRankings[thirdPlaceAssignments[79]]?.[2] };
          case 80: return { homeId: nextRankings["L"]?.[0], awayId: nextRankings[thirdPlaceAssignments[80]]?.[2] };
          case 81: return { homeId: nextRankings["D"]?.[0], awayId: nextRankings[thirdPlaceAssignments[81]]?.[2] };
          case 82: return { homeId: nextRankings["G"]?.[0], awayId: nextRankings[thirdPlaceAssignments[82]]?.[2] };
          case 83: return { homeId: nextRankings["K"]?.[1], awayId: nextRankings["L"]?.[1] };
          case 84: return { homeId: nextRankings["H"]?.[0], awayId: nextRankings["J"]?.[1] };
          case 85: return { homeId: nextRankings["B"]?.[0], awayId: nextRankings[thirdPlaceAssignments[85]]?.[2] };
          case 86: return { homeId: nextRankings["J"]?.[0], awayId: nextRankings["H"]?.[1] };
          case 87: return { homeId: nextRankings["K"]?.[0], awayId: nextRankings[thirdPlaceAssignments[87]]?.[2] };
          case 88: return { homeId: nextRankings["D"]?.[1], awayId: nextRankings["G"]?.[1] };
          default: return {};
        }
      };

      const nextPicks: Record<number, string> = {};

      const getLocalTeams = (mId: number): { homeId?: string; awayId?: string } => {
        if (mId <= 88) {
          return getR32Teams(mId);
        }
        if (mId === 103) {
          const getLoserId = (sfId: number) => {
            const sfTeams = getLocalTeams(sfId);
            const winner = nextPicks[sfId];
            if (!sfTeams.homeId || !sfTeams.awayId || !winner) return undefined;
            return sfTeams.homeId === winner ? sfTeams.awayId : sfTeams.homeId;
          };
          return { homeId: getLoserId(101), awayId: getLoserId(102) };
        }
        if (mId === 104) {
          return { homeId: nextPicks[101], awayId: nextPicks[102] };
        }
        const source = MATCH_SOURCES[mId];
        if (source) {
          return { homeId: nextPicks[source.home], awayId: nextPicks[source.away] };
        }
        return {};
      };

      for (let mId = 73; mId <= 104; mId++) {
        if (finishedWinners[mId]) {
          nextPicks[mId] = finishedWinners[mId];
        } else {
          // Unplayed: check if existing user prediction is still qualified
          const existingPick = knockoutPicks[mId];
          if (existingPick) {
            const { homeId, awayId } = getLocalTeams(mId);
            if (existingPick === homeId || existingPick === awayId) {
              nextPicks[mId] = existingPick;
            }
          }
        }
      }

      setGroupRankings(nextRankings);
      setThirdPlaces(nextThirds);
      setKnockoutPicks(nextPicks);
      saveToStorage(nextRankings, nextThirds, nextPicks);

      const nextGroupsCompleted = groups.length > 0 && Object.keys(nextRankings).length === 12;
      const nextThirdPlacesCompleted = nextThirds.length === 8;
      const nextKnockoutMatchesCount = Object.keys(nextPicks).length;
      const nextIsBracketComplete = nextGroupsCompleted && nextThirdPlacesCompleted && nextKnockoutMatchesCount === 32;

      if (nextIsBracketComplete) {
        setIsSubmitted(true);
        localStorage.setItem("bracket_isSubmitted", "true");
      } else {
        setIsSubmitted(false);
        localStorage.setItem("bracket_isSubmitted", "false");
      }

      await savePredictionRemote(nextRankings, nextThirds, nextPicks);
      return { success: true, updatedCount: finishedMatches.length };
    } catch (err) {
      console.error("Error syncing bracket predictions:", err);
      return { success: false, error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear all picks
  const resetBracket = () => {
    const initialRankings: Record<string, string[]> = {};
    for (const g of groups) {
      initialRankings[g.id] = g.teams.map((t) => t.id);
    }
    setGroupRankings(initialRankings);
    setThirdPlaces([]);
    setKnockoutPicks({});
    setIsSubmitted(false);
    saveToStorage(initialRankings, [], {});
  };

  // Progress metrics
  const isGroupsCompleted = groups.length > 0 && Object.keys(groupRankings).length === 12;
  const isThirdPlacesCompleted = thirdPlaces.length === 8;
  const knockoutMatchesCount = Object.keys(knockoutPicks).length; // out of 32 matches
  const totalKnockoutMatches = 32; // 16 (R32) + 8 (R16) + 4 (QF) + 2 (SF) + 1 (3rd) + 1 (Final)
  const isBracketComplete = isGroupsCompleted && isThirdPlacesCompleted && knockoutMatchesCount === totalKnockoutMatches;

  // Submit picks to the API
  const submitBracket = async () => {
    if (!isBracketComplete) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/predict/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupRankings,
          thirdPlaces,
          knockoutPicks,
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        localStorage.setItem("bracket_isSubmitted", "true");
      } else {
        console.error("Failed to submit bracket");
      }
    } catch (e) {
      console.error("Submit error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    groups,
    loading,
    groupRankings,
    thirdPlaces,
    knockoutPicks,
    knockoutMatches,
    rankTeam,
    syncGroupWithStandings,
    syncAllGroupsWithStandings,
    toggleThirdPlace,
    pickWinner,
    resetBracket,
    submitBracket,
    syncWithRealTournament,
    isSyncing,
    isGroupsCompleted,
    isThirdPlacesCompleted,
    knockoutMatchesCount,
    totalKnockoutMatches,
    isBracketComplete,
    submitting,
    isSubmitted,
  };
}
