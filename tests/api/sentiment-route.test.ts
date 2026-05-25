import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/teams/[teamId]/sentiment/route";
import { prisma } from "@/lib/db";
import { getTeamNews } from "@/lib/news-api";

vi.mock("@/lib/db", () => ({
  prisma: {
    team: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/news-api", () => ({
  getTeamNews: vi.fn(),
}));

describe("sentiment API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate positive sentiment correctly when headlines are positive", async () => {
    // 1. Mock DB call
    vi.mocked(prisma.team.findUnique).mockResolvedValue({ name: "Argentina" } as any);

    // 2. Mock GNews response articles with highly positive sentiment words (e.g. good, love, great)
    vi.mocked(getTeamNews).mockResolvedValue([
      {
        title: "Argentina plays an amazing, beautiful, and superb match",
        url: "http://example.com/1",
        source: "Daily Footy",
        publishedAt: "2026-05-25T12:00:00Z",
      },
      {
        title: "Argentina team is in good spirits, looking confident",
        url: "http://example.com/2",
        source: "Daily Footy",
        publishedAt: "2026-05-25T12:05:00Z",
      },
    ]);

    const request = new Request("http://localhost/api/teams/arg/sentiment");
    const params = Promise.resolve({ teamId: "arg" });

    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.score).toBeGreaterThan(2);
    expect(json.label).toBe("Very Positive");
    expect(json.emoji).toBe("😍");
    expect(json.articlesAnalyzed).toBe(2);
    expect(json.headlines).toHaveLength(2);
  });

  it("should return neutral status if getTeamNews returns empty articles", async () => {
    vi.mocked(prisma.team.findUnique).mockResolvedValue({ name: "Brazil" } as any);
    vi.mocked(getTeamNews).mockResolvedValue([]);

    const request = new Request("http://localhost/api/teams/bra/sentiment");
    const params = Promise.resolve({ teamId: "bra" });

    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.score).toBe(0);
    expect(json.label).toBe("Neutral");
    expect(json.emoji).toBe("😐");
    expect(json.articlesAnalyzed).toBe(0);
  });

  it("should return 404 if the team does not exist in the database", async () => {
    vi.mocked(prisma.team.findUnique).mockResolvedValue(null);

    const request = new Request("http://localhost/api/teams/xyz/sentiment");
    const params = Promise.resolve({ teamId: "xyz" });

    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Team xyz not found");
  });

  it("should gracefully recover with 500 when database throws an exception", async () => {
    vi.mocked(prisma.team.findUnique).mockRejectedValue(new Error("Database crash"));

    const request = new Request("http://localhost/api/teams/usa/sentiment");
    const params = Promise.resolve({ teamId: "usa" });

    const response = await GET(request, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe("Internal Server Error");
    expect(json.label).toBe("Neutral");
  });
});
