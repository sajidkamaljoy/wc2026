import { PathwayBracket } from "@/components/pathway/PathwayBracket";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ teamId: string }>;
}

// Generate dynamic metadata for search engines and fans
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { teamId } = await params;
    const team = await prisma.team.findUnique({
      where: { id: teamId.toUpperCase() },
      select: { name: true },
    });

    if (!team) {
      return {
        title: "Team Seeding Pathway — FIFA World Cup 2026™",
      };
    }

    return {
      title: `${team.name} Knockout Pathway Seeding — FIFA World Cup 2026™`,
      description: `Track potential knockout stage opponents, matches, venues, and seeding combinations for ${team.name} as they navigate Group and Knockout rounds.`,
    };
  } catch {
    return {
      title: "Team Seeding Pathway — FIFA World Cup 2026™",
    };
  }
}

export default async function TeamPage({ params }: Props) {
  const { teamId } = await params;
  const upperTeamId = teamId.toUpperCase();

  // Validate team exists, else redirect to standings page
  const teamExists = await prisma.team.findUnique({
    where: { id: upperTeamId },
    select: { id: true },
  });

  if (!teamExists) {
    redirect("/groups");
  }

  return (
    <div className="w-full">
      <PathwayBracket teamId={upperTeamId} />
    </div>
  );
}
