// Helper logic for the World Cup 2026 Bracket prediction challenge

export const KNOCKOUT_FLOW: Record<
  number,
  { target: number; position: "home" | "away" }
> = {
  // Round of 32 -> Round of 16
  73: { target: 89, position: "home" },
  74: { target: 89, position: "away" },
  75: { target: 90, position: "home" },
  76: { target: 90, position: "away" },
  77: { target: 91, position: "home" },
  78: { target: 91, position: "away" },
  79: { target: 92, position: "home" },
  80: { target: 92, position: "away" },
  81: { target: 93, position: "home" },
  82: { target: 93, position: "away" },
  83: { target: 94, position: "home" },
  84: { target: 94, position: "away" },
  85: { target: 95, position: "home" },
  86: { target: 95, position: "away" },
  87: { target: 96, position: "home" },
  88: { target: 96, position: "away" },

  // Round of 16 -> Quarter-finals
  89: { target: 97, position: "home" },
  90: { target: 97, position: "away" },
  91: { target: 98, position: "home" },
  92: { target: 98, position: "away" },
  93: { target: 99, position: "home" },
  94: { target: 99, position: "away" },
  95: { target: 100, position: "home" },
  96: { target: 100, position: "away" },

  // Quarter-finals -> Semi-finals
  97: { target: 101, position: "home" },
  98: { target: 101, position: "away" },
  99: { target: 102, position: "home" },
  100: { target: 102, position: "away" },
};

// Special case for semi-finals: they feed both Final and Third Place
export const SEMI_FLOW: Record<
  number,
  { winnerTarget: number; loserTarget: number; position: "home" | "away" }
> = {
  101: { winnerTarget: 104, loserTarget: 103, position: "home" },
  102: { winnerTarget: 104, loserTarget: 103, position: "away" },
};

/**
 * Solves the allocation of the 8 selected third-place groups to the Round of 32 matches.
 * Uses a backtracking search over the FIFA 2026 knockout placeholders.
 */
export function allocateThirdPlaces(selectedGroups: string[]): Record<number, string> {
  const pools: Record<number, string[]> = {
    74: ["A", "B", "C", "D", "F"],
    88: ["A", "D", "E"],
    79: ["C", "E", "F", "H", "I"],
    77: ["C", "D", "F", "G", "H"],
    81: ["G", "H", "I"],
    86: ["H", "I", "L"],
    80: ["E", "H", "I", "J", "K"],
    82: ["J", "K", "L"],
  };

  const assignment: Record<number, string> = {};
  const used = new Set<string>();
  const matchNumbers = [74, 88, 79, 77, 81, 86, 80, 82];

  function backtrack(index: number): boolean {
    if (index === matchNumbers.length) return true;
    const matchNum = matchNumbers[index];
    const allowed = pools[matchNum];

    for (const group of selectedGroups) {
      if (!used.has(group) && allowed.includes(group)) {
        used.add(group);
        assignment[matchNum] = group;
        if (backtrack(index + 1)) return true;
        used.add(group); // backtrack
        delete assignment[matchNum];
        used.delete(group);
      }
    }
    return false;
  }

  // Run backtracking
  if (backtrack(0)) {
    return assignment;
  }

  // Fallback: greedy match
  const remainingMatches = matchNumbers.filter((m) => !assignment[m]);
  const unusedGroups = selectedGroups.filter((g) => !used.has(g));
  for (let i = 0; i < remainingMatches.length; i++) {
    if (unusedGroups[i]) {
      assignment[remainingMatches[i]] = unusedGroups[i];
    }
  }

  return assignment;
}
