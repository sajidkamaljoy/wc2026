import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const topUsers = await prisma.user.findMany({
      orderBy: { points: "desc" },
      take: 50,
      select: {
        id: true,
        nickname: true,
        points: true
      }
    });

    return NextResponse.json({ leaderboard: topUsers });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
