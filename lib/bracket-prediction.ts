// Helper logic for the World Cup 2026 Bracket prediction challenge

export const KNOCKOUT_FLOW: Record<
  number,
  { target: number; position: "home" | "away" }
> = {
  // Round of 32 -> Round of 16
  73: { target: 90, position: "home" },
  74: { target: 89, position: "home" },
  75: { target: 90, position: "away" },
  76: { target: 91, position: "home" },
  77: { target: 89, position: "away" },
  78: { target: 91, position: "away" },
  79: { target: 92, position: "home" },
  80: { target: 92, position: "away" },
  81: { target: 94, position: "home" },
  82: { target: 94, position: "away" },
  83: { target: 93, position: "home" },
  84: { target: 93, position: "away" },
  85: { target: 96, position: "home" },
  86: { target: 95, position: "home" },
  87: { target: 96, position: "away" },
  88: { target: 95, position: "away" },

  // Round of 16 -> Quarter-finals
  89: { target: 97, position: "home" },
  90: { target: 97, position: "away" },
  91: { target: 99, position: "home" },
  92: { target: 99, position: "away" },
  93: { target: 98, position: "home" },
  94: { target: 98, position: "away" },
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

export const MATCH_SOURCES: Record<number, { home: number; away: number }> = {
  // Round of 16
  89: { home: 74, away: 77 },
  90: { home: 73, away: 75 },
  91: { home: 76, away: 78 },
  92: { home: 79, away: 80 },
  93: { home: 83, away: 84 },
  94: { home: 81, away: 82 },
  95: { home: 86, away: 88 },
  96: { home: 85, away: 87 },

  // Quarter-finals
  97: { home: 89, away: 90 },
  98: { home: 93, away: 94 },
  99: { home: 91, away: 92 },
  100: { home: 95, away: 96 },

  // Semi-finals
  101: { home: 97, away: 98 },
  102: { home: 99, away: 100 },

  // Final
  104: { home: 101, away: 102 },
};

/**
 * Solves the allocation of the 8 selected third-place groups to the Round of 32 matches.
 * Uses a backtracking search over the FIFA 2026 knockout placeholders.
 */
export function allocateThirdPlaces(selectedGroups: string[]): Record<number, string> {
  const pools: Record<number, string[]> = {
    74: ["A", "B", "C", "D", "F"],
    77: ["C", "D", "F", "G", "H"],
    79: ["C", "E", "F", "H", "I"],
    80: ["E", "H", "I", "J", "K"],
    81: ["B", "E", "F", "I", "J"],
    82: ["A", "E", "H", "I", "J"],
    85: ["E", "F", "G", "I", "J"],
    87: ["D", "E", "I", "J", "L"],
  };

  const assignment: Record<number, string> = {};
  const used = new Set<string>();
  const matchNumbers = [74, 77, 79, 80, 81, 82, 85, 87];

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

/**
 * Encodes the bracket prediction state into a compact, URL-safe Base64 string.
 * Works perfectly on both the client (window.btoa) and the server (Buffer).
 */
export function encodePredictionState(state: {
  groupRankings: Record<string, string[]>;
  thirdPlaces: string[];
  knockoutPicks: Record<number, string>;
}): string {
  try {
    const jsonStr = JSON.stringify({
      g: state.groupRankings,
      t: state.thirdPlaces,
      k: state.knockoutPicks,
    });
    
    if (typeof window !== "undefined") {
      return btoa(jsonStr)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }
    return Buffer.from(jsonStr)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } catch (e) {
    console.error("Failed to encode bracket prediction:", e);
    return "";
  }
}

/**
 * Decodes a URL-safe Base64 string back into the bracket prediction state.
 * Works perfectly on both the client (window.atob) and the server (Buffer).
 */
export function decodePredictionState(code: string): {
  groupRankings: Record<string, string[]>;
  thirdPlaces: string[];
  knockoutPicks: Record<number, string>;
} | null {
  try {
    let base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    
    let jsonStr = "";
    if (typeof window !== "undefined") {
      jsonStr = atob(base64);
    } else {
      jsonStr = Buffer.from(base64, "base64").toString("utf-8");
    }
    
    const data = JSON.parse(jsonStr);
    return {
      groupRankings: data.g,
      thirdPlaces: data.t,
      knockoutPicks: data.k,
    };
  } catch (e) {
    console.error("Failed to decode bracket prediction:", e);
    return null;
  }
}
