import { prisma } from "./db";

/**
 * Grades all predictions for a given match and updates user points.
 * - Exact score: +3 points
 * - Correct outcome: +1 point
 * - Incorrect: 0 points
 */
export async function gradePredictionsForMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match || match.status !== "FINISHED" || match.homeScore === null || match.awayScore === null) {
    console.log(`[GradePredictions] Match ${matchId} is not finished or lacks scores.`);
    return;
  }

  const predictions = await prisma.prediction.findMany({
    where: { matchId: matchId, pointsEarned: null }, // Only grade ungraded
  });

  if (predictions.length === 0) {
    return;
  }

  const actualHome = match.homeScore;
  const actualAway = match.awayScore;
  const actualOutcome = actualHome > actualAway ? 'HOME_WIN' : actualHome < actualAway ? 'AWAY_WIN' : 'DRAW';

  for (const prediction of predictions) {
    let pointsEarned = 0;
    const predHome = prediction.homeScore;
    const predAway = prediction.awayScore;
    const predOutcome = predHome > predAway ? 'HOME_WIN' : predHome < predAway ? 'AWAY_WIN' : 'DRAW';

    if (predHome === actualHome && predAway === actualAway) {
      pointsEarned = 3;
    } else if (predOutcome === actualOutcome) {
      pointsEarned = 1;
    }

    // Update the prediction
    await prisma.prediction.update({
      where: { id: prediction.id },
      data: { pointsEarned },
    });

    // Recalculate user's total points
    const { _sum } = await prisma.prediction.aggregate({
      where: { userId: prediction.userId },
      _sum: { pointsEarned: true }
    });

    // Update user's cached total points
    await prisma.user.update({
      where: { id: prediction.userId },
      data: { points: _sum.pointsEarned || 0 },
    });
  }
  
  console.log(`[GradePredictions] Graded ${predictions.length} predictions for match ${matchId}.`);
}
