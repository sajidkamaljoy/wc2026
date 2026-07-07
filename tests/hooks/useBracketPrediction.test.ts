import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useBracketPrediction } from "@/hooks/useBracketPrediction";

// Mock group data for 12 groups A to L
const mockGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(groupId => ({
  id: groupId,
  name: `Group ${groupId}`,
  teams: [
    { id: `${groupId}01`, name: `Team ${groupId}1`, flagUrl: null, points: 6, goalsFor: 5, goalsAgainst: 1 },
    { id: `${groupId}02`, name: `Team ${groupId}2`, flagUrl: null, points: 4, goalsFor: 4, goalsAgainst: 2 },
    { id: `${groupId}03`, name: `Team ${groupId}3`, flagUrl: null, points: 3, goalsFor: 3, goalsAgainst: 3 },
    { id: `${groupId}04`, name: `Team ${groupId}4`, flagUrl: null, points: 1, goalsFor: 1, goalsAgainst: 5 },
  ]
}));

describe("useBracketPrediction hook sync capabilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize hook and sync predictions with database state", async () => {
    // 1. Mock the API fetches
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/groups")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ groups: mockGroups }),
        });
      }
      if (url.includes("/api/predict/bracket")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prediction: null }),
        });
      }
      if (url.includes("/api/fixtures")) {
        // Mock finished round of 32 match #73
        // Team A02 vs Team B02 (2A vs 2B) -> A02 wins 2-1
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            matches: [
              {
                matchNumber: 73,
                homeTeamId: "A02",
                awayTeamId: "B02",
                status: "FINISHED",
                homeScore: 2,
                awayScore: 1,
                homeScoreET: null,
                awayScoreET: null,
                homeScorePens: null,
                awayScorePens: null,
              }
            ]
          }),
        });
      }
      return Promise.resolve({ ok: false });
    });
    globalThis.fetch = fetchMock;

    // 2. Render Hook
    const { result } = renderHook(() => useBracketPrediction());

    // Wait for initial data load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.groups.length).toBe(12);

    // 3. Trigger sync
    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncWithRealTournament();
    });

    expect(syncResult).toEqual({ success: true, updatedCount: 1 });

    // 4. Verify group rankings synced
    expect(result.current.groupRankings["A"]).toEqual(["A01", "A02", "A03", "A04"]);
    expect(result.current.groupRankings["B"]).toEqual(["B01", "B02", "B03", "B04"]);

    // 5. Verify knockout picks synced Match 73 actual winner (A02)
    expect(result.current.knockoutPicks[73]).toBe("A02");
  });

  it("should resolve extra-time and penalty draws correctly", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/groups")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ groups: mockGroups }),
        });
      }
      if (url.includes("/api/predict/bracket")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prediction: null }),
        });
      }
      if (url.includes("/api/fixtures")) {
        // Mock finished ET draw & penalty shootout winner match #73
        // Team A02 vs Team B02 (2A vs 2B) -> Draw 1-1, ET 2-2, Penalties 5-4 for B02
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            matches: [
              {
                matchNumber: 73,
                homeTeamId: "A02",
                awayTeamId: "B02",
                status: "FINISHED",
                homeScore: 1,
                awayScore: 1,
                homeScoreET: 2,
                awayScoreET: 2,
                homeScorePens: 4,
                awayScorePens: 5,
              }
            ]
          }),
        });
      }
      return Promise.resolve({ ok: false });
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useBracketPrediction());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.syncWithRealTournament();
    });

    // Verify shootout winner is set correctly
    expect(result.current.knockoutPicks[73]).toBe("B02");
  });

  it("should preserve valid downstream predictions while cascading deletes for changed paths", async () => {
    // 1. Mock setup: user has a pre-existing custom pick
    // Let's say user has group rankings set
    const savedRankings = {};
    for (const g of mockGroups) {
      savedRankings[g.id] = g.teams.map(t => t.id);
    }
    // Wildcards: A to H
    const savedThirds = ["A", "B", "C", "D", "E", "F", "G", "H"];
    // Knockouts: user predicted A02 wins match 73 (R32: 2A vs 2B) and B01 wins match 89 (R16: Winner 74 vs Winner 77)
    // Wait, Match 90 is Winner 73 vs Winner 75. Let's say user predicted A02 wins Match 90.
    const savedPicks = {
      73: "A02",
      75: "F01",
      90: "A02", // user predicted A02 wins match 90 (Winner 73 vs Winner 75)
    };

    localStorage.setItem("bracket_groupRankings", JSON.stringify(savedRankings));
    localStorage.setItem("bracket_thirdPlaces", JSON.stringify(savedThirds));
    localStorage.setItem("bracket_knockoutPicks", JSON.stringify(savedPicks));

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/api/groups")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ groups: mockGroups }),
        });
      }
      if (url.includes("/api/predict/bracket")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ prediction: null }),
        });
      }
      if (url.includes("/api/fixtures")) {
        // Database says Match 73 is FINISHED and B02 won!
        // This overrides user's pick for 73 (A02 -> B02), which makes the user's prediction for Match 90 ("A02") invalid
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            matches: [
              {
                matchNumber: 73,
                homeTeamId: "A02",
                awayTeamId: "B02",
                status: "FINISHED",
                homeScore: 0,
                awayScore: 3,
                homeScoreET: null,
                awayScoreET: null,
                homeScorePens: null,
                awayScorePens: null,
              }
            ]
          }),
        });
      }
      return Promise.resolve({ ok: false });
    });
    globalThis.fetch = fetchMock;

    const { result } = renderHook(() => useBracketPrediction());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Initially loading state from localStorage
    expect(result.current.knockoutPicks[73]).toBe("A02");
    expect(result.current.knockoutPicks[90]).toBe("A02");

    await act(async () => {
      await result.current.syncWithRealTournament();
    });

    // Match 73 is updated to B02 (winner of actual match)
    expect(result.current.knockoutPicks[73]).toBe("B02");

    // Match 90 user prediction "A02" should be cleared because A02 is no longer in match 90 matchup (which is now B02 vs Winner 75)
    expect(result.current.knockoutPicks[90]).toBeUndefined();

    // Match 75 is unplayed and was unaffected, so its pick "F01" is preserved!
    expect(result.current.knockoutPicks[75]).toBe("F01");
  });
});
