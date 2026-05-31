import { SharedBracketView } from "@/components/bracket/SharedBracketView";
import { decodePredictionState } from "@/lib/bracket-prediction";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface SearchParams {
  p?: string;
  user?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { p } = await searchParams;
  const ogUrl = p 
    ? `/api/predict/bracket/og?p=${encodeURIComponent(p)}` 
    : `/api/predict/bracket/og`;

  return {
    title: "Shared Prediction | Bracket Predictor",
    description: "View this custom 2026 World Cup bracket prediction.",
    openGraph: {
      title: "Shared Prediction | Bracket Predictor",
      description: "View this custom 2026 World Cup bracket prediction.",
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: "Bracket Predictor Prediction",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Shared Prediction | Bracket Predictor",
      description: "View this custom 2026 World Cup bracket prediction.",
      images: [ogUrl],
    },
  };
}

export default async function SharePage({ searchParams }: Props) {
  const { p, user: userId } = await searchParams;

  let decodedPrediction: {
    groupRankings: Record<string, string[]>;
    thirdPlaces: string[];
    knockoutPicks: Record<number, string>;
  } | null = null;

  // 1. If prediction code 'p' is provided in URL, decode it instantly (works offline/independent of DB!)
  if (p) {
    decodedPrediction = decodePredictionState(p);
  }

  // 2. If 'user' ID is provided in URL, fetch from DB
  if (!decodedPrediction && userId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { bracketPrediction: true },
      });
      if (dbUser?.bracketPrediction) {
        const bp = dbUser.bracketPrediction;
        decodedPrediction = {
          groupRankings: bp.groupPicks as Record<string, string[]>,
          thirdPlaces: bp.thirdPlaces as string[],
          knockoutPicks: bp.knockoutPicks as Record<number, string>,
        };
      }
    } catch {
      console.error("⚠️ [Prisma] Could not fetch shared prediction from database");
    }
  }

  // If no prediction could be loaded, redirect to main bracket
  if (!decodedPrediction) {
    redirect("/bracket");
  }

  // Fetch groups list to populate team details (using a fallback on DB failure)
  let groups = [];
  try {
    const dbGroups = await prisma.group.findMany({
      include: {
        teams: {
          orderBy: [{ points: "desc" }, { goalsFor: "desc" }],
        },
      },
      orderBy: { id: "asc" },
    });
    
    groups = dbGroups.map((g) => ({
      id: g.id,
      name: g.name,
      teams: g.teams.map((t) => ({
        id: t.id,
        name: t.name,
        flagUrl: t.flagUrl,
      })),
    }));
  } catch {
    console.error("⚠️ [Prisma] Could not fetch groups for share page, loading local fallback.");
    // Inline groups fallback to ensure the page works completely offline
    const { getFallbackGroups } = await import("../../../lib/fallback-data");
    groups = getFallbackGroups().map((g) => ({
      id: g.id,
      name: g.name,
      teams: g.teams.map((t) => ({
        id: t.id,
        name: t.name,
        flagUrl: t.flagUrl,
      })),
    }));
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-24 px-4 sm:px-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Tournament Predictions
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl">
          Fan companion bracket predictor predictions.
        </p>
      </div>

      <SharedBracketView prediction={decodedPrediction} groups={groups} />
    </div>
  );
}
