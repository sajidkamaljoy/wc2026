import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLiveStreamsForMatch } from "@/lib/streamed-api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { error: "Missing matchId parameter" },
        { status: 400 }
      );
    }

    let homeInfo = null;
    let awayInfo = null;

    if (matchId === "mex-vs-zaf-1") {
      homeInfo = { id: "MEX", name: "Mexico", shortName: "Mexico" };
      awayInfo = { id: "ZAF", name: "South Africa", shortName: "South Africa" };
    } else {
      const dbMatch = await prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeTeam: { select: { id: true, name: true, shortName: true } },
          awayTeam: { select: { id: true, name: true, shortName: true } },
        },
      });

      if (!dbMatch) {
        return NextResponse.json(
          { error: "Match not found" },
          { status: 404 }
        );
      }

      homeInfo = dbMatch.homeTeam
        ? { id: dbMatch.homeTeam.id, name: dbMatch.homeTeam.name, shortName: dbMatch.homeTeam.shortName }
        : { id: "", name: dbMatch.homePlaceholder || "" };
      awayInfo = dbMatch.awayTeam
        ? { id: dbMatch.awayTeam.id, name: dbMatch.awayTeam.name, shortName: dbMatch.awayTeam.shortName }
        : { id: "", name: dbMatch.awayPlaceholder || "" };
    }

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
