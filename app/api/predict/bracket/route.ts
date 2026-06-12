import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { bracketPredictionSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

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
    const ip = getClientIp(req);
    const limitResult = rateLimit(ip, 10); // 10 requests per minute
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
    const validation = bracketPredictionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid prediction data", details: validation.error.format() }, { status: 400 });
    }

    const { groupRankings, thirdPlaces, knockoutPicks } = validation.data;

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
