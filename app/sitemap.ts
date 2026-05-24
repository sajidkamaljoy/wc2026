import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fifawc2026.me";

  // Static routes
  const routes = ["", "/fixtures", "/groups", "/bracket", "/pickem"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic routes for teams
  try {
    const teams = await prisma.team.findMany({
      select: { id: true },
    });

    const teamRoutes = teams.map((team) => ({
      url: `${baseUrl}/teams/${team.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...routes, ...teamRoutes];
  } catch (error) {
    console.error("Error fetching teams for sitemap:", error);
    return routes;
  }
}
