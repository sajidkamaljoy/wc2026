export const BRACKET = {
  // R32: maps groupId → position → { slot, opponents }
  R32: {
    A: {
      1: { slot: "R32-M7", opponents: ["3rd Place from Groups C, E, F, H, or I"] },
      2: { slot: "R32-M1", opponents: ["Runner-up Group B"] },
      3: { slot: "TBD", opponents: ["Winner Group E or G (TBD)"] },
    },
    B: {
      1: { slot: "R32-M13", opponents: ["3rd Place from Groups E, F, G, I, or J"] },
      2: { slot: "R32-M1", opponents: ["Runner-up Group A"] },
      3: { slot: "TBD", opponents: ["Winner Group D or E (TBD)"] },
    },
    C: {
      1: { slot: "R32-M4", opponents: ["Runner-up Group F"] },
      2: { slot: "R32-M3", opponents: ["Winner Group F"] },
      3: { slot: "TBD", opponents: ["Winner Group A, E, or I (TBD)"] },
    },
    D: {
      1: { slot: "R32-M9", opponents: ["3rd Place from Groups B, E, F, I, or J"] },
      2: { slot: "R32-M16", opponents: ["Runner-up Group G"] },
      3: { slot: "TBD", opponents: ["Winner Group E, I, or K (TBD)"] },
    },
    E: {
      1: { slot: "R32-M2", opponents: ["3rd Place from Groups A, B, C, D, or F"] },
      2: { slot: "R32-M6", opponents: ["Runner-up Group I"] },
      3: { slot: "TBD", opponents: ["Winner Group A, D, G, K, or L (TBD)"] },
    },
    F: {
      1: { slot: "R32-M3", opponents: ["Runner-up Group C"] },
      2: { slot: "R32-M4", opponents: ["Winner Group C"] },
      3: { slot: "TBD", opponents: ["Winner Group A, B, D, E, or I (TBD)"] },
    },
    G: {
      1: { slot: "R32-M10", opponents: ["3rd Place from Groups A, E, H, I, or J"] },
      2: { slot: "R32-M16", opponents: ["Runner-up Group D"] },
      3: { slot: "TBD", opponents: ["Winner Group B or I (TBD)"] },
    },
    H: {
      1: { slot: "R32-M12", opponents: ["Runner-up Group J"] },
      2: { slot: "R32-M14", opponents: ["Winner Group J"] },
      3: { slot: "TBD", opponents: ["Winner Group A, G, I, or L (TBD)"] },
    },
    I: {
      1: { slot: "R32-M5", opponents: ["3rd Place from Groups C, D, F, G, or H"] },
      2: { slot: "R32-M6", opponents: ["Runner-up Group E"] },
      3: { slot: "TBD", opponents: ["Winner Group A, B, D, G, K, or L (TBD)"] },
    },
    J: {
      1: { slot: "R32-M14", opponents: ["Runner-up Group H"] },
      2: { slot: "R32-M12", opponents: ["Winner Group H"] },
      3: { slot: "TBD", opponents: ["Winner Group B, D, G, K, or L (TBD)"] },
    },
    K: {
      1: { slot: "R32-M15", opponents: ["3rd Place from Groups D, E, I, J, or L"] },
      2: { slot: "R32-M11", opponents: ["Runner-up Group L"] },
      3: { slot: "TBD", opponents: ["Winner Group L (TBD)"] },
    },
    L: {
      1: { slot: "R32-M8", opponents: ["3rd Place from Groups E, H, I, J, or K"] },
      2: { slot: "R32-M11", opponents: ["Runner-up Group K"] },
      3: { slot: "TBD", opponents: ["Winner Group K (TBD)"] },
    },
  } as Record<string, Record<number, { slot: string; opponents: string[] }>>,

  // R16: maps R32 slot → { slot, opponents }
  R16: {
    "R32-M1": { slot: "R16-M2", opponents: ["Winner R32-M1", "Winner R32-M3"] },
    "R32-M2": { slot: "R16-M1", opponents: ["Winner R32-M2", "Winner R32-M5"] },
    "R32-M3": { slot: "R16-M2", opponents: ["Winner R32-M1", "Winner R32-M3"] },
    "R32-M4": { slot: "R16-M3", opponents: ["Winner R32-M4", "Winner R32-M6"] },
    "R32-M5": { slot: "R16-M1", opponents: ["Winner R32-M2", "Winner R32-M5"] },
    "R32-M6": { slot: "R16-M3", opponents: ["Winner R32-M4", "Winner R32-M6"] },
    "R32-M7": { slot: "R16-M4", opponents: ["Winner R32-M7", "Winner R32-M8"] },
    "R32-M8": { slot: "R16-M4", opponents: ["Winner R32-M7", "Winner R32-M8"] },
    "R32-M9":  { slot: "R16-M6", opponents: ["Winner R32-M9", "Winner R32-M10"] },
    "R32-M10": { slot: "R16-M6", opponents: ["Winner R32-M9", "Winner R32-M10"] },
    "R32-M11": { slot: "R16-M5", opponents: ["Winner R32-M11", "Winner R32-M12"] },
    "R32-M12": { slot: "R16-M5", opponents: ["Winner R32-M11", "Winner R32-M12"] },
    "R32-M13": { slot: "R16-M8", opponents: ["Winner R32-M13", "Winner R32-M15"] },
    "R32-M14": { slot: "R16-M7", opponents: ["Winner R32-M14", "Winner R32-M16"] },
    "R32-M15": { slot: "R16-M8", opponents: ["Winner R32-M13", "Winner R32-M15"] },
    "R32-M16": { slot: "R16-M7", opponents: ["Winner R32-M14", "Winner R32-M16"] },
  } as Record<string, { slot: string; opponents: string[] }>,

  QF: {
    "R16-M1": { slot: "QF-M1", opponents: ["Winner R16-M1", "Winner R16-M2"] },
    "R16-M2": { slot: "QF-M1", opponents: ["Winner R16-M1", "Winner R16-M2"] },
    "R16-M3": { slot: "QF-M3", opponents: ["Winner R16-M3", "Winner R16-M4"] },
    "R16-M4": { slot: "QF-M3", opponents: ["Winner R16-M3", "Winner R16-M4"] },
    "R16-M5": { slot: "QF-M2", opponents: ["Winner R16-M5", "Winner R16-M6"] },
    "R16-M6": { slot: "QF-M2", opponents: ["Winner R16-M5", "Winner R16-M6"] },
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
