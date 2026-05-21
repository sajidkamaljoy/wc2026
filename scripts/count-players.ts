import { prisma } from "../lib/db";

async function main() {
  try {
    const totalPlayers = await prisma.player.count();
    const placeholders = await prisma.player.count({ where: { isPlaceholder: true } });
    const actualPlayers = await prisma.player.count({ where: { isPlaceholder: false } });
    
    const preliminary = await prisma.player.count({ where: { squadStatus: "PRELIMINARY" } });
    const confirmed = await prisma.player.count({ where: { squadStatus: "CONFIRMED" } });
    const tbd = await prisma.player.count({ where: { squadStatus: "TBD" } });

    console.log("-------------------------------------------");
    console.log("Player & Squad Seeding Statistics");
    console.log("-------------------------------------------");
    console.log(`Total Player records: ${totalPlayers}`);
    console.log(`Actual Players:       ${actualPlayers}`);
    console.log(`Placeholder Slots:    ${placeholders}`);
    console.log("");
    console.log("Squad Status breakdown:");
    console.log(`- PRELIMINARY:        ${preliminary}`);
    console.log(`- CONFIRMED:          ${confirmed}`);
    console.log(`- TBD:                ${tbd}`);
    console.log("-------------------------------------------");
  } catch (error) {
    console.error("Error querying database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
