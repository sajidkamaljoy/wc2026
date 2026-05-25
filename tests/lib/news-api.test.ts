import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("news API client", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("when NEWS_API_KEY is not defined", () => {
    it("getWorldCupNews should return mock articles", async () => {
      delete process.env.NEWS_API_KEY;

      const { getWorldCupNews } = await import("@/lib/news-api");
      const articles = await getWorldCupNews();

      expect(articles).toHaveLength(3);
      expect(articles[0].title).toBe("FIFA Announces Expanded 48-Team Format for 2026 World Cup");
      expect(articles[0].source).toBe("FIFA Official");
      expect(articles[0].url).toBe("#");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("getTeamNews should return team-specific mock articles", async () => {
      delete process.env.NEWS_API_KEY;

      const { getTeamNews } = await import("@/lib/news-api");
      const articles = await getTeamNews("United States");

      expect(articles).toHaveLength(3);
      expect(articles[0].title).toContain("United States");
      expect(articles[0].source).toBe("World Football Daily");
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });

  describe("when NEWS_API_KEY is defined", () => {
    it("getWorldCupNews should fetch from GNews and map fields correctly", async () => {
      process.env.NEWS_API_KEY = "test-key-123";

      const mockResponse = {
        articles: [
          {
            title: "Real GNews Article",
            url: "https://gnews.example.com/1",
            image: "https://gnews.example.com/img1.jpg",
            source: { name: "GNews Source" },
            publishedAt: "2026-05-25T12:00:00Z",
          },
        ],
      };

      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const { getWorldCupNews } = await import("@/lib/news-api");
      const articles = await getWorldCupNews();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://gnews.io/api/v4/search?q="World Cup 2026"&lang=en&max=3&apikey=test-key-123',
        expect.any(Object)
      );
      expect(articles).toHaveLength(1);
      expect(articles[0]).toEqual({
        title: "Real GNews Article",
        url: "https://gnews.example.com/1",
        image: "https://gnews.example.com/img1.jpg",
        source: "GNews Source",
        publishedAt: "2026-05-25T12:00:00Z",
      });
    });

    it("getTeamNews should fetch, de-duplicate headlines, and map fields correctly", async () => {
      process.env.NEWS_API_KEY = "test-key-123";

      const mockResponse = {
        articles: [
          {
            title: "USA Team Prepares for Kickoff",
            url: "https://gnews.example.com/usa1",
            source: { name: "Soccer News" },
            publishedAt: "2026-05-25T10:00:00Z",
          },
          {
            title: "Usa Team Prepares for Kickoff!!!", // Duplicate (normalized alphanumeric-insensitive matches first)
            url: "https://gnews.example.com/usa2",
            source: { name: "Another Source" },
            publishedAt: "2026-05-25T10:05:00Z",
          },
          {
            title: "A Unique Headline for USA",
            url: "https://gnews.example.com/usa3",
            source: { name: "Sports Daily" },
            publishedAt: "2026-05-25T11:00:00Z",
          },
        ],
      };

      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const { getTeamNews } = await import("@/lib/news-api");
      const articles = await getTeamNews("USA");

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent('"USA" "World Cup" "football"')),
        expect.any(Object)
      );

      // De-duplicated: only 2 unique articles should remain
      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("USA Team Prepares for Kickoff");
      expect(articles[1].title).toBe("A Unique Headline for USA");
    });

    it("getTeamNews should return fallback mock articles on fetch throw/error", async () => {
      process.env.NEWS_API_KEY = "test-key-123";

      vi.mocked(globalThis.fetch).mockRejectedValue(new Error("Network disconnect"));

      const { getTeamNews } = await import("@/lib/news-api");
      const articles = await getTeamNews("Canada");

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toContain("Latest updates regarding Canada training camp");
      expect(articles[0].source).toBe("Football News");
    });
  });
});
