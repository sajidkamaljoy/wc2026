import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/predictions/route";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  prisma: {
    match: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    prediction: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/rate-limit", () => ({
  getClientIp: () => "127.0.0.1",
  rateLimit: () => ({ success: true }),
}));

describe("predictions API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow predictions if the match is SCHEDULED and has not started yet", async () => {
    // mock scheduled future match
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hour in future
    vi.mocked(prisma.match.findUnique).mockResolvedValue({
      id: "match-1",
      status: "SCHEDULED",
      kickoffUtc: new Date(futureDate),
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-1" } as any);
    vi.mocked(prisma.prediction.upsert).mockResolvedValue({
      id: "pred-1",
      userId: "user-1",
      matchId: "match-1",
      homeScore: 2,
      awayScore: 1,
    } as any);

    // Create a mock NextRequest
    const req = new NextRequest("http://localhost/api/predictions", {
      method: "POST",
      body: JSON.stringify({
        matchId: "match-1",
        homeScore: 2,
        awayScore: 1,
      }),
    });
    // Mock the cookie getter
    vi.spyOn(req.cookies, "get").mockReturnValue({ value: "device-1" } as any);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.homeScore).toBe(2);
    expect(data.awayScore).toBe(1);
    expect(prisma.prediction.upsert).toHaveBeenCalled();
  });

  it("should reject predictions with 403 if the match kickoff time has passed", async () => {
    // mock scheduled past match
    const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString(); // 1 hour in past
    vi.mocked(prisma.match.findUnique).mockResolvedValue({
      id: "match-1",
      status: "SCHEDULED",
      kickoffUtc: new Date(pastDate),
    } as any);

    const req = new NextRequest("http://localhost/api/predictions", {
      method: "POST",
      body: JSON.stringify({
        matchId: "match-1",
        homeScore: 2,
        awayScore: 1,
      }),
    });
    vi.spyOn(req.cookies, "get").mockReturnValue({ value: "device-1" } as any);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Match has already started");
    expect(prisma.prediction.upsert).not.toHaveBeenCalled();
  });

  it("should reject predictions with 403 if the match is not SCHEDULED (e.g. LIVE)", async () => {
    // mock live future/past match
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString();
    vi.mocked(prisma.match.findUnique).mockResolvedValue({
      id: "match-1",
      status: "LIVE",
      kickoffUtc: new Date(futureDate),
    } as any);

    const req = new NextRequest("http://localhost/api/predictions", {
      method: "POST",
      body: JSON.stringify({
        matchId: "match-1",
        homeScore: 2,
        awayScore: 1,
      }),
    });
    vi.spyOn(req.cookies, "get").mockReturnValue({ value: "device-1" } as any);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Match has already started");
    expect(prisma.prediction.upsert).not.toHaveBeenCalled();
  });
});
