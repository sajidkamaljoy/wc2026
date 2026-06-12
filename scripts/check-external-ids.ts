import { prisma } from '../lib/db';

async function main() {
  const matches = await prisma.match.findMany({
    where: { matchNumber: { lte: 5 } },
    select: {
      id: true,
      matchNumber: true,
      externalId: true,
      status: true,
      homeScore: true,
      awayScore: true,
    },
    orderBy: { matchNumber: 'asc' },
  });

  console.log(JSON.stringify(matches, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
