import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { predictionSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitResult = rateLimit(ip, 20); // 20 requests per minute
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

    const deviceId = req.cookies.get("deviceId")?.value;
    if (!deviceId) {
      return NextResponse.json({ error: "Missing deviceId cookie" }, { status: 401 });
    }

    const body = await req.json();
    const validation = predictionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
    }

    const { matchId, homeScore, awayScore } = validation.data;

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
    const ip = getClientIp(req);
    const limitResult = rateLimit(ip, 60); // 60 requests per minute
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
