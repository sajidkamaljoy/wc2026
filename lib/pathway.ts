import { prisma } from "./db";
import { BRACKET } from "./constants";
import type { TeamPathway, PathwayRound } from "@/types";

export async function calculatePathway(teamId: string): Promise<TeamPathway> {
  // 1. Load team with group and current standings
  const team = await prisma.team.findUniqueOrThrow({
    where: { id: teamId },
    include: {
      group: {
        include: {
          teams: { orderBy: [{ points: "desc" }, { goalsFor: "desc" }] },
        },
      },
    },
  });

  const groupTeams = team.group.teams;
  const currentPosition =
    groupTeams.findIndex((t) => t.id === teamId) + 1; // 1-indexed

  const groupId = team.groupId; // "A" through "L"
  const rounds: PathwayRound[] = [];

  // R32
  const r32Slot = getR32Slot(groupId, currentPosition);
  rounds.push({
    round: "ROUND_OF_32",
    label: "Round of 32",
    possibleOpponents: r32Slot.opponents,
    bracketSlot: r32Slot.slot,
  });

  // R16
  const r16Slot = getR16Slot(r32Slot.slot);
  rounds.push({
    round: "ROUND_OF_16",
    label: "Round of 16",
    possibleOpponents: r16Slot.opponents,
    bracketSlot: r16Slot.slot,
  });

  // QF
  const qfSlot = getQFSlot(r16Slot.slot);
  rounds.push({
    round: "QUARTER_FINAL",
    label: "Quarter-Final",
    possibleOpponents: qfSlot.opponents,
    bracketSlot: qfSlot.slot,
  });

  // SF
  const sfSlot = getSFSlot(qfSlot.slot);
  rounds.push({
    round: "SEMI_FINAL",
    label: "Semi-Final",
    possibleOpponents: sfSlot.opponents,
    bracketSlot: sfSlot.slot,
  });

  // Final
  rounds.push({
    round: "FINAL",
    label: "Final",
    possibleOpponents: ["Best team from the other half of the bracket"],
    bracketSlot: "FINAL",
  });

  return {
    team: {
      id: team.id,
      name: team.name,
      groupId: team.groupId,
      flagUrl: team.flagUrl,
    },
    currentGroupPosition: currentPosition,
    rounds,
  };
}

// Helper: maps (groupId, position) → R32 slot and opponent description
function getR32Slot(
  groupId: string,
  position: number
): { slot: string; opponents: string[] } {
  return BRACKET.R32[groupId]?.[position] ?? {
    slot: "TBD",
    opponents: ["To be determined"],
  };
}

function getR16Slot(r32Slot: string): { slot: string; opponents: string[] } {
  return BRACKET.R16[r32Slot] ?? { slot: "TBD", opponents: ["TBD"] };
}

function getQFSlot(r16Slot: string): { slot: string; opponents: string[] } {
  return BRACKET.QF[r16Slot] ?? { slot: "TBD", opponents: ["TBD"] };
}

function getSFSlot(qfSlot: string): { slot: string; opponents: string[] } {
  return BRACKET.SF[qfSlot] ?? { slot: "TBD", opponents: ["TBD"] };
}
