import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.cookies.get("deviceId")?.value;
    if (!deviceId) {
      return NextResponse.json({ prediction: null, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { deviceId },
      include: { bracketPrediction: true }
    });

    if (!user) {
      return NextResponse.json({ prediction: null, user: null });
    }

    return NextResponse.json({
      prediction: user.bracketPrediction,
      user: { id: user.id, nickname: user.nickname, points: user.points }
    });
  } catch (error) {
    console.error("Error fetching bracket prediction:", error);
    // Return graceful empty state to support offline/local-only mode if DB is down
    return NextResponse.json({ prediction: null, user: null, error: "Database unreachable" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const deviceId = req.cookies.get("deviceId")?.value;
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId cookie" }, { status: 401 });
    }

    const { groupRankings, thirdPlaces, knockoutPicks } = await req.json();

    if (!groupRankings || !thirdPlaces || !knockoutPicks) {
      return NextResponse.json({ error: "Invalid prediction data" }, { status: 400 });
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { deviceId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          deviceId,
          nickname: `Fan_${Math.floor(Math.random() * 10000)}`
        }
      });
    }

    // Upsert the bracket prediction
    const prediction = await prisma.bracketPrediction.upsert({
      where: { userId: user.id },
      update: {
        groupPicks: groupRankings,
        thirdPlaces,
        knockoutPicks,
      },
      create: {
        userId: user.id,
        groupPicks: groupRankings,
        thirdPlaces,
        knockoutPicks,
      }
    });

    return NextResponse.json({ success: true, prediction });
  } catch (error) {
    console.error("Error saving bracket prediction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
