import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { FixtureList } from "@/components/fixtures/FixtureList";
import type { MatchWithTeams } from "@/types";

vi.mock("@/hooks/useFavorites", () => ({
  useFavorites: () => ({
    favorites: [],
    isLoaded: true,
    isFavorite: () => false,
    toggleFavorite: () => {},
  }),
}));

const mockMatches: MatchWithTeams[] = [
  {
    id: "match-1",
    matchNumber: 1,
    stage: "GROUP",
    groupId: "A",
    kickoffUtc: "2026-06-11T12:00:00Z", // Past day
    homeTeam: { id: "MEX", name: "Mexico", flagUrl: null },
    awayTeam: { id: "ZAF", name: "South Africa", flagUrl: null },
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
    kickoffUtc: "2026-06-15T12:00:00Z", // Today (same time as system time)
    homeTeam: { id: "FRA", name: "France", flagUrl: null },
    awayTeam: { id: "URU", name: "Uruguay", flagUrl: null },
    homePlaceholder: null,
    awayPlaceholder: null,
    venue: { name: "Cape Town Stadium", city: "Cape Town", country: "South Africa" },
    status: "SCHEDULED",
    homeScore: null,
    awayScore: null,
  },
  {
    id: "match-3",
    matchNumber: 3,
    stage: "GROUP",
    groupId: "B",
    kickoffUtc: "2026-06-16T12:00:00Z", // Tomorrow
    homeTeam: { id: "ARG", name: "Argentina", flagUrl: null },
    awayTeam: { id: "NGA", name: "Nigeria", flagUrl: null },
    homePlaceholder: null,
    awayPlaceholder: null,
    venue: { name: "Ellis Park Stadium", city: "Johannesburg", country: "South Africa" },
    status: "SCHEDULED",
    homeScore: null,
    awayScore: null,
  },
];

describe("FixtureList - Today's Match Priority", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Set system time to June 15, 2026
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));

    // Mock global fetch for API calls
    global.fetch = vi.fn().mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/teams")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ teams: [] }),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/predictions")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ predictions: [] }),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/fixtures")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ matches: mockMatches }),
        } as Response);
      }
      return Promise.reject(new Error("Unknown API"));
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should focus today's matches by default and collapse previous/next matches, allowing them to be uncollapsed", async () => {
    const { container } = render(<FixtureList initialMatches={mockMatches} />);

    // Fast-forward mount timers
    await act(async () => {
      vi.runOnlyPendingTimers();
    });

    // By default, only today's matches should be shown
    const h2Elements = container.querySelectorAll("h2");
    expect(h2Elements.length).toBe(1);
    expect(h2Elements[0].textContent).toContain("15 June 2026");
    expect(h2Elements[0].textContent).toContain("Today");

    // Check that previous/next matches are not displayed initially
    expect(container.textContent).not.toContain("11 June 2026");
    expect(container.textContent).not.toContain("16 June 2026");

    // Uncollapse previous matches
    const showPrevButton = screen.getByText(/Show Previous Matches/i);
    await act(async () => {
      showPrevButton.click();
    });

    // Now previous matches header should be present
    expect(container.textContent).toContain("11 June 2026");

    // Uncollapse next matches
    const showNextButton = screen.getByText(/Show Next Matches/i);
    await act(async () => {
      showNextButton.click();
    });

    // Now next matches header should be present
    expect(container.textContent).toContain("16 June 2026");
  });
});
