import { NextResponse } from "next/server";
import { getLiveMatchesFromStreamed } from "@/lib/streamed-api";

export async function GET() {
  try {
    const liveMatchIds = await getLiveMatchesFromStreamed();
    return NextResponse.json({ liveMatchIds });
  } catch (error) {
    console.error("Error in live matches API route:", error);
    return NextResponse.json(
      { error: "Internal server error", liveMatchIds: [] },
      { status: 500 }
    );
  }
}
