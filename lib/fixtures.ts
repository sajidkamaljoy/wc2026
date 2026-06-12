import { prisma } from "./db";
import { unstable_cache } from "next/cache";

/**
 * Shared cached query to fetch all fixtures from the database.
 * Revalidates every 30 seconds.
 */
export const getCachedFixtures = unstable_cache(
  async () => {
    return prisma.match.findMany({
      include: {
        homeTeam: { select: { id: true, name: true, flagUrl: true } },
        awayTeam: { select: { id: true, name: true, flagUrl: true } },
        venue: { select: { name: true, city: true, country: true } },
      },
      orderBy: { kickoffUtc: "asc" },
    });
  },
  ["fixtures-all"],
  { revalidate: 30, tags: ["fixtures"] }
);
