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

  it("should calculate positive sentiment using Gemini API when key is configured", async () => {
    // 1. Mock env key
    const originalApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-gemini-key";

    // 2. Mock DB call
    vi.mocked(prisma.team.findUnique).mockResolvedValue({ name: "Argentina" } as any);

    // 3. Mock getTeamNews
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

    // 4. Mock global fetch for Gemini API
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  averageScore: 3.5,
                  headlines: [
                    { title: "Argentina plays an amazing, beautiful, and superb match", score: 4.5 },
                    { title: "Argentina team is in good spirits, looking confident", score: 2.5 }
                  ]
                })
              }
            ]
          }
        }
      ]
    };

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockGeminiResponse,
    } as any);

    try {
      const request = new Request("http://localhost/api/teams/arg/sentiment");
      const params = Promise.resolve({ teamId: "arg" });

      const response = await GET(request, { params });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("https://generativelanguage.googleapis.com"),
        expect.any(Object)
      );
      expect(json.score).toBe(3.5);
      expect(json.label).toBe("Very Positive");
      expect(json.emoji).toBe("😍");
      expect(json.headlines[0].sentiment).toBe(4.5);
      expect(json.headlines[1].sentiment).toBe(2.5);
    } finally {
      // Cleanup env and global fetch
      process.env.GEMINI_API_KEY = originalApiKey;
      global.fetch = originalFetch;
    }
  });

  it("should fallback to local sentiment library if Gemini API call fails", async () => {
    // 1. Mock env key
    const originalApiKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-gemini-key";

    // 2. Mock DB call
    vi.mocked(prisma.team.findUnique).mockResolvedValue({ name: "Argentina" } as any);

    // 3. Mock getTeamNews
    vi.mocked(getTeamNews).mockResolvedValue([
      {
        title: "Argentina plays an amazing, beautiful, and superb match",
        url: "http://example.com/1",
        source: "Daily Footy",
        publishedAt: "2026-05-25T12:00:00Z",
      },
    ]);

    // 4. Mock global fetch to fail (throws error)
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error("Gemini API Rate Limit Exceeded"));

    try {
      const request = new Request("http://localhost/api/teams/arg/sentiment");
      const params = Promise.resolve({ teamId: "arg" });

      const response = await GET(request, { params });
      const json = await response.json();

      // Should still succeed because of fallback
      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      // Fallback lexicon score for "amazing, beautiful, and superb" is positive
      expect(json.score).toBeGreaterThan(0);
      expect(json.headlines[0].sentiment).toBeGreaterThan(0);
    } finally {
      // Cleanup env and global fetch
      process.env.GEMINI_API_KEY = originalApiKey;
      global.fetch = originalFetch;
    }
  });
});
