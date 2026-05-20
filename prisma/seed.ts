import { PrismaClient, Stage, MatchStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ─── GROUPS ──────────────────────────────────────────────────────────────────
const GROUPS = [
  { id: "A", name: "Group A" },
  { id: "B", name: "Group B" },
  { id: "C", name: "Group C" },
  { id: "D", name: "Group D" },
  { id: "E", name: "Group E" },
  { id: "F", name: "Group F" },
  { id: "G", name: "Group G" },
  { id: "H", name: "Group H" },
  { id: "I", name: "Group I" },
  { id: "J", name: "Group J" },
  { id: "K", name: "Group K" },
  { id: "L", name: "Group L" },
];

// ─── TEAMS ───────────────────────────────────────────────────────────────────
const TEAMS = [
  // Group A
  { id: "MEX", name: "Mexico",           shortName: "Mexico",      groupId: "A", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/mx.png" },
  { id: "KOR", name: "South Korea",      shortName: "Korea",       groupId: "A", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/kr.png" },
  { id: "ZAF", name: "South Africa",     shortName: "South Africa",groupId: "A", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/za.png" },
  { id: "CZE", name: "Czech Republic",   shortName: "Czechia",     groupId: "A", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/cz.png" },
  // Group B
  { id: "CAN", name: "Canada",           shortName: "Canada",      groupId: "B", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/ca.png" },
  { id: "SUI", name: "Switzerland",      shortName: "Switzerland", groupId: "B", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/ch.png" },
  { id: "QAT", name: "Qatar",            shortName: "Qatar",       groupId: "B", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/qa.png" },
  { id: "BIH", name: "Bosnia & Herz.",   shortName: "Bosnia",      groupId: "B", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/ba.png" },
  // Group C
  { id: "ARG", name: "Argentina",        shortName: "Argentina",   groupId: "C", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/ar.png" },
  { id: "NOR", name: "Norway",           shortName: "Norway",      groupId: "C", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/no.png" },
  { id: "CHI", name: "Chile",            shortName: "Chile",       groupId: "C", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/cl.png" },
  { id: "KSA", name: "Saudi Arabia",     shortName: "Saudi Arabia",groupId: "C", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/sa.png" },
  // Group D
  { id: "USA", name: "United States",    shortName: "USA",         groupId: "D", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/us.png" },
  { id: "POR", name: "Portugal",         shortName: "Portugal",    groupId: "D", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/pt.png" },
  { id: "TUN", name: "Tunisia",          shortName: "Tunisia",     groupId: "D", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/tn.png" },
  { id: "PAR", name: "Paraguay",         shortName: "Paraguay",    groupId: "D", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/py.png" },
  // Group E
  { id: "FRA", name: "France",           shortName: "France",      groupId: "E", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/fr.png" },
  { id: "AUT", name: "Austria",          shortName: "Austria",     groupId: "E", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/at.png" },
  { id: "JOR", name: "Jordan",           shortName: "Jordan",      groupId: "E", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/jo.png" },
  { id: "COD", name: "DR Congo",         shortName: "DR Congo",    groupId: "E", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/cd.png" },
  // Group F
  { id: "ESP", name: "Spain",            shortName: "Spain",       groupId: "F", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/es.png" },
  { id: "GER", name: "Germany",          shortName: "Germany",     groupId: "F", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/de.png" },
  { id: "JPN", name: "Japan",            shortName: "Japan",       groupId: "F", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/jp.png" },
  { id: "IRQ", name: "Iraq",             shortName: "Iraq",        groupId: "F", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/iq.png" },
  // Group G
  { id: "BEL", name: "Belgium",          shortName: "Belgium",     groupId: "G", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/be.png" },
  { id: "EGY", name: "Egypt",            shortName: "Egypt",       groupId: "G", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/eg.png" },
  { id: "AUS", name: "Australia",        shortName: "Australia",   groupId: "G", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/au.png" },
  { id: "ALG", name: "Algeria",          shortName: "Algeria",     groupId: "G", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/dz.png" },
  // Group H
  { id: "ENG", name: "England",          shortName: "England",     groupId: "H", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/gb-eng.png" },
  { id: "CRO", name: "Croatia",          shortName: "Croatia",     groupId: "H", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/hr.png" },
  { id: "SEN", name: "Senegal",          shortName: "Senegal",     groupId: "H", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/sn.png" },
  { id: "IRN", name: "Iran",             shortName: "Iran",        groupId: "H", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/ir.png" },
  // Group I
  { id: "NED", name: "Netherlands",      shortName: "Netherlands", groupId: "I", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/nl.png" },
  { id: "MAR", name: "Morocco",          shortName: "Morocco",     groupId: "I", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/ma.png" },
  { id: "GHA", name: "Ghana",            shortName: "Ghana",       groupId: "I", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/gh.png" },
  { id: "CIV", name: "Ivory Coast",      shortName: "Ivory Coast", groupId: "I", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/ci.png" },
  // Group J
  { id: "BRA", name: "Brazil",           shortName: "Brazil",      groupId: "J", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/br.png" },
  { id: "URU", name: "Uruguay",          shortName: "Uruguay",     groupId: "J", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/uy.png" },
  { id: "UZB", name: "Uzbekistan",       shortName: "Uzbekistan",  groupId: "J", confederation: "AFC",      flagUrl: "https://flagcdn.com/w40/uz.png" },
  { id: "CMR", name: "Cameroon",         shortName: "Cameroon",    groupId: "J", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/cm.png" },
  // Group K
  { id: "TUR", name: "Türkiye",          shortName: "Turkey",      groupId: "K", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/tr.png" },
  { id: "SWE", name: "Sweden",           shortName: "Sweden",      groupId: "K", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/se.png" },
  { id: "CPV", name: "Cape Verde",       shortName: "Cape Verde",  groupId: "K", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/cv.png" },
  { id: "HAI", name: "Haiti",            shortName: "Haiti",       groupId: "K", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/ht.png" },
  // Group L
  { id: "SCO", name: "Scotland",         shortName: "Scotland",    groupId: "L", confederation: "UEFA",     flagUrl: "https://flagcdn.com/w40/gb-sct.png" },
  { id: "ECU", name: "Ecuador",          shortName: "Ecuador",     groupId: "L", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/ec.png" },
  { id: "NGA", name: "Nigeria",          shortName: "Nigeria",     groupId: "L", confederation: "CAF",      flagUrl: "https://flagcdn.com/w40/ng.png" },
  { id: "CUW", name: "Curaçao",          shortName: "Curaçao",     groupId: "L", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/cw.png" },
];

// ─── VENUES ──────────────────────────────────────────────────────────────────
const VENUES = [
  { id: "mexico_city",    name: "Mexico City Stadium",           city: "Mexico City",    country: "Mexico",  capacity: 87523 },
  { id: "guadalajara",    name: "Guadalajara Stadium",           city: "Guadalajara",    country: "Mexico",  capacity: 49850 },
  { id: "monterrey",      name: "Monterrey Stadium",             city: "Monterrey",      country: "Mexico",  capacity: 53500 },
  { id: "dallas",         name: "Dallas Stadium",                city: "Dallas",         country: "USA",     capacity: 92967 },
  { id: "houston",        name: "Houston Stadium",               city: "Houston",        country: "USA",     capacity: 72220 },
  { id: "kansas_city",    name: "Kansas City Stadium",           city: "Kansas City",    country: "USA",     capacity: 76416 },
  { id: "los_angeles",    name: "Los Angeles Stadium",           city: "Los Angeles",    country: "USA",     capacity: 70240 },
  { id: "san_francisco",  name: "San Francisco Bay Area Stadium",city: "San Jose",       country: "USA",     capacity: 68500 },
  { id: "seattle",        name: "Seattle Stadium",               city: "Seattle",        country: "USA",     capacity: 68740 },
  { id: "miami",          name: "Miami Stadium",                 city: "Miami",          country: "USA",     capacity: 65326 },
  { id: "atlanta",        name: "Atlanta Stadium",               city: "Atlanta",        country: "USA",     capacity: 71000 },
  { id: "boston",         name: "Boston Stadium",                city: "Foxborough",     country: "USA",     capacity: 65878 },
  { id: "philadelphia",   name: "Philadelphia Stadium",          city: "Philadelphia",   country: "USA",     capacity: 68532 },
  { id: "new_york",       name: "New York New Jersey Stadium",   city: "East Rutherford",country: "USA",     capacity: 82500 },
  { id: "toronto",        name: "Toronto Stadium",               city: "Toronto",        country: "Canada",  capacity: 45500 },
  { id: "vancouver",      name: "Vancouver Stadium",             city: "Vancouver",      country: "Canada",  capacity: 54500 },
];

// ─── GROUP STAGE FIXTURES ────────────────────────────────────────────────────
const GROUP_FIXTURES: [number, string, string, string, string, string][] = [
  // Match 1 — opener
  [1,  "A", "MEX", "ZAF", "2026-06-11T19:00:00Z", "mexico_city"],
  // Group A
  [2,  "A", "KOR", "CZE", "2026-06-12T16:00:00Z", "los_angeles"],
  [3,  "A", "MEX", "KOR", "2026-06-16T19:00:00Z", "dallas"],
  [4,  "A", "CZE", "ZAF", "2026-06-16T22:00:00Z", "atlanta"],
  [5,  "A", "MEX", "CZE", "2026-06-20T22:00:00Z", "guadalajara"],
  [6,  "A", "ZAF", "KOR", "2026-06-20T22:00:00Z", "houston"],
  // Group B
  [7,  "B", "CAN", "QAT", "2026-06-12T22:00:00Z", "toronto"],
  [8,  "B", "SUI", "BIH", "2026-06-12T19:00:00Z", "kansas_city"],
  [9,  "B", "CAN", "SUI", "2026-06-17T19:00:00Z", "vancouver"],
  [10, "B", "BIH", "QAT", "2026-06-17T22:00:00Z", "seattle"],
  [11, "B", "CAN", "BIH", "2026-06-21T22:00:00Z", "toronto"],
  [12, "B", "QAT", "SUI", "2026-06-21T22:00:00Z", "san_francisco"],
  // Group C
  [13, "C", "ARG", "CHI", "2026-06-13T19:00:00Z", "miami"],
  [14, "C", "NOR", "KSA", "2026-06-13T22:00:00Z", "los_angeles"],
  [15, "C", "ARG", "NOR", "2026-06-18T19:00:00Z", "new_york"],
  [16, "C", "KSA", "CHI", "2026-06-18T22:00:00Z", "seattle"],
  [17, "C", "ARG", "KSA", "2026-06-22T22:00:00Z", "dallas"],
  [18, "C", "CHI", "NOR", "2026-06-22T22:00:00Z", "philadelphia"],
  // Group D
  [19, "D", "USA", "PAR", "2026-06-13T16:00:00Z", "dallas"],
  [20, "D", "POR", "TUN", "2026-06-13T22:00:00Z", "houston"],
  [21, "D", "USA", "POR", "2026-06-18T16:00:00Z", "kansas_city"],
  [22, "D", "TUN", "PAR", "2026-06-18T22:00:00Z", "miami"],
  [23, "D", "USA", "TUN", "2026-06-22T22:00:00Z", "atlanta"],
  [24, "D", "PAR", "POR", "2026-06-22T22:00:00Z", "boston"],
  // Group E
  [25, "E", "FRA", "COD", "2026-06-14T19:00:00Z", "san_francisco"],
  [26, "E", "AUT", "JOR", "2026-06-14T22:00:00Z", "houston"],
  [27, "E", "FRA", "AUT", "2026-06-19T19:00:00Z", "miami"],
  [28, "E", "JOR", "COD", "2026-06-19T22:00:00Z", "los_angeles"],
  [29, "E", "FRA", "JOR", "2026-06-23T22:00:00Z", "seattle"],
  [30, "E", "COD", "AUT", "2026-06-23T22:00:00Z", "philadelphia"],
  // Group F
  [31, "F", "ESP", "IRQ", "2026-06-14T16:00:00Z", "miami"],
  [32, "F", "GER", "JPN", "2026-06-14T22:00:00Z", "los_angeles"],
  [33, "F", "ESP", "GER", "2026-06-19T19:00:00Z", "new_york"],
  [34, "F", "JPN", "IRQ", "2026-06-19T22:00:00Z", "dallas"],
  [35, "F", "ESP", "JPN", "2026-06-23T22:00:00Z", "kansas_city"],
  [36, "F", "IRQ", "GER", "2026-06-23T22:00:00Z", "houston"],
  // Group G
  [37, "G", "BEL", "EGY", "2026-06-15T19:00:00Z", "atlanta"],
  [38, "G", "AUS", "ALG", "2026-06-15T22:00:00Z", "los_angeles"],
  [39, "G", "BEL", "AUS", "2026-06-20T19:00:00Z", "boston"],
  [40, "G", "ALG", "EGY", "2026-06-20T22:00:00Z", "dallas"],
  [41, "G", "BEL", "ALG", "2026-06-24T22:00:00Z", "philadelphia"],
  [42, "G", "EGY", "AUS", "2026-06-24T22:00:00Z", "san_francisco"],
  // Group H
  [43, "H", "ENG", "CRO", "2026-06-15T16:00:00Z", "dallas"],
  [44, "H", "SEN", "IRN", "2026-06-15T22:00:00Z", "houston"],
  [45, "H", "ENG", "SEN", "2026-06-20T19:00:00Z", "new_york"],
  [46, "H", "IRN", "CRO", "2026-06-20T22:00:00Z", "toronto"],
  [47, "H", "ENG", "IRN", "2026-06-24T22:00:00Z", "miami"],
  [48, "H", "CRO", "SEN", "2026-06-24T22:00:00Z", "seattle"],
  // Group I
  [49, "I", "NED", "CIV", "2026-06-16T16:00:00Z", "boston"],
  [50, "I", "MAR", "GHA", "2026-06-16T19:00:00Z", "philadelphia"],
  [51, "I", "NED", "MAR", "2026-06-21T19:00:00Z", "atlanta"],
  [52, "I", "GHA", "CIV", "2026-06-21T22:00:00Z", "kansas_city"],
  [53, "I", "NED", "GHA", "2026-06-25T22:00:00Z", "new_york"],
  [54, "I", "CIV", "MAR", "2026-06-25T22:00:00Z", "miami"],
  // Group J
  [55, "J", "BRA", "CMR", "2026-06-16T22:00:00Z", "san_francisco"],
  [56, "J", "URU", "UZB", "2026-06-16T22:00:00Z", "los_angeles"],
  [57, "J", "BRA", "URU", "2026-06-21T19:00:00Z", "dallas"],
  [58, "J", "UZB", "CMR", "2026-06-21T22:00:00Z", "houston"],
  [59, "J", "BRA", "UZB", "2026-06-25T22:00:00Z", "toronto"],
  [60, "J", "CMR", "URU", "2026-06-25T22:00:00Z", "vancouver"],
  // Group K
  [61, "K", "TUR", "HAI", "2026-06-17T16:00:00Z", "houston"],
  [62, "K", "SWE", "CPV", "2026-06-17T19:00:00Z", "philadelphia"],
  [63, "K", "TUR", "SWE", "2026-06-22T19:00:00Z", "boston"],
  [64, "K", "CPV", "HAI", "2026-06-22T22:00:00Z", "miami"],
  [65, "K", "TUR", "CPV", "2026-06-26T22:00:00Z", "dallas"],
  [66, "K", "HAI", "SWE", "2026-06-26T22:00:00Z", "atlanta"],
  // Group L
  [67, "L", "SCO", "CUW", "2026-06-17T22:00:00Z", "los_angeles"],
  [68, "L", "ECU", "NGA", "2026-06-17T22:00:00Z", "seattle"],
  [69, "L", "SCO", "ECU", "2026-06-22T19:00:00Z", "toronto"],
  [70, "L", "NGA", "CUW", "2026-06-22T22:00:00Z", "vancouver"],
  [71, "L", "SCO", "NGA", "2026-06-26T22:00:00Z", "new_york"],
  [72, "L", "CUW", "ECU", "2026-06-26T22:00:00Z", "san_francisco"],
];

// ─── KNOCKOUT PLACEHOLDER FIXTURES ──────────────────────────────────────────
const KNOCKOUT_FIXTURES: [number, Stage, string, string, string][] = [
  // Round of 32
  [73,  Stage.ROUND_OF_32, "Winner Group A",      "3rd Place C/D/E",      "2026-06-28T19:00:00Z"],
  [74,  Stage.ROUND_OF_32, "Runner-up Group A",   "3rd Place B/C/F",      "2026-06-28T22:00:00Z"],
  [75,  Stage.ROUND_OF_32, "Winner Group C",      "Runner-up Group D",    "2026-06-29T16:00:00Z"],
  [76,  Stage.ROUND_OF_32, "Winner Group E",      "Runner-up Group F",    "2026-06-29T19:00:00Z"],
  [77,  Stage.ROUND_OF_32, "Winner Group B",      "3rd Place A/D/E",      "2026-06-29T22:00:00Z"],
  [78,  Stage.ROUND_OF_32, "Runner-up Group C",   "3rd Place A/B/F",      "2026-06-30T19:00:00Z"],
  [79,  Stage.ROUND_OF_32, "Winner Group F",      "Runner-up Group E",    "2026-06-30T22:00:00Z"],
  [80,  Stage.ROUND_OF_32, "Runner-up Group B",   "3rd Place A/C/D",      "2026-07-01T19:00:00Z"],
  [81,  Stage.ROUND_OF_32, "Winner Group D",      "3rd Place G/H/I",      "2026-07-01T22:00:00Z"],
  [82,  Stage.ROUND_OF_32, "Runner-up Group D",   "3rd Place J/K/L",      "2026-07-02T16:00:00Z"],
  [83,  Stage.ROUND_OF_32, "Winner Group G",      "Runner-up Group H",    "2026-07-02T19:00:00Z"],
  [84,  Stage.ROUND_OF_32, "Winner Group I",      "Runner-up Group J",    "2026-07-02T22:00:00Z"],
  [85,  Stage.ROUND_OF_32, "Winner Group J",      "Runner-up Group K",    "2026-07-03T16:00:00Z"],
  [86,  Stage.ROUND_OF_32, "Runner-up Group G",   "3rd Place H/I/L",      "2026-07-03T19:00:00Z"],
  [87,  Stage.ROUND_OF_32, "Winner Group H",      "Runner-up Group I",    "2026-07-03T22:00:00Z"],
  [88,  Stage.ROUND_OF_32, "Winner Group K",      "Runner-up Group L",    "2026-07-04T19:00:00Z"],
  // Round of 16
  [89,  Stage.ROUND_OF_16, "Winner R32-M1",        "Winner R32-M2",        "2026-07-05T19:00:00Z"],
  [90,  Stage.ROUND_OF_16, "Winner R32-M3",        "Winner R32-M4",        "2026-07-05T22:00:00Z"],
  [91,  Stage.ROUND_OF_16, "Winner R32-M5",        "Winner R32-M6",        "2026-07-06T19:00:00Z"],
  [92,  Stage.ROUND_OF_16, "Winner R32-M7",        "Winner R32-M8",        "2026-07-06T22:00:00Z"],
  [93,  Stage.ROUND_OF_16, "Winner R32-M9",        "Winner R32-M10",       "2026-07-07T19:00:00Z"],
  [94,  Stage.ROUND_OF_16, "Winner R32-M11",       "Winner R32-M12",       "2026-07-07T22:00:00Z"],
  [95,  Stage.ROUND_OF_16, "Winner R32-M13",       "Winner R32-M14",       "2026-07-08T19:00:00Z"],
  [96,  Stage.ROUND_OF_16, "Winner R32-M15",       "Winner R32-M16",       "2026-07-08T22:00:00Z"],
  // Quarter-Finals
  [97,  Stage.QUARTER_FINAL, "Winner R16-M1",      "Winner R16-M2",        "2026-07-10T19:00:00Z"],
  [98,  Stage.QUARTER_FINAL, "Winner R16-M3",      "Winner R16-M4",        "2026-07-10T22:00:00Z"],
  [99,  Stage.QUARTER_FINAL, "Winner R16-M5",      "Winner R16-M6",        "2026-07-11T19:00:00Z"],
  [100, Stage.QUARTER_FINAL, "Winner R16-M7",      "Winner R16-M8",        "2026-07-11T22:00:00Z"],
  // Semi-Finals
  [101, Stage.SEMI_FINAL,  "Winner QF-M1",         "Winner QF-M2",         "2026-07-14T22:00:00Z"],
  [102, Stage.SEMI_FINAL,  "Winner QF-M3",         "Winner QF-M4",         "2026-07-15T22:00:00Z"],
  // 3rd Place
  [103, Stage.THIRD_PLACE, "Loser SF-M1",          "Loser SF-M2",          "2026-07-18T19:00:00Z"],
  // Final
  [104, Stage.FINAL,       "Winner SF-M1",         "Winner SF-M2",         "2026-07-19T22:00:00Z"],
];

const KNOCKOUT_VENUES: Record<number, string> = {
  73: "miami", 74: "dallas", 75: "new_york", 76: "los_angeles",
  77: "toronto", 78: "houston", 79: "seattle", 80: "san_francisco",
  81: "atlanta", 82: "boston", 83: "philadelphia", 84: "kansas_city",
  85: "guadalajara", 86: "monterrey", 87: "mexico_city", 88: "vancouver",
  89: "dallas", 90: "miami", 91: "new_york", 92: "los_angeles",
  93: "houston", 94: "seattle", 95: "san_francisco", 96: "atlanta",
  97: "dallas", 98: "new_york", 99: "miami", 100: "los_angeles",
  101: "dallas", 102: "new_york",
  103: "miami",
  104: "new_york",
};

async function main() {
  console.log("🌱 Seeding database…");

  // Groups
  for (const g of GROUPS) {
    await prisma.group.upsert({ where: { id: g.id }, update: {}, create: g });
  }
  console.log(`✅ ${GROUPS.length} groups`);

  // Venues
  for (const v of VENUES) {
    await prisma.venue.upsert({ where: { id: v.id }, update: {}, create: v });
  }
  console.log(`✅ ${VENUES.length} venues`);

  // Teams
  for (const t of TEAMS) {
    await prisma.team.upsert({ where: { id: t.id }, update: {}, create: t });
  }
  console.log(`✅ ${TEAMS.length} teams`);

  // Group stage fixtures
  for (const [n, gId, home, away, kickoff, venue] of GROUP_FIXTURES) {
    await prisma.match.upsert({
      where: { matchNumber: n },
      update: {},
      create: {
        matchNumber: n,
        stage: Stage.GROUP,
        groupId: gId,
        homeTeamId: home,
        awayTeamId: away,
        kickoffUtc: new Date(kickoff),
        venueId: venue,
        status: MatchStatus.SCHEDULED,
      },
    });
  }
  console.log(`✅ ${GROUP_FIXTURES.length} group stage fixtures`);

  // Knockout placeholder fixtures
  for (const [n, stage, homePH, awayPH, kickoff] of KNOCKOUT_FIXTURES) {
    await prisma.match.upsert({
      where: { matchNumber: n },
      update: {},
      create: {
        matchNumber: n,
        stage,
        homePlaceholder: homePH,
        awayPlaceholder: awayPH,
        kickoffUtc: new Date(kickoff),
        venueId: KNOCKOUT_VENUES[n] ?? "new_york",
        status: MatchStatus.SCHEDULED,
      },
    });
  }
  console.log(`✅ ${KNOCKOUT_FIXTURES.length} knockout placeholder fixtures`);
  console.log("🎉 Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
