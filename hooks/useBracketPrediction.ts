"use client";

import { useState, useEffect, useMemo } from "react";
import { allocateThirdPlaces, KNOCKOUT_FLOW, SEMI_FLOW } from "@/lib/bracket-prediction";

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
      // 75: 1C vs 2F
      75: { home: getTeam(groupRankings["C"]?.[0]), away: getTeam(groupRankings["F"]?.[1]) },
      // 76: 1F vs 2C
      76: { home: getTeam(groupRankings["F"]?.[0]), away: getTeam(groupRankings["C"]?.[1]) },
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
      // 82: 2D vs 3rd assigned to 82
      82: { home: getTeam(groupRankings["D"]?.[1]), away: getTeam(groupRankings[thirdPlaceAssignments[82]]?.[2]) },
      // 83: 1G vs 2H
      83: { home: getTeam(groupRankings["G"]?.[0]), away: getTeam(groupRankings["H"]?.[1]) },
      // 84: 1H vs 2J
      84: { home: getTeam(groupRankings["H"]?.[0]), away: getTeam(groupRankings["J"]?.[1]) },
      // 85: 1J vs 2K
      85: { home: getTeam(groupRankings["J"]?.[0]), away: getTeam(groupRankings["K"]?.[1]) },
      // 86: 2G vs 3rd assigned to 86
      86: { home: getTeam(groupRankings["G"]?.[1]), away: getTeam(groupRankings[thirdPlaceAssignments[86]]?.[2]) },
      // 87: 1K vs 2L
      87: { home: getTeam(groupRankings["K"]?.[0]), away: getTeam(groupRankings["L"]?.[1]) },
      // 88: 1B vs 3rd assigned to 88
      88: { home: getTeam(groupRankings["B"]?.[0]), away: getTeam(groupRankings[thirdPlaceAssignments[88]]?.[2]) },
    };

    return matches;
  }, [groups, groupRankings, thirdPlaces, teamsMap]);

  // 4. Dynamically compute all knockout matches (73 to 104) based on knockoutPicks
  const knockoutMatches = useMemo(() => {
    const matches: Record<number, { home: Team | null; away: Team | null }> = { ...r32Matches };

    const getTeam = (id?: string) => (id ? teamsMap.get(id) || null : null);

    // Build downstream rounds in order
    // Round of 16 (89 to 96)
    for (let m = 89; m <= 96; m++) {
      // Find the two matches that feed into this one
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
          const nextMatchTeams = knockoutMatches[targetId];
          // Note: since knockoutMatches is computed reactively from knockoutPicks, we can check based on new picks
          const homeId = knockoutPicks[targetId === 104 ? 101 : (targetId === 103 ? 101 : (targetId - 89) * 2 + 73)]; // simplified helper, but let's be bulletproof:
          // Just check if targetWinner is still in the home/away slot
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
    if (matchId <= 96) {
      return { homeId: picksState[(matchId - 89) * 2 + 73], awayId: picksState[(matchId - 89) * 2 + 74] };
    }
    if (matchId <= 100) {
      return { homeId: picksState[(matchId - 97) * 2 + 89], awayId: picksState[(matchId - 97) * 2 + 90] };
    }
    if (matchId <= 102) {
      return { homeId: picksState[(matchId - 101) * 2 + 97], awayId: picksState[(matchId - 101) * 2 + 98] };
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
    isGroupsCompleted,
    isThirdPlacesCompleted,
    knockoutMatchesCount,
    totalKnockoutMatches,
    isBracketComplete,
    submitting,
    isSubmitted,
  };
}
