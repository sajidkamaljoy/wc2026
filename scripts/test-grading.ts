import { prisma } from "../lib/db";
import { gradePredictionsForMatch } from "../lib/gradePredictions";

async function testGrading() {
  console.log("=========================================");
  console.log("Testing Score Grading & Points Engine");
  console.log("=========================================");

  // Find a match to test with
  const match = await prisma.match.findFirst({
    where: {
      homeTeamId: { not: null },
      awayTeamId: { not: null }
    },
    include: { homeTeam: true, awayTeam: true }
  });

  if (!match) {
    console.error("❌ No matches found in database to test grading.");
    return;
  }

  console.log(`Using Match #${match.matchNumber}: ${match.homeTeam?.name} vs ${match.awayTeam?.name} (ID: ${match.id})`);
  console.log(`Original Match Status: ${match.status}, Score: ${match.homeScore}-${match.awayScore}`);

  // Create three temporary users with different predictions
  const testUsers = [
    { deviceId: "test-user-exact", nickname: "Gamer_Exact", predHome: 3, predAway: 1, expectedPoints: 3 },
    { deviceId: "test-user-outcome", nickname: "Gamer_Outcome", predHome: 2, predAway: 0, expectedPoints: 1 },
    { deviceId: "test-user-wrong", nickname: "Gamer_Wrong", predHome: 0, predAway: 2, expectedPoints: 0 }
  ];

  const dbUsers = [];
  const dbPredictions = [];

  try {
    // 1. Clean up any leftover test data
    await prisma.prediction.deleteMany({
      where: { userId: { in: testUsers.map(u => u.deviceId) } }
    });
    await prisma.user.deleteMany({
      where: { deviceId: { in: testUsers.map(u => u.deviceId) } }
    });

    // 2. Create users and predictions
    for (const u of testUsers) {
      const dbUser = await prisma.user.create({
        data: {
          deviceId: u.deviceId,
          nickname: u.nickname,
          points: 0
        }
      });
      dbUsers.push(dbUser);

      const dbPred = await prisma.prediction.create({
        data: {
          userId: dbUser.id,
          matchId: match.id,
          homeScore: u.predHome,
          awayScore: u.predAway
        }
      });
      dbPredictions.push(dbPred);
    }

    console.log("✅ Created 3 test users and predictions (3-1, 2-0, 0-2)");

    // 3. Set match to FINISHED with actual score 3-1
    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: "FINISHED",
        homeScore: 3,
        awayScore: 1
      }
    });

    console.log("✅ Set match status to FINISHED with actual score 3-1");

    // 4. Run the grading engine
    await gradePredictionsForMatch(match.id);

    // 5. Verify outcomes
    console.log("\nVerifying graded points:");
    let allOk = true;

    for (let i = 0; i < testUsers.length; i++) {
      const u = testUsers[i];
      const dbUser = dbUsers[i];
      
      const updatedUser = await prisma.user.findUnique({
        where: { id: dbUser.id }
      });

      const updatedPred = await prisma.prediction.findUnique({
        where: { id: dbPredictions[i].id }
      });

      const userPoints = updatedUser?.points ?? 0;
      const predPoints = updatedPred?.pointsEarned ?? null;

      console.log(`- [${u.nickname}] Predicted: ${u.predHome}-${u.predAway}. Received points: ${predPoints} (User total: ${userPoints}).`);
      
      if (userPoints === u.expectedPoints && predPoints === u.expectedPoints) {
        console.log(`  ✅ CORRECT! Expected: ${u.expectedPoints}`);
      } else {
        console.error(`  ❌ ERROR! Expected: ${u.expectedPoints}, but got Prediction points: ${predPoints}, User total: ${userPoints}`);
        allOk = false;
      }
    }

    if (allOk) {
      console.log("\n🎉 ALL GRADING AND SCORING TESTS PASSED SUCCESSFULLY!");
    } else {
      console.error("\n❌ GRADING OR SCORING TEST FAILED!");
    }

  } catch (error) {
    console.error("❌ Test run failed with error:", error);
  } finally {
    // Restore match to original state
    await prisma.match.update({
      where: { id: match.id },
      data: {
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore
      }
    });
    console.log("\n✅ Restored original match state");

    // Clean up temporary users and predictions
    await prisma.prediction.deleteMany({
      where: { userId: { in: dbUsers.map(u => u.id) } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: dbUsers.map(u => u.id) } }
    });
    console.log("✅ Cleaned up test database records");
    console.log("=========================================");
  }
}

testGrading();
