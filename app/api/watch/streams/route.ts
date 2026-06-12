import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLiveStreamsForMatch, getStreamsForStreamedMatchId } from "@/lib/streamed-api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limitResult = rateLimit(ip, 30); // 30 requests per minute
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((limitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { error: "Missing matchId parameter" },
        { status: 400 }
      );
    }

    const dbMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: { select: { id: true, name: true, shortName: true } },
        awayTeam: { select: { id: true, name: true, shortName: true } },
      },
    });

    if (!dbMatch) {
      // If the match does not exist in the database, it must be a raw streamed.pk sports event ID!
      console.log(`ℹ️ Match ID "${matchId}" not found in DB. Attempting raw streamed.pk lookup.`);
      const streams = await getStreamsForStreamedMatchId(matchId);
      return NextResponse.json({ streams });
    }

    const homeInfo = dbMatch.homeTeam
      ? { id: dbMatch.homeTeam.id, name: dbMatch.homeTeam.name, shortName: dbMatch.homeTeam.shortName }
      : { id: "", name: dbMatch.homePlaceholder || "" };
    const awayInfo = dbMatch.awayTeam
      ? { id: dbMatch.awayTeam.id, name: dbMatch.awayTeam.name, shortName: dbMatch.awayTeam.shortName }
      : { id: "", name: dbMatch.awayPlaceholder || "" };

    if (!homeInfo || !awayInfo || (!homeInfo.name && !homeInfo.id) || (!awayInfo.name && !awayInfo.id)) {
      return NextResponse.json({ streams: [] });
    }

    const streams = await getLiveStreamsForMatch(homeInfo, awayInfo);
    return NextResponse.json({ streams });
  } catch (error) {
    console.error("Error in streams API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
