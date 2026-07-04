import { prisma } from "../lib/db";
import { Stage } from "@prisma/client";

async function main() {
  const r16 = await prisma.match.findMany({
    where: { stage: Stage.ROUND_OF_16 },
    orderBy: { matchNumber: "asc" },
    include: { homeTeam: true, awayTeam: true, venue: true },
  });

  console.log("=== Round of 16 (Current State) ===");
  r16.forEach((m) => {
    const home = m.homeTeam?.name ?? m.homePlaceholder ?? "TBD";
    const away = m.awayTeam?.name ?? m.awayPlaceholder ?? "TBD";
    const homeFlag = m.homeTeam ? `[${m.homeTeamId}]` : "⚠️ no team";
    const awayFlag = m.awayTeam ? `[${m.awayTeamId}]` : "⚠️ no team";
    const kick = new Date(m.kickoffUtc).toISOString().replace("T", " ").substring(0, 16);
    console.log(`#${m.matchNumber} ${kick} UTC | ${home} ${homeFlag} vs ${away} ${awayFlag} | ${m.venue.city}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
