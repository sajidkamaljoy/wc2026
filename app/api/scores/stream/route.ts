import { NextRequest, NextResponse } from "next/server";
import { getLiveScoresMapped } from "@/lib/football-api";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Module-level shared broadcaster for the local Node process.
// Using setInterval (stored by reference) instead of a boolean flag,
// so the poller can be safely cleared and restarted on hot-reload.
let latestScores: string = "[]";
const listeners: Set<(data: string) => void> = new Set();

let pollInterval: ReturnType<typeof setInterval> | null = null;

function ensurePoller() {
  // Already running — skip
  if (pollInterval) return;

  const poll = async () => {
    try {
      const scores = await getLiveScoresMapped();
      const serialised = JSON.stringify(scores);
      // Only broadcast if scores actually changed (avoids unnecessary SSE frames)
      if (serialised !== latestScores) {
        latestScores = serialised;
        listeners.forEach((fn) => fn(latestScores));
      }
    } catch (error) {
      console.error("Poller error:", error);
      // Do NOT stop the interval on transient errors — it will retry next tick
    }
  };

  // Immediate first poll, then every 30 s
  poll();
  pollInterval = setInterval(poll, 30_000);
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limitResult = rateLimit(ip, 5); // 5 connections per minute per IP
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

    ensurePoller();
    const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ scores: JSON.parse(data), ts: Date.now() })}\n\n`
            )
          );
        } catch {
          // Ignore — client already disconnected
        }
      };

      // Immediately send current cached state to the new subscriber
      send(latestScores);

      // Register this client as a live listener
      listeners.add(send);

      // Cleanup when the client disconnects
      return () => {
        listeners.delete(send);
        if (listeners.size === 0 && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      };
    },
    cancel() {
      // Stream cancelled by client — nothing extra needed, cleanup runs above
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      // Heartbeat hint so proxies don't close the connection after 60s
      "X-Accel-Buffering": "no",
    },
  });
  } catch (error) {
    console.error("Error in SSE stream GET handler:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
