import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const leaderboard = await prisma.bracketPrediction.findMany({
      orderBy: { score: "desc" },
      take: 50,
      select: {
        id: true,
        score: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            nickname: true,
          }
        }
      }
    });

    const formattedLeaderboard = leaderboard.map((bp) => ({
      id: bp.id,
      score: bp.score,
      updatedAt: bp.updatedAt,
      userId: bp.user.id,
      nickname: bp.user.nickname || "Anonymous Fan",
    }));

    return NextResponse.json({ leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error("Error fetching bracket leaderboard:", error);
    return NextResponse.json({ leaderboard: [], error: "Database unreachable" });
  }
}
