import { describe, it, expect, vi, beforeEach } from "vitest";
import { gradePredictionsForMatch } from "@/lib/gradePredictions";
import { prisma } from "@/lib/db";

// Mock the database client singleton
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      match: {
        findUnique: vi.fn(),
      },
      prediction: {
        findMany: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
      user: {
        update: vi.fn(),
      },
    },
  };
});

describe("gradePredictionsForMatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.prediction.aggregate).mockResolvedValue({ _sum: { pointsEarned: 10 } } as any);
  });

  it("should grade predictions correctly for a GROUP match that ended in a draw", async () => {
    const mockMatch = {
      id: "match-1",
      matchNumber: 1,
      stage: "GROUP",
      homeScore: 1,
      awayScore: 1,
      homeScoreET: null,
      awayScoreET: null,
      homeScorePens: null,
      awayScorePens: null,
      status: "FINISHED",
    };

    const mockPredictions = [
      { id: "pred-1", userId: "user-1", homeScore: 1, awayScore: 1, pointsEarned: null }, // Exact match
      { id: "pred-2", userId: "user-2", homeScore: 2, awayScore: 2, pointsEarned: null }, // Outcome only (draw)
      { id: "pred-3", userId: "user-3", homeScore: 2, awayScore: 1, pointsEarned: null }, // Incorrect outcome
    ];

    vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch as any);
    vi.mocked(prisma.prediction.findMany).mockResolvedValue(mockPredictions as any);

    await gradePredictionsForMatch("match-1");

    // Exact match gets 3 points
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-1" },
      data: { pointsEarned: 3 },
    });

    // Outcome match gets 1 point
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-2" },
      data: { pointsEarned: 1 },
    });

    // Incorrect outcome gets 0 points
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-3" },
      data: { pointsEarned: 0 },
    });
  });

  it("should grade predictions correctly for a KNOCKOUT match decided in EXTRA_TIME", async () => {
    const mockMatch = {
      id: "match-74",
      matchNumber: 74,
      stage: "ROUND_OF_32",
      homeScore: 1,
      awayScore: 1,
      homeScoreET: 2,
      awayScoreET: 1,
      homeScorePens: null,
      awayScorePens: null,
      status: "FINISHED",
    };

    const mockPredictions = [
      { id: "pred-1", userId: "user-1", homeScore: 1, awayScore: 1, pointsEarned: null }, // Exact regular score (1-1 draw) -> 3 points
      { id: "pred-2", userId: "user-2", homeScore: 2, awayScore: 1, pointsEarned: null }, // Predicted Home Win (Germany) -> 1 point (outcome is HOME_WIN)
      { id: "pred-3", userId: "user-3", homeScore: 1, awayScore: 2, pointsEarned: null }, // Predicted Away Win -> 0 points
    ];

    vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch as any);
    vi.mocked(prisma.prediction.findMany).mockResolvedValue(mockPredictions as any);

    await gradePredictionsForMatch("match-74");

    // Exact match on normal time score gets 3 points
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-1" },
      data: { pointsEarned: 3 },
    });

    // Correct winner (home win AET) gets 1 point
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-2" },
      data: { pointsEarned: 1 },
    });

    // Incorrect winner gets 0 points
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-3" },
      data: { pointsEarned: 0 },
    });
  });

  it("should grade predictions correctly for a KNOCKOUT match decided in PENALTIES", async () => {
    const mockMatch = {
      id: "match-75",
      matchNumber: 75,
      stage: "ROUND_OF_32",
      homeScore: 1,
      awayScore: 1,
      homeScoreET: 1,
      awayScoreET: 1,
      homeScorePens: 2,
      awayScorePens: 3, // Away wins on penalties (Morocco)
      status: "FINISHED",
    };

    const mockPredictions = [
      { id: "pred-1", userId: "user-1", homeScore: 1, awayScore: 1, pointsEarned: null }, // Exact regular score (1-1 draw) -> 3 points
      { id: "pred-2", userId: "user-2", homeScore: 1, awayScore: 2, pointsEarned: null }, // Predicted Away Win (Morocco) -> 1 point (outcome is AWAY_WIN)
      { id: "pred-3", userId: "user-3", homeScore: 2, awayScore: 1, pointsEarned: null }, // Predicted Home Win -> 0 points
    ];

    vi.mocked(prisma.match.findUnique).mockResolvedValue(mockMatch as any);
    vi.mocked(prisma.prediction.findMany).mockResolvedValue(mockPredictions as any);

    await gradePredictionsForMatch("match-75");

    // Exact match on normal time score gets 3 points
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-1" },
      data: { pointsEarned: 3 },
    });

    // Correct winner (away win via shootout) gets 1 point
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-2" },
      data: { pointsEarned: 1 },
    });

    // Incorrect winner gets 0 points
    expect(prisma.prediction.update).toHaveBeenCalledWith({
      where: { id: "pred-3" },
      data: { pointsEarned: 0 },
    });
  });
});
