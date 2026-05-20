"use client";

import { useContext } from "react";
import { LiveScoreContext, type LiveScoreContextValue } from "./LiveScoreProvider";

/**
 * Hook that reads live scores from the shared LiveScoreProvider context.
 * No longer creates its own EventSource — all components share one connection.
 */
export function useLiveScores(): LiveScoreContextValue {
  return useContext(LiveScoreContext);
}
