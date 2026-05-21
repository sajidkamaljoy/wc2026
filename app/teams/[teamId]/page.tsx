import { PathwayBracket } from "@/components/pathway/PathwayBracket";
import { SquadView } from "@/components/squad/SquadView";
import { TeamForm } from "@/components/team/TeamForm";
import { FanMood } from "@/components/team/FanMood";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";


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
      title: `${team.name} Squad & Knockout Pathway — FIFA World Cup 2026™`,
      description: `View official squad roster lists, positions, and track potential knockout stage opponents for ${team.name} in the FIFA World Cup 2026.`,
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 pb-24 px-4 sm:px-0">
      <PathwayBracket teamId={upperTeamId} />
      
      <TeamForm teamId={upperTeamId} />
      
      <FanMood teamId={upperTeamId} />
      
      {/* Squad Section Header */}
      <div className="flex flex-col gap-2 border-t border-slate-900/60 pt-12">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <span className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/20 shrink-0">
            <Users className="h-5 w-5" />
          </span>
          Roster & Squad List
        </h2>
        <p className="text-xs md:text-sm text-slate-400 font-medium max-w-xl">
          Detailed player profiles and position-by-position listings for the tournament roster.
        </p>
      </div>
      
      <SquadView teamId={upperTeamId} />
    </div>
  );
}
