import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LiveMatchBanner } from "@/components/live/LiveMatchBanner";
import type { MatchWithTeams, LiveScore } from "@/types";

let mockScores: LiveScore[] = [];
vi.mock("@/components/live/useLiveScores", () => ({
  useLiveScores: () => ({
    scores: mockScores,
    connected: true,
    error: null,
  }),
}));

const mockMatches: MatchWithTeams[] = [
  {
    id: "match-1",
    matchNumber: 1,
    stage: "GROUP",
    groupId: "A",
    kickoffUtc: "2026-06-11T19:00:00Z",
    homeTeam: { id: "MEX", name: "Mexico", flagUrl: "https://flagcdn.com/w40/mx.png" },
    awayTeam: { id: "ZAF", name: "South Africa", flagUrl: "https://flagcdn.com/w40/za.png" },
    homePlaceholder: null,
    awayPlaceholder: null,
    venue: { name: "Estadio Azteca", city: "Mexico City", country: "Mexico" },
    status: "SCHEDULED",
    homeScore: null,
    awayScore: null,
  },
  {
    id: "match-2",
    matchNumber: 2,
    stage: "GROUP",
    groupId: "A",
    kickoffUtc: "2026-06-11T21:00:00Z",
    homeTeam: { id: "FRA", name: "France", flagUrl: "https://flagcdn.com/w40/fr.png" },
    awayTeam: { id: "URU", name: "Uruguay", flagUrl: "https://flagcdn.com/w40/uy.png" },
    homePlaceholder: null,
    awayPlaceholder: null,
    venue: { name: "Cape Town Stadium", city: "Cape Town", country: "South Africa" },
    status: "SCHEDULED",
    homeScore: null,
    awayScore: null,
  },
];

describe("LiveMatchBanner - Selection Logic", () => {
  beforeEach(() => {
    mockScores = [];
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-11T18:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should show the latest match when multiple match IDs are found in streamed live list", async () => {
    // Mock fetch to return both match IDs in liveMatchIds
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        liveMatchIds: ["match-1", "match-2"],
        streamedLiveMatches: []
      }),
    });

    render(<LiveMatchBanner matches={mockMatches} />);

    // 1. Run the setMounted(true) timer
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    // 2. Let the fetch API resolution resolve and run its state updates
    await act(async () => {
      await Promise.resolve();
    });

    // 3. Run the setActiveMatch(resolved) timer that was scheduled after the fetch resolved
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    // Should resolve active match. We expect "France vs Uruguay" because it has the later kickoff.
    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Uruguay")).toBeInTheDocument();
    expect(screen.queryByText("Mexico")).not.toBeInTheDocument();
  });

  it("should show the latest match when multiple matches have live status in scores", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ liveMatchIds: [], streamedLiveMatches: [] }),
    });

    mockScores = [
      { matchId: "match-1", status: "LIVE", homeScore: 1, awayScore: 0 },
      { matchId: "match-2", status: "LIVE", homeScore: 0, awayScore: 0 },
    ];

    render(<LiveMatchBanner matches={mockMatches} />);

    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Uruguay")).toBeInTheDocument();
    expect(screen.queryByText("Mexico")).not.toBeInTheDocument();
  });

  it("should show the latest match when multiple matches fall in the active time window", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ liveMatchIds: [], streamedLiveMatches: [] }),
    });

    // Freeze time to 2026-06-11T20:00:00Z.
    // match-1 is at 19:00, match-2 is at 19:30. Both are within 2 hours window.
    const simultaneousMatches: MatchWithTeams[] = [
      {
        ...mockMatches[0],
        kickoffUtc: "2026-06-11T19:00:00Z",
      },
      {
        ...mockMatches[1],
        kickoffUtc: "2026-06-11T19:30:00Z",
      }
    ];

    vi.setSystemTime(new Date("2026-06-11T20:00:00Z"));

    render(<LiveMatchBanner matches={simultaneousMatches} />);

    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByText("France")).toBeInTheDocument();
    expect(screen.getByText("Uruguay")).toBeInTheDocument();
    expect(screen.queryByText("Mexico")).not.toBeInTheDocument();
  });
});
