import { PrismaClient, Stage, MatchStatus, Position, SquadStatus } from "@prisma/client";
import { SQUADS } from "./squadsData";

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
  { id: "MEX", name: "Mexico", shortName: "Mexico", groupId: "A", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/mx.png" },
  { id: "ZAF", name: "South Africa", shortName: "South Africa", groupId: "A", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/za.png" },
  { id: "KOR", name: "South Korea", shortName: "Korea", groupId: "A", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/kr.png" },
  { id: "CZE", name: "Czech Republic", shortName: "Czechia", groupId: "A", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/cz.png" },
  // Group B
  { id: "CAN", name: "Canada", shortName: "Canada", groupId: "B", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/ca.png" },
  { id: "BIH", name: "Bosnia & Herz.", shortName: "Bosnia", groupId: "B", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/ba.png" },
  { id: "QAT", name: "Qatar", shortName: "Qatar", groupId: "B", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/qa.png" },
  { id: "SUI", name: "Switzerland", shortName: "Switzerland", groupId: "B", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/ch.png" },
  // Group C
  { id: "BRA", name: "Brazil", shortName: "Brazil", groupId: "C", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/br.png" },
  { id: "MAR", name: "Morocco", shortName: "Morocco", groupId: "C", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/ma.png" },
  { id: "HAI", name: "Haiti", shortName: "Haiti", groupId: "C", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/ht.png" },
  { id: "SCO", name: "Scotland", shortName: "Scotland", groupId: "C", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/gb-sct.png" },
  // Group D
  { id: "USA", name: "United States", shortName: "USA", groupId: "D", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/us.png" },
  { id: "PAR", name: "Paraguay", shortName: "Paraguay", groupId: "D", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/py.png" },
  { id: "AUS", name: "Australia", shortName: "Australia", groupId: "D", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/au.png" },
  { id: "TUR", name: "Türkiye", shortName: "Turkey", groupId: "D", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/tr.png" },
  // Group E
  { id: "GER", name: "Germany", shortName: "Germany", groupId: "E", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/de.png" },
  { id: "CUW", name: "Curaçao", shortName: "Curaçao", groupId: "E", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/cw.png" },
  { id: "CIV", name: "Ivory Coast", shortName: "Ivory Coast", groupId: "E", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/ci.png" },
  { id: "ECU", name: "Ecuador", shortName: "Ecuador", groupId: "E", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/ec.png" },
  // Group F
  { id: "NED", name: "Netherlands", shortName: "Netherlands", groupId: "F", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/nl.png" },
  { id: "JPN", name: "Japan", shortName: "Japan", groupId: "F", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/jp.png" },
  { id: "SWE", name: "Sweden", shortName: "Sweden", groupId: "F", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/se.png" },
  { id: "TUN", name: "Tunisia", shortName: "Tunisia", groupId: "F", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/tn.png" },
  // Group G
  { id: "BEL", name: "Belgium", shortName: "Belgium", groupId: "G", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/be.png" },
  { id: "EGY", name: "Egypt", shortName: "Egypt", groupId: "G", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/eg.png" },
  { id: "IRN", name: "Iran", shortName: "Iran", groupId: "G", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/ir.png" },
  { id: "NZL", name: "New Zealand", shortName: "New Zealand", groupId: "G", confederation: "OFC", flagUrl: "https://flagcdn.com/w40/nz.png" },
  // Group H
  { id: "ESP", name: "Spain", shortName: "Spain", groupId: "H", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/es.png" },
  { id: "CPV", name: "Cape Verde", shortName: "Cape Verde", groupId: "H", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/cv.png" },
  { id: "KSA", name: "Saudi Arabia", shortName: "Saudi Arabia", groupId: "H", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/sa.png" },
  { id: "URU", name: "Uruguay", shortName: "Uruguay", groupId: "H", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/uy.png" },
  // Group I
  { id: "FRA", name: "France", shortName: "France", groupId: "I", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/fr.png" },
  { id: "SEN", name: "Senegal", shortName: "Senegal", groupId: "I", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/sn.png" },
  { id: "IRQ", name: "Iraq", shortName: "Iraq", groupId: "I", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/iq.png" },
  { id: "NOR", name: "Norway", shortName: "Norway", groupId: "I", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/no.png" },
  // Group J
  { id: "ARG", name: "Argentina", shortName: "Argentina", groupId: "J", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/ar.png" },
  { id: "ALG", name: "Algeria", shortName: "Algeria", groupId: "J", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/dz.png" },
  { id: "AUT", name: "Austria", shortName: "Austria", groupId: "J", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/at.png" },
  { id: "JOR", name: "Jordan", shortName: "Jordan", groupId: "J", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/jo.png" },
  // Group K
  { id: "POR", name: "Portugal", shortName: "Portugal", groupId: "K", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/pt.png" },
  { id: "COD", name: "DR Congo", shortName: "DR Congo", groupId: "K", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/cd.png" },
  { id: "UZB", name: "Uzbekistan", shortName: "Uzbekistan", groupId: "K", confederation: "AFC", flagUrl: "https://flagcdn.com/w40/uz.png" },
  { id: "COL", name: "Colombia", shortName: "Colombia", groupId: "K", confederation: "CONMEBOL", flagUrl: "https://flagcdn.com/w40/co.png" },
  // Group L
  { id: "ENG", name: "England", shortName: "England", groupId: "L", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/gb-eng.png" },
  { id: "CRO", name: "Croatia", shortName: "Croatia", groupId: "L", confederation: "UEFA", flagUrl: "https://flagcdn.com/w40/hr.png" },
  { id: "GHA", name: "Ghana", shortName: "Ghana", groupId: "L", confederation: "CAF", flagUrl: "https://flagcdn.com/w40/gh.png" },
  { id: "PAN", name: "Panama", shortName: "Panama", groupId: "L", confederation: "CONCACAF", flagUrl: "https://flagcdn.com/w40/pa.png" },
];

// ─── VENUES ──────────────────────────────────────────────────────────────────
const VENUES = [
  // Mexico
  { id: "mexico_city", name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 87523 },
  { id: "guadalajara", name: "Estadio Akron", city: "Guadalajara", country: "Mexico", capacity: 49850 },
  { id: "monterrey", name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: 53500 },
  // USA
  { id: "los_angeles", name: "SoFi Stadium", city: "Inglewood", country: "USA", capacity: 70240 },
  { id: "dallas", name: "AT&T Stadium", city: "Arlington", country: "USA", capacity: 92967 },
  { id: "houston", name: "NRG Stadium", city: "Houston", country: "USA", capacity: 72220 },
  { id: "san_francisco", name: "Levi's Stadium", city: "Santa Clara", country: "USA", capacity: 68500 },
  { id: "seattle", name: "Lumen Field", city: "Seattle", country: "USA", capacity: 68740 },
  { id: "miami", name: "Hard Rock Stadium", city: "Miami", country: "USA", capacity: 65326 },
  { id: "atlanta", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000 },
  { id: "boston", name: "Gillette Stadium", city: "Foxborough", country: "USA", capacity: 65878 },
  { id: "philadelphia", name: "Lincoln Financial Field", city: "Philadelphia", country: "USA", capacity: 68532 },
  { id: "new_york", name: "MetLife Stadium", city: "East Rutherford", country: "USA", capacity: 82500 },
  { id: "kansas_city", name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76416 },
  // Canada
  { id: "toronto", name: "BMO Field", city: "Toronto", country: "Canada", capacity: 45500 },
  { id: "vancouver", name: "BC Place", city: "Vancouver", country: "Canada", capacity: 54500 },
];

// ─── GROUP STAGE FIXTURES ────────────────────────────────────────────────────
// [matchNumber, groupId, homeTeamId, awayTeamId, kickoffUTC, venueId]
const GROUP_FIXTURES: [number, string, string, string, string, string][] = [
  // Group A
  [1, "A", "MEX", "ZAF", "2026-06-11T19:00:00Z", "mexico_city"],   // opener
  [2, "A", "KOR", "CZE", "2026-06-12T02:00:00Z", "guadalajara"],
  [3, "A", "CZE", "ZAF", "2026-06-18T16:00:00Z", "atlanta"],
  [4, "A", "MEX", "KOR", "2026-06-19T01:00:00Z", "guadalajara"],
  [5, "A", "CZE", "MEX", "2026-06-25T01:00:00Z", "mexico_city"],
  [6, "A", "ZAF", "KOR", "2026-06-25T01:00:00Z", "monterrey"],
  // Group B
  [7, "B", "CAN", "BIH", "2026-06-12T19:00:00Z", "toronto"],
  [8, "B", "QAT", "SUI", "2026-06-13T19:00:00Z", "san_francisco"],
  [9, "B", "SUI", "BIH", "2026-06-18T19:00:00Z", "los_angeles"],
  [10, "B", "CAN", "QAT", "2026-06-18T22:00:00Z", "vancouver"],
  [11, "B", "SUI", "CAN", "2026-06-24T19:00:00Z", "vancouver"],
  [12, "B", "BIH", "QAT", "2026-06-24T19:00:00Z", "seattle"],
  // Group C
  [13, "C", "BRA", "MAR", "2026-06-13T22:00:00Z", "new_york"],
  [14, "C", "HAI", "SCO", "2026-06-14T01:00:00Z", "boston"],
  [15, "C", "SCO", "MAR", "2026-06-19T22:00:00Z", "boston"],
  [16, "C", "BRA", "HAI", "2026-06-20T00:30:00Z", "philadelphia"],
  [17, "C", "SCO", "BRA", "2026-06-24T22:00:00Z", "miami"],
  [18, "C", "MAR", "HAI", "2026-06-24T22:00:00Z", "atlanta"],
  // Group D
  [19, "D", "USA", "PAR", "2026-06-13T01:00:00Z", "los_angeles"],
  [20, "D", "AUS", "TUR", "2026-06-13T04:00:00Z", "vancouver"],
  [21, "D", "USA", "AUS", "2026-06-19T19:00:00Z", "seattle"],
  [22, "D", "TUR", "PAR", "2026-06-20T03:00:00Z", "san_francisco"],
  [23, "D", "TUR", "USA", "2026-06-26T02:00:00Z", "los_angeles"],
  [24, "D", "PAR", "AUS", "2026-06-26T02:00:00Z", "san_francisco"],
  // Group E
  [25, "E", "GER", "CUW", "2026-06-14T17:00:00Z", "houston"],
  [26, "E", "CIV", "ECU", "2026-06-14T23:00:00Z", "philadelphia"],
  [27, "E", "GER", "CIV", "2026-06-20T20:00:00Z", "toronto"],
  [28, "E", "ECU", "CUW", "2026-06-21T00:00:00Z", "kansas_city"],
  [29, "E", "CUW", "CIV", "2026-06-25T20:00:00Z", "philadelphia"],
  [30, "E", "ECU", "GER", "2026-06-25T20:00:00Z", "new_york"],
  // Group F
  [31, "F", "NED", "JPN", "2026-06-14T20:00:00Z", "dallas"],
  [32, "F", "SWE", "TUN", "2026-06-15T02:00:00Z", "monterrey"],
  [33, "F", "NED", "SWE", "2026-06-20T17:00:00Z", "houston"],
  [34, "F", "TUN", "JPN", "2026-06-21T04:00:00Z", "monterrey"],
  [35, "F", "JPN", "SWE", "2026-06-25T23:00:00Z", "dallas"],
  [36, "F", "TUN", "NED", "2026-06-25T23:00:00Z", "kansas_city"],
  // Group G
  [37, "G", "BEL", "EGY", "2026-06-15T19:00:00Z", "seattle"],
  [38, "G", "IRN", "NZL", "2026-06-16T01:00:00Z", "los_angeles"],
  [39, "G", "BEL", "IRN", "2026-06-21T19:00:00Z", "los_angeles"],
  [40, "G", "NZL", "EGY", "2026-06-22T01:00:00Z", "vancouver"],
  [41, "G", "EGY", "IRN", "2026-06-27T03:00:00Z", "seattle"],
  [42, "G", "NZL", "BEL", "2026-06-27T03:00:00Z", "vancouver"],
  // Group H
  [43, "H", "ESP", "CPV", "2026-06-15T16:00:00Z", "atlanta"],
  [44, "H", "KSA", "URU", "2026-06-15T22:00:00Z", "miami"],
  [45, "H", "ESP", "KSA", "2026-06-21T16:00:00Z", "atlanta"],
  [46, "H", "URU", "CPV", "2026-06-21T22:00:00Z", "miami"],
  [47, "H", "CPV", "KSA", "2026-06-27T00:00:00Z", "houston"],
  [48, "H", "URU", "ESP", "2026-06-27T00:00:00Z", "guadalajara"],
  // Group I
  [49, "I", "FRA", "SEN", "2026-06-16T19:00:00Z", "new_york"],
  [50, "I", "IRQ", "NOR", "2026-06-16T22:00:00Z", "boston"],
  [51, "I", "FRA", "IRQ", "2026-06-22T21:00:00Z", "philadelphia"],
  [52, "I", "NOR", "SEN", "2026-06-23T00:00:00Z", "new_york"],
  [53, "I", "NOR", "FRA", "2026-06-26T19:00:00Z", "boston"],
  [54, "I", "SEN", "IRQ", "2026-06-26T19:00:00Z", "toronto"],
  // Group J
  [55, "J", "ARG", "ALG", "2026-06-17T01:00:00Z", "kansas_city"],
  [56, "J", "AUT", "JOR", "2026-06-17T04:00:00Z", "san_francisco"],
  [57, "J", "ARG", "AUT", "2026-06-22T17:00:00Z", "dallas"],
  [58, "J", "JOR", "ALG", "2026-06-23T03:00:00Z", "san_francisco"],
  [59, "J", "JOR", "ARG", "2026-06-28T02:00:00Z", "dallas"],
  [60, "J", "ALG", "AUT", "2026-06-28T02:00:00Z", "kansas_city"],
  // Group K
  [61, "K", "POR", "COD", "2026-06-17T17:00:00Z", "houston"],
  [62, "K", "UZB", "COL", "2026-06-18T02:00:00Z", "mexico_city"],
  [63, "K", "POR", "UZB", "2026-06-23T17:00:00Z", "houston"],
  [64, "K", "COL", "COD", "2026-06-24T02:00:00Z", "guadalajara"],
  [65, "K", "COL", "POR", "2026-06-27T23:30:00Z", "miami"],
  [66, "K", "COD", "UZB", "2026-06-27T23:30:00Z", "atlanta"],
  // Group L
  [67, "L", "ENG", "CRO", "2026-06-17T20:00:00Z", "dallas"],
  [68, "L", "GHA", "PAN", "2026-06-17T23:00:00Z", "toronto"],
  [69, "L", "ENG", "GHA", "2026-06-23T20:00:00Z", "boston"],
  [70, "L", "PAN", "CRO", "2026-06-23T23:00:00Z", "toronto"],
  [71, "L", "PAN", "ENG", "2026-06-27T21:00:00Z", "new_york"],
  [72, "L", "CRO", "GHA", "2026-06-27T21:00:00Z", "philadelphia"],
];

// ─── KNOCKOUT PLACEHOLDER FIXTURES ──────────────────────────────────────────
const KNOCKOUT_FIXTURES: [number, Stage, string, string, string][] = [
  // Round of 32
  [73, Stage.ROUND_OF_32, "Runner-up Group A", "Runner-up Group B", "2026-06-28T19:00:00Z"],
  [74, Stage.ROUND_OF_32, "Winner Group E", "3rd Place A/B/C/D/F", "2026-06-29T20:30:00Z"],
  [75, Stage.ROUND_OF_32, "Winner Group F", "Runner-up Group C", "2026-06-30T01:00:00Z"],
  [76, Stage.ROUND_OF_32, "Winner Group C", "Runner-up Group F", "2026-06-29T17:00:00Z"],
  [77, Stage.ROUND_OF_32, "Winner Group I", "3rd Place C/D/F/G/H", "2026-06-30T21:00:00Z"],
  [78, Stage.ROUND_OF_32, "Runner-up Group E", "Runner-up Group I", "2026-06-30T17:00:00Z"],
  [79, Stage.ROUND_OF_32, "Winner Group A", "3rd Place C/E/F/H/I", "2026-07-01T01:00:00Z"],
  [80, Stage.ROUND_OF_32, "Winner Group L", "3rd Place E/H/I/J/K", "2026-07-01T16:00:00Z"],
  [81, Stage.ROUND_OF_32, "Winner Group D", "3rd Place B/E/F/I/J", "2026-07-02T00:00:00Z"],
  [82, Stage.ROUND_OF_32, "Winner Group G", "3rd Place A/E/H/I/J", "2026-07-01T20:00:00Z"],
  [83, Stage.ROUND_OF_32, "Runner-up Group K", "Runner-up Group L", "2026-07-02T23:00:00Z"],
  [84, Stage.ROUND_OF_32, "Winner Group H", "Runner-up Group J", "2026-07-02T19:00:00Z"],
  [85, Stage.ROUND_OF_32, "Winner Group B", "3rd Place E/F/G/I/J", "2026-07-03T03:00:00Z"],
  [86, Stage.ROUND_OF_32, "Winner Group J", "Runner-up Group H", "2026-07-03T22:00:00Z"],
  [87, Stage.ROUND_OF_32, "Winner Group K", "3rd Place D/E/I/J/L", "2026-07-04T01:30:00Z"],
  [88, Stage.ROUND_OF_32, "Runner-up Group D", "Runner-up Group G", "2026-07-03T18:00:00Z"],
  // Round of 16
  [89, Stage.ROUND_OF_16, "Winner R32-M2", "Winner R32-M5", "2026-07-05T19:00:00Z"],
  [90, Stage.ROUND_OF_16, "Winner R32-M1", "Winner R32-M3", "2026-07-05T22:00:00Z"],
  [91, Stage.ROUND_OF_16, "Winner R32-M4", "Winner R32-M6", "2026-07-06T19:00:00Z"],
  [92, Stage.ROUND_OF_16, "Winner R32-M7", "Winner R32-M8", "2026-07-06T22:00:00Z"],
  [93, Stage.ROUND_OF_16, "Winner R32-M11", "Winner R32-M12", "2026-07-07T19:00:00Z"],
  [94, Stage.ROUND_OF_16, "Winner R32-M9", "Winner R32-M10", "2026-07-07T22:00:00Z"],
  [95, Stage.ROUND_OF_16, "Winner R32-M14", "Winner R32-M16", "2026-07-08T19:00:00Z"],
  [96, Stage.ROUND_OF_16, "Winner R32-M13", "Winner R32-M15", "2026-07-08T22:00:00Z"],
  // Quarter-Finals
  [97, Stage.QUARTER_FINAL, "Winner R16-M1", "Winner R16-M2", "2026-07-10T19:00:00Z"], // already correct
  [98, Stage.QUARTER_FINAL, "Winner R16-M5", "Winner R16-M6", "2026-07-10T22:00:00Z"], // was M3/M4
  [99, Stage.QUARTER_FINAL, "Winner R16-M3", "Winner R16-M4", "2026-07-11T19:00:00Z"], // was M5/M6
  [100, Stage.QUARTER_FINAL, "Winner R16-M7", "Winner R16-M8", "2026-07-11T22:00:00Z"], // already correct
  // Semi-Finals
  [101, Stage.SEMI_FINAL, "Winner QF-M1", "Winner QF-M2", "2026-07-14T22:00:00Z"],
  [102, Stage.SEMI_FINAL, "Winner QF-M3", "Winner QF-M4", "2026-07-15T22:00:00Z"],
  // 3rd Place
  [103, Stage.THIRD_PLACE, "Loser SF-M1", "Loser SF-M2", "2026-07-18T19:00:00Z"],
  // Final
  [104, Stage.FINAL, "Winner SF-M1", "Winner SF-M2", "2026-07-19T19:00:00Z"],
];

const KNOCKOUT_VENUES: Record<number, string> = {
  // Round of 32
  73: "los_angeles", 74: "boston", 75: "monterrey", 76: "houston",
  77: "new_york", 78: "dallas", 79: "mexico_city", 80: "atlanta",
  81: "san_francisco", 82: "seattle", 83: "toronto", 84: "los_angeles",
  85: "vancouver", 86: "miami", 87: "kansas_city", 88: "dallas",
  // Round of 16
  89: "philadelphia", 90: "houston", 91: "new_york", 92: "mexico_city",
  93: "dallas", 94: "seattle", 95: "atlanta", 96: "vancouver",
  // Quarter-Finals
  97: "boston", 98: "los_angeles", 99: "miami", 100: "kansas_city",
  // Semi-Finals
  101: "dallas", 102: "atlanta",
  // 3rd Place
  103: "miami",
  // Final
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

  // Seeding Squads / Players
  console.log("👥 Seeding team squads/players...");
  let playersSeededCount = 0;
  for (const t of TEAMS) {
    const squad = SQUADS[t.id];
    const playersToSeed: {
      sortIndex: number;
      name: string;
      position: Position;
      shirtNumber: number | null;
      club: string | null;
      age: number | null;
      caps: number | null;
      isPlaceholder: boolean;
      squadStatus: SquadStatus;
    }[] = [];

    if (squad) {
      squad.players.forEach((p, idx) => {
        playersToSeed.push({
          sortIndex: idx,
          name: p.name,
          position: p.position as Position,
          shirtNumber: p.shirtNumber ?? null,
          club: p.club ?? null,
          age: p.age ?? null,
          caps: p.caps ?? null,
          isPlaceholder: false,
          squadStatus: squad.status as SquadStatus,
        });
      });
    } else {
      // 26 placeholder players: 3 GK, 8 DEF, 8 MID, 7 FWD
      for (let idx = 0; idx < 26; idx++) {
        let position: Position = Position.GK;
        if (idx >= 3 && idx < 11) position = Position.DEF;
        else if (idx >= 11 && idx < 19) position = Position.MID;
        else if (idx >= 19) position = Position.FWD;

        playersToSeed.push({
          sortIndex: idx,
          name: "Player TBD",
          position,
          shirtNumber: null,
          club: null,
          age: null,
          caps: null,
          isPlaceholder: true,
          squadStatus: SquadStatus.TBD,
        });
      }
    }

    for (const p of playersToSeed) {
      await prisma.player.upsert({
        where: {
          teamId_sortIndex: {
            teamId: t.id,
            sortIndex: p.sortIndex,
          },
        },
        update: {
          name: p.name,
          position: p.position,
          shirtNumber: p.shirtNumber,
          club: p.club,
          age: p.age,
          caps: p.caps,
          isPlaceholder: p.isPlaceholder,
          squadStatus: p.squadStatus,
        },
        create: {
          teamId: t.id,
          sortIndex: p.sortIndex,
          name: p.name,
          position: p.position,
          shirtNumber: p.shirtNumber,
          club: p.club,
          age: p.age,
          caps: p.caps,
          isPlaceholder: p.isPlaceholder,
          squadStatus: p.squadStatus,
        },
      });
      playersSeededCount++;
    }
  }
  console.log(`✅ ${playersSeededCount} players/placeholders seeded`);

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
      update: {
        stage,
        homePlaceholder: homePH,
        awayPlaceholder: awayPH,
        kickoffUtc: new Date(kickoff),
        venueId: KNOCKOUT_VENUES[n] ?? "new_york",
      },
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