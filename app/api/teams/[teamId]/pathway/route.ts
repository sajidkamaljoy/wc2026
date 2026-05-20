import { NextRequest, NextResponse } from "next/server";
import { calculatePathway } from "@/lib/pathway";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  try {
    const pathway = await calculatePathway(teamId);
    return NextResponse.json({ pathway });
  } catch (error) {
    console.error(`Error calculating pathway for team ${teamId}:`, error);
    return NextResponse.json({ error: "Team or pathway not found" }, { status: 404 });
  }
}
