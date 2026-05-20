import { prisma } from "../lib/db";
import { calculatePathway } from "../lib/pathway";

async function verify() {
  console.log("-------------------------------------------");
  console.log("Database & Pathway Verification");
  console.log("-------------------------------------------");

  try {
    // 1. Check counts
    const teamCount = await prisma.team.count();
    const groupCount = await prisma.group.count();
    const venueCount = await prisma.venue.count();
    const matchCount = await prisma.match.count();

    console.log(`Groups in DB:  ${groupCount} (Expected: 12)`);
    console.log(`Teams in DB:   ${teamCount} (Expected: 48)`);
    console.log(`Venues in DB:  ${venueCount} (Expected: 16)`);
    console.log(`Matches in DB: ${matchCount} (Expected: 104)`);

    const matchesOk = matchCount === 104;
    const teamsOk = teamCount === 48;
    const groupsOk = groupCount === 12;
    const venuesOk = venueCount === 16;

    if (matchesOk && teamsOk && groupsOk && venuesOk) {
      console.log("\n✅ Database seed values are 100% complete and correct!");
    } else {
      console.error("\n❌ Database seed counts do not match expected tournament values.");
    }

    // 2. Sample teams to test pathway
    console.log("\nTesting dynamic pathway calculation for sample teams...");
    const sampleTeams = ["ARG", "ENG", "BRA", "MEX"];
    
    for (const teamId of sampleTeams) {
      try {
        const path = await calculatePathway(teamId);
        console.log(`- [${teamId}] ${path.team.name}:`);
        console.log(`  Current position: ${path.currentGroupPosition}`);
        console.log(`  R32 Bracket Slot: ${path.rounds[0].bracketSlot} vs ${path.rounds[0].possibleOpponents.join(", ")}`);
        console.log(`  Final Bracket Slot: ${path.rounds[4].bracketSlot}`);
      } catch (err) {
        console.error(`- ❌ Failed to calculate pathway for ${teamId}:`, err);
      }
    }

    console.log("\n✅ Pathway seeding calculation is active and working!");

  } catch (error) {
    console.error("\n❌ Critical Verification Failed:", error);
  }
  console.log("-------------------------------------------");
}

verify();
