import { NextResponse } from "next/server";
import { getLiveScoresMapped } from "@/lib/football-api";
import { unstable_cache } from "next/cache";

const getCachedScores = unstable_cache(
  async () => getLiveScoresMapped(),
  ["live-scores"],
  { revalidate: 30 }
);

export async function GET() {
  try {
    const scores = await getCachedScores();
    return NextResponse.json({ scores, fetchedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Error fetching live scores:", error);
    return NextResponse.json({ scores: [], fetchedAt: new Date().toISOString(), error: "Error fetching live scores" });
  }
}
