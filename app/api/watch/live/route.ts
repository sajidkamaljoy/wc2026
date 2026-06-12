import { NextResponse } from "next/server";
import { getLiveMatchesFromStreamed } from "@/lib/streamed-api";

export async function GET() {
  try {
    const { matchedIds, rawLive } = await getLiveMatchesFromStreamed();
    return NextResponse.json({ liveMatchIds: matchedIds, streamedLiveMatches: rawLive });
  } catch (error) {
    console.error("Error in live matches API route:", error);
    return NextResponse.json(
      { error: "Internal server error", liveMatchIds: [], streamedLiveMatches: [] },
      { status: 500 }
    );
  }
}
