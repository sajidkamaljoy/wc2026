/**
 * Script: fix-knockout-times.ts
 *
 * Patches all knockout match kickoff times in the DB to match
 * the official FIFA World Cup 2026 schedule (confirmed by Sky Sports / Al Jazeera).
 *
 * Times are in UTC.
 * UK BST (UTC+1) source times have been converted by subtracting 1 hour.
 */
import { prisma } from "../lib/db";

// matchNumber → correct kickoff UTC string
const CORRECT_TIMES: Record<number, string> = {
  // ── Round of 16 ──────────────────────────────────────────────────────────
  // Sat Jul 4 (UTC)
  90: "2026-07-04T17:00:00Z", // Canada vs Morocco     — Houston         (6pm BST)
  89: "2026-07-04T21:00:00Z", // Paraguay vs France    — Philadelphia    (10pm BST)
  // Sun Jul 5 (UTC)
  91: "2026-07-05T20:00:00Z", // Brazil vs Norway      — New Jersey      (9pm BST)
  // Mon Jul 6 (UTC)
  92: "2026-07-06T00:00:00Z", // Mexico vs England     — Mexico City     (1am BST Mon)
  93: "2026-07-06T19:00:00Z", // Portugal vs Spain     — Dallas          (8pm BST)
  // Tue Jul 7 (UTC)
  94: "2026-07-07T00:00:00Z", // USA vs Belgium        — Seattle         (1am BST Tue)
  95: "2026-07-07T16:00:00Z", // Argentina vs Egypt    — Atlanta         (5pm BST)
  96: "2026-07-07T20:00:00Z", // Switzerland vs Colombia — Vancouver     (9pm BST)

  // ── Quarter-Finals ───────────────────────────────────────────────────────
  // Thu Jul 9 (UTC)
  97:  "2026-07-09T20:00:00Z", // M89/M90 winners — Foxborough (Boston)  (9pm BST)
  // Fri Jul 10 (UTC)
  98:  "2026-07-10T19:00:00Z", // M93/M94 winners — Los Angeles          (8pm BST)
  // Sat Jul 11 (UTC)
  99:  "2026-07-11T21:00:00Z", // M91/M92 winners — Miami                (10pm BST)
  // Sun Jul 12 (UTC)
  100: "2026-07-12T01:00:00Z", // M95/M96 winners — Kansas City          (2am BST Sun)

  // ── Semi-Finals ──────────────────────────────────────────────────────────
  // Tue Jul 14 (UTC)
  101: "2026-07-14T19:00:00Z", // QF-M1 vs QF-M2 winners — Dallas        (8pm BST)
  // Wed Jul 15 (UTC)
  102: "2026-07-15T19:00:00Z", // QF-M3 vs QF-M4 winners — Atlanta       (8pm BST)

  // ── 3rd Place Play-off ───────────────────────────────────────────────────
  // Sat Jul 18 (UTC)
  103: "2026-07-18T21:00:00Z", // SF Losers — Miami                       (10pm BST)

  // ── Final ────────────────────────────────────────────────────────────────
  // Sun Jul 19 (UTC)
  104: "2026-07-19T19:00:00Z", // SF Winners — New Jersey                 (8pm BST)
};

async function main() {
  console.log("⏰ Patching knockout kickoff times to official schedule...\n");

  let updated = 0;
  for (const [num, kickoff] of Object.entries(CORRECT_TIMES)) {
    const matchNumber = parseInt(num);
    const result = await prisma.match.updateMany({
      where: { matchNumber },
      data: { kickoffUtc: new Date(kickoff) },
    });
    if (result.count > 0) {
      console.log(`✅ Match #${matchNumber}: kickoff → ${kickoff}`);
      updated++;
    } else {
      console.warn(`⚠️  Match #${matchNumber}: not found in DB`);
    }
  }

  console.log(`\n✅ Done — updated ${updated} match(es).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
