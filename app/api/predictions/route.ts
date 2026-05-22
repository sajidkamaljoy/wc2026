import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const deviceId = req.cookies.get("deviceId")?.value;
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId cookie" }, { status: 401 });
    }

    const { matchId, homeScore, awayScore } = await req.json();

    if (!matchId || typeof homeScore !== "number" || typeof awayScore !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
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

    // Check match status
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    
    if (match.status !== "SCHEDULED") {
      return NextResponse.json({ error: "Match has already started" }, { status: 403 });
    }

    // Upsert prediction
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId: match.id,
        }
      },
      update: {
        homeScore,
        awayScore,
      },
      create: {
        userId: user.id,
        matchId: match.id,
        homeScore,
        awayScore,
      }
    });

    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Error saving prediction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.cookies.get("deviceId")?.value;
    if (!deviceId) {
      return NextResponse.json({ predictions: [], user: null });
    }

    const user = await prisma.user.findUnique({ where: { deviceId } });
    if (!user) {
      return NextResponse.json({ predictions: [], user: null });
    }

    const predictions = await prisma.prediction.findMany({
      where: { userId: user.id },
      include: {
        match: {
          include: {
            homeTeam: true,
            awayTeam: true
          }
        }
      }
    });

    return NextResponse.json({ predictions, user });
  } catch (error) {
    console.error("Error fetching predictions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
