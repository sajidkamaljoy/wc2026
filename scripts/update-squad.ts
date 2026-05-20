import { prisma } from "../lib/db";
import { Position, SquadStatus } from "@prisma/client";
import { SQUADS } from "../prisma/squadsData";

async function main() {
  const teamIdArg = process.argv[2];

  if (!teamIdArg) {
    console.error("❌ Error: Please specify a team ID (e.g., BRA, FRA, JPN, KOR, POR).");
    console.log("Usage: npx tsx scripts/update-squad.ts <TEAM_ID>");
    console.log("\nDefined squads in squadsData.ts:");
    Object.keys(SQUADS).forEach((id) => {
      console.log(`- ${id} (${SQUADS[id].status})`);
    });
    process.exit(1);
  }

  const teamId = teamIdArg.toUpperCase();

  // 1. Verify team exists in the database
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    console.error(`❌ Error: Team with ID '${teamId}' not found in the database.`);
    process.exit(1);
  }

  console.log(`⚡ Updating squad for team: ${team.name} (${teamId})...`);

  const squad = SQUADS[teamId];
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
    console.log(`ℹ️ Sourcing official squad data from squadsData.ts (${squad.status})`);
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
    console.log(`⚠️ No official squad found in squadsData.ts. Seeding 26 placeholder players.`);
    // 26 placeholders
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

  // 2. Perform safe upsert for each player slot
  let upsertCount = 0;
  for (const p of playersToSeed) {
    await prisma.player.upsert({
      where: {
        teamId_sortIndex: {
          teamId,
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
        teamId,
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
    upsertCount++;
  }

  // 3. If there were other players previously seeded with higher sortIndex, delete them
  // (e.g. if a preliminary list had 27 players and the final confirmed squad only has 26)
  const deleted = await prisma.player.deleteMany({
    where: {
      teamId,
      sortIndex: {
        gte: playersToSeed.length,
      },
    },
  });

  if (deleted.count > 0) {
    console.log(`🧹 Cleaned up ${deleted.count} obsolete player slots.`);
  }

  console.log(`✅ Successfully seeded/updated ${upsertCount} player slots for ${team.name}.`);
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
