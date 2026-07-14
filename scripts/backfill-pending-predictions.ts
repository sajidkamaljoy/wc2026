/**
 * backfill-pending-predictions.ts
 *
 * One-off script to retroactively grade all predictions that are stuck as
 * "Pending" (pointsEarned = null) for matches that have already finished.
 *
 * This fixes the AET bug where matches decided in extra time were not graded.
 *
 * Safe to run multiple times — gradePredictionsForMatch() only processes
 * predictions where pointsEarned IS NULL, so already-graded rows are skipped.
 *
 * Run with:
 *   npx tsx scripts/backfill-pending-predictions.ts
 */

import { prisma } from "../lib/db";
import { gradePredictionsForMatch } from "../lib/gradePredictions";

async function backfillPendingPredictions() {
  console.log("===========================================");
  console.log(" Backfill: Grading Pending Predictions");
  console.log("===========================================\n");

  // 1. Find all FINISHED matches that still have at least one ungraded prediction.
  const matchesWithPending = await prisma.match.findMany({
    where: {
      status: "FINISHED",
      homeScore: { not: null },
      awayScore: { not: null },
      predictions: {
        some: { pointsEarned: null },
      },
    },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      _count: {
        select: { predictions: true },
      },
    },
    orderBy: { matchNumber: "asc" },
  });

  if (matchesWithPending.length === 0) {
    console.log("✅ No pending predictions found — everything is already graded!");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${matchesWithPending.length} finished match(es) with pending predictions:\n`);

  for (const match of matchesWithPending) {
    const homeName = match.homeTeam?.name ?? "TBD";
    const awayName = match.awayTeam?.name ?? "TBD";
    const scoreLabel = match.homeScoreET !== null
      ? `${match.homeScore}–${match.awayScore} (AET: ${match.homeScoreET}–${match.awayScoreET})`
      : `${match.homeScore}–${match.awayScore}`;
    const pens = match.homeScorePens !== null
      ? ` [Pens: ${match.homeScorePens}–${match.awayScorePens}]`
      : "";

    console.log(`  Match #${match.matchNumber}: ${homeName} vs ${awayName} — ${scoreLabel}${pens}`);
  }

  console.log("\nStarting backfill...\n");

  let totalGraded = 0;
  let errorCount = 0;

  for (const match of matchesWithPending) {
    const homeName = match.homeTeam?.name ?? "TBD";
    const awayName = match.awayTeam?.name ?? "TBD";

    // Count ungraded predictions before running
    const pendingBefore = await prisma.prediction.count({
      where: { matchId: match.id, pointsEarned: null },
    });

    process.stdout.write(
      `  [#${match.matchNumber}] ${homeName} vs ${awayName} — ${pendingBefore} pending prediction(s) ... `
    );

    try {
      await gradePredictionsForMatch(match.id);

      // Count remaining ungraded predictions after grading
      const pendingAfter = await prisma.prediction.count({
        where: { matchId: match.id, pointsEarned: null },
      });

      const graded = pendingBefore - pendingAfter;
      totalGraded += graded;

      if (pendingAfter === 0) {
        console.log(`✅ Graded ${graded}`);
      } else {
        console.log(`⚠️  Graded ${graded}, ${pendingAfter} still pending (check match data)`);
      }
    } catch (err) {
      console.log(`❌ Error`);
      console.error(`     Error details:`, err);
      errorCount++;
    }
  }

  console.log("\n-------------------------------------------");
  console.log(`Total predictions graded : ${totalGraded}`);
  console.log(`Errors                   : ${errorCount}`);
  console.log("-------------------------------------------");

  if (errorCount === 0) {
    console.log("\n🎉 Backfill completed successfully!");
  } else {
    console.log(`\n⚠️  Backfill completed with ${errorCount} error(s). Check logs above.`);
  }

  // 2. Recompute every affected user's aggregate points total from scratch
  //    to ensure the cached `user.points` field is fully accurate.
  console.log("\nRecalculating user points totals...");

  const affectedUserIds = await prisma.prediction.findMany({
    where: {
      match: { status: "FINISHED" },
      pointsEarned: { not: null },
    },
    select: { userId: true },
    distinct: ["userId"],
  });

  let userUpdateCount = 0;
  for (const { userId } of affectedUserIds) {
    const { _sum } = await prisma.prediction.aggregate({
      where: { userId },
      _sum: { pointsEarned: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { points: _sum.pointsEarned ?? 0 },
    });
    userUpdateCount++;
  }

  console.log(`✅ Recalculated points for ${userUpdateCount} user(s).`);
  console.log("===========================================\n");

  await prisma.$disconnect();
}

backfillPendingPredictions().catch(async (err) => {
  console.error("Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
