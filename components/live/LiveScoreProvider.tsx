"use client";

import { createContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import type { LiveScore } from "@/types";

interface ScoreMap {
  [matchId: string]: LiveScore;
}

export interface LiveScoreContextValue {
  scores: LiveScore[];
  getScore: (matchId: string) => LiveScore | null;
}

export const LiveScoreContext = createContext<LiveScoreContextValue>({
  scores: [],
  getScore: () => null,
});

/**
 * Single provider that opens ONE SSE connection (or polling fallback)
 * for the entire application. Wrap this around {children} in the root layout.
 */
export function LiveScoreProvider({ children }: { children: ReactNode }) {
  const [scoreMap, setScoreMap] = useState<ScoreMap>({});
  const esRef = useRef<EventSource | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const applyScores = useCallback((scores: LiveScore[]) => {
    if (!scores || !Array.isArray(scores)) return;
    setScoreMap((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const s of scores) {
        if (!s || !s.matchId) continue;
        const current = next[s.matchId];
        if (
          !current ||
          current.homeScore !== s.homeScore ||
          current.awayScore !== s.awayScore ||
          current.status !== s.status ||
          current.minute !== s.minute
        ) {
          next[s.matchId] = s;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    const poll = async () => {
      try {
        const res = await fetch("/api/scores");
        if (res.ok) {
          const data = await res.json();
          if (data && data.scores) {
            applyScores(data.scores);
          }
        }
      } catch (error: any) {
        console.warn("⚠️ Failed to poll live scores (network reconnecting/reloading):", error.message || error);
      }
    };
    poll();
    pollRef.current = setInterval(poll, 30_000);
  }, [applyScores]);

  useEffect(() => {
    // Attempt SSE first
    if (typeof window !== "undefined" && typeof window.EventSource !== "undefined") {
      const es = new EventSource("/api/scores/stream");
      esRef.current = es;

      es.onmessage = (e) => {
        try {
          const { scores } = JSON.parse(e.data);
          applyScores(scores);
        } catch (err) {
          console.error("Error parsing SSE data:", err);
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        startPolling();
      };
    } else {
      startPolling();
    }

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [applyScores, startPolling]);

  const getScore = useCallback(
    (matchId: string) => scoreMap[matchId] ?? null,
    [scoreMap]
  );

  const scores = Object.values(scoreMap);

  return (
    <LiveScoreContext.Provider value={{ scores, getScore }}>
      {children}
    </LiveScoreContext.Provider>
  );
}
