import { FullBracketTree } from "@/components/bracket/FullBracketTree";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knockout Bracket — FIFA World Cup 2026™",
  description: "View the full knockout stage bracket for the FIFA World Cup 2026™.",
};

export default async function BracketPage() {
  const matches = await prisma.match.findMany({
    where: {
      stage: {
        in: ["ROUND_OF_32", "ROUND_OF_16", "QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"],
      },
    },
    include: {
      homeTeam: { select: { id: true, name: true, flagUrl: true } },
      awayTeam: { select: { id: true, name: true, flagUrl: true } },
    },
    orderBy: {
      matchNumber: "asc",
    },
  });

  return (
    <div className="w-full flex flex-col gap-8 pb-24 px-4 sm:px-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
          Knockout Bracket
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl">
          The path to glory. Follow the journey from the Round of 32 all the way to the Final at MetLife Stadium.
        </p>
      </div>

      <FullBracketTree matches={matches} />
    </div>
  );
}
