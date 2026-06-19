import { describe, it, expect, vi, beforeEach } from "vitest";
import { calculatePathway } from "@/lib/pathway";
import { prisma } from "@/lib/db";

// Mock the database client singleton
vi.mock("@/lib/db", () => {
  return {
    prisma: {
      team: {
        findUniqueOrThrow: vi.fn(),
      },
    },
  };
});

describe("calculatePathway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should calculate correct pathway for a team finishing 1st in Group A", async () => {
    // Mock database output for a team finishing 1st
    const mockTeam = {
      id: "USA",
      name: "United States",
      groupId: "A",
      flagUrl: "/flags/usa.png",
      group: {
        teams: [
          { id: "USA", points: 9, goalsFor: 6 }, // 1st
          { id: "MEX", points: 6, goalsFor: 4 }, // 2nd
          { id: "CAN", points: 3, goalsFor: 2 }, // 3rd
          { id: "CRC", points: 0, goalsFor: 0 }, // 4th
        ],
      },
    };

    vi.mocked(prisma.team.findUniqueOrThrow).mockResolvedValue(mockTeam as any);

    const result = await calculatePathway("USA");

    // Verify returning team info
    expect(result.team.id).toBe("USA");
    expect(result.team.name).toBe("United States");
    expect(result.currentGroupPosition).toBe(1);

    // Verify round structures
    expect(result.rounds).toHaveLength(5);
    
    // R32 (Round of 32)
    expect(result.rounds[0].round).toBe("ROUND_OF_32");
    expect(result.rounds[0].bracketSlot).toBe("R32-M7"); // Group A, Pos 1 maps to R32-M7
    expect(result.rounds[0].possibleOpponents).toEqual(["3rd Place from Groups C, E, F, H, or I"]);

    // R16 (Round of 16)
    expect(result.rounds[1].round).toBe("ROUND_OF_16");
    expect(result.rounds[1].bracketSlot).toBe("R16-M4"); // R32-M7 maps to R16-M4
    expect(result.rounds[1].possibleOpponents).toContain("Winner R32-M7");

    // QF (Quarter-Final)
    expect(result.rounds[2].round).toBe("QUARTER_FINAL");
    expect(result.rounds[2].bracketSlot).toBe("QF-M3");

    // SF (Semi-Final)
    expect(result.rounds[3].round).toBe("SEMI_FINAL");
    expect(result.rounds[3].bracketSlot).toBe("SF-M2");

    // Final
    expect(result.rounds[4].round).toBe("FINAL");
    expect(result.rounds[4].bracketSlot).toBe("FINAL");
  });

  it("should calculate correct pathway for a team finishing 2nd in Group A", async () => {
    // Mock database output for a team finishing 2nd
    const mockTeam = {
      id: "MEX",
      name: "Mexico",
      groupId: "A",
      flagUrl: "/flags/mex.png",
      group: {
        teams: [
          { id: "USA", points: 9, goalsFor: 6 }, // 1st
          { id: "MEX", points: 6, goalsFor: 4 }, // 2nd
          { id: "CAN", points: 3, goalsFor: 2 }, // 3rd
          { id: "CRC", points: 0, goalsFor: 0 }, // 4th
        ],
      },
    };

    vi.mocked(prisma.team.findUniqueOrThrow).mockResolvedValue(mockTeam as any);

    const result = await calculatePathway("MEX");

    expect(result.team.id).toBe("MEX");
    expect(result.currentGroupPosition).toBe(2);
    
    // Group A, Pos 2 maps to R32-M1
    expect(result.rounds[0].bracketSlot).toBe("R32-M1");
    expect(result.rounds[0].possibleOpponents).toEqual(["Runner-up Group B"]);

    // R32-M1 maps to R16-M2
    expect(result.rounds[1].bracketSlot).toBe("R16-M2");
  });

  it("should fallback to TBD for invalid slots", async () => {
    // Mock database output with an unexpected position like 5th
    const mockTeam = {
      id: "CRC",
      name: "Costa Rica",
      groupId: "A",
      flagUrl: "/flags/crc.png",
      group: {
        teams: [
          { id: "USA", points: 9 },
          { id: "MEX", points: 6 },
          { id: "CAN", points: 3 },
          { id: "HON", points: 1 },
          { id: "CRC", points: 0 }, // Position 5 (invalid/fallback)
        ],
      },
    };

    vi.mocked(prisma.team.findUniqueOrThrow).mockResolvedValue(mockTeam as any);

    const result = await calculatePathway("CRC");
    expect(result.currentGroupPosition).toBe(5);
    expect(result.rounds[0].bracketSlot).toBe("TBD");
    expect(result.rounds[0].possibleOpponents).toEqual(["To be determined"]);
  });
});
