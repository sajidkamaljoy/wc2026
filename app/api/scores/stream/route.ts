import { getLiveScoresMapped } from "@/lib/football-api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Module-level shared state for the local Node process (avoids rate limits across concurrent browser tabs)
let latestScores: string = "[]";
const listeners: Set<(data: string) => void> = new Set();

let started = false;
function ensurePoller() {
  if (started) return;
  started = true;
  const poll = async () => {
    try {
      const scores = await getLiveScoresMapped();
      latestScores = JSON.stringify(scores);
      listeners.forEach((fn) => fn(latestScores));
    } catch (error) {
      console.error("Poller error:", error);
    }
  };
  poll();
  setInterval(poll, 30_000);
}

export async function GET() {
  ensurePoller();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ scores: JSON.parse(data), ts: Date.now() })}\n\n`)
          );
        } catch {
          // ignore stream close errors
        }
      };

      // Send current cached state immediately upon connection
      send(latestScores);

      // Register listener for real-time broadcast updates
      listeners.add(send);

      return () => {
        listeners.delete(send);
      };
    },
    cancel() {
      // Stream canceled by client disconnection
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
