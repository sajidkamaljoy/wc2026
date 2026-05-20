export const BRACKET = {
  // R32: maps groupId → position → { slot, opponents }
  R32: {
    A: {
      1: { slot: "R32-M1", opponents: ["3rd Place from Groups C, D, or E"] },
      2: { slot: "R32-M5", opponents: ["3rd Place from Groups B, C, or F"] },
      3: { slot: "TBD", opponents: ["Winner Group B or C (TBD)"] },
    },
    B: {
      1: { slot: "R32-M4", opponents: ["3rd Place from Groups A, D, or E"] },
      2: { slot: "R32-M8", opponents: ["3rd Place from Groups A, C, or D"] },
      3: { slot: "TBD", opponents: ["Winner Group A or G (TBD)"] },
    },
    C: {
      1: { slot: "R32-M2", opponents: ["Runner-up Group D"] },
      2: { slot: "R32-M5", opponents: ["Winner Group A"] }, // Corrected bracket logic mapping
      3: { slot: "TBD", opponents: ["Winner Group A or B (TBD)"] },
    },
    D: {
      1: { slot: "R32-M9", opponents: ["3rd Place from Groups G, H, or I"] },
      2: { slot: "R32-M2", opponents: ["Winner Group C"] },
      3: { slot: "TBD", opponents: ["Winner Group G or H (TBD)"] },
    },
    E: {
      1: { slot: "R32-M3", opponents: ["Runner-up Group F"] },
      2: { slot: "R32-M7", opponents: ["Winner Group F"] },
      3: { slot: "TBD", opponents: ["Winner Group A or B (TBD)"] },
    },
    F: {
      1: { slot: "R32-M7", opponents: ["Runner-up Group E"] },
      2: { slot: "R32-M3", opponents: ["Winner Group E"] },
      3: { slot: "TBD", opponents: ["Winner Group A or B (TBD)"] },
    },
    G: {
      1: { slot: "R32-M10", opponents: ["Runner-up Group H"] },
      2: { slot: "R32-M14", opponents: ["3rd Place from Groups H, I, or L"] },
      3: { slot: "TBD", opponents: ["Winner Group D or E (TBD)"] },
    },
    H: {
      1: { slot: "R32-M15", opponents: ["Runner-up Group I"] },
      2: { slot: "R32-M10", opponents: ["Winner Group G"] },
      3: { slot: "TBD", opponents: ["Winner Group D or G (TBD)"] },
    },
    I: {
      1: { slot: "R32-M11", opponents: ["Runner-up Group J"] },
      2: { slot: "R32-M15", opponents: ["Winner Group H"] },
      3: { slot: "TBD", opponents: ["Winner Group D or H (TBD)"] },
    },
    J: {
      1: { slot: "R32-M12", opponents: ["Runner-up Group K"] },
      2: { slot: "R32-M11", opponents: ["Winner Group I"] },
      3: { slot: "TBD", opponents: ["Winner Group I or K (TBD)"] },
    },
    K: {
      1: { slot: "R32-M16", opponents: ["Runner-up Group L"] },
      2: { slot: "R32-M12", opponents: ["Winner Group J"] },
      3: { slot: "TBD", opponents: ["Winner Group J or L (TBD)"] },
    },
    L: {
      1: { slot: "R32-M13", opponents: ["3rd Place from Groups J, K, or L"] },
      2: { slot: "R32-M16", opponents: ["Winner Group K"] },
      3: { slot: "TBD", opponents: ["Winner Group J or K (TBD)"] },
    },
  } as Record<string, Record<number, { slot: string; opponents: string[] }>>,

  // R16: maps R32 slot → { slot, opponents }
  R16: {
    "R32-M1": { slot: "R16-M1", opponents: ["Winner R32-M1", "Winner R32-M2"] },
    "R32-M2": { slot: "R16-M1", opponents: ["Winner R32-M1", "Winner R32-M2"] },
    "R32-M3": { slot: "R16-M2", opponents: ["Winner R32-M3", "Winner R32-M4"] },
    "R32-M4": { slot: "R16-M2", opponents: ["Winner R32-M3", "Winner R32-M4"] },
    "R32-M5": { slot: "R16-M3", opponents: ["Winner R32-M5", "Winner R32-M6"] },
    "R32-M6": { slot: "R16-M3", opponents: ["Winner R32-M5", "Winner R32-M6"] },
    "R32-M7": { slot: "R16-M4", opponents: ["Winner R32-M7", "Winner R32-M8"] },
    "R32-M8": { slot: "R16-M4", opponents: ["Winner R32-M7", "Winner R32-M8"] },
    "R32-M9":  { slot: "R16-M5", opponents: ["Winner R32-M9",  "Winner R32-M10"] },
    "R32-M10": { slot: "R16-M5", opponents: ["Winner R32-M9",  "Winner R32-M10"] },
    "R32-M11": { slot: "R16-M6", opponents: ["Winner R32-M11", "Winner R32-M12"] },
    "R32-M12": { slot: "R16-M6", opponents: ["Winner R32-M11", "Winner R32-M12"] },
    "R32-M13": { slot: "R16-M7", opponents: ["Winner R32-M13", "Winner R32-M14"] },
    "R32-M14": { slot: "R16-M7", opponents: ["Winner R32-M13", "Winner R32-M14"] },
    "R32-M15": { slot: "R16-M8", opponents: ["Winner R32-M15", "Winner R32-M16"] },
    "R32-M16": { slot: "R16-M8", opponents: ["Winner R32-M15", "Winner R32-M16"] },
  } as Record<string, { slot: string; opponents: string[] }>,

  QF: {
    "R16-M1": { slot: "QF-M1", opponents: ["Winner R16-M1", "Winner R16-M2"] },
    "R16-M2": { slot: "QF-M1", opponents: ["Winner R16-M1", "Winner R16-M2"] },
    "R16-M3": { slot: "QF-M2", opponents: ["Winner R16-M3", "Winner R16-M4"] },
    "R16-M4": { slot: "QF-M2", opponents: ["Winner R16-M3", "Winner R16-M4"] },
    "R16-M5": { slot: "QF-M3", opponents: ["Winner R16-M5", "Winner R16-M6"] },
    "R16-M6": { slot: "QF-M3", opponents: ["Winner R16-M5", "Winner R16-M6"] },
    "R16-M7": { slot: "QF-M4", opponents: ["Winner R16-M7", "Winner R16-M8"] },
    "R16-M8": { slot: "QF-M4", opponents: ["Winner R16-M7", "Winner R16-M8"] },
  } as Record<string, { slot: string; opponents: string[] }>,

  SF: {
    "QF-M1": { slot: "SF-M1", opponents: ["Winner QF-M1", "Winner QF-M2"] },
    "QF-M2": { slot: "SF-M1", opponents: ["Winner QF-M1", "Winner QF-M2"] },
    "QF-M3": { slot: "SF-M2", opponents: ["Winner QF-M3", "Winner QF-M4"] },
    "QF-M4": { slot: "SF-M2", opponents: ["Winner QF-M3", "Winner QF-M4"] },
  } as Record<string, { slot: string; opponents: string[] }>,
} as const;
