"use client";

import { useEffect, useState } from "react";
import { Target, Trophy } from "lucide-react";

interface LeaderboardItem {
  id: string;
  score: number;
  nickname: string;
  userId: string;
}

export function BracketLeaderboard() {
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/predict/bracket/leaderboard");
        const data = await res.json();
        if (data.leaderboard) {
          setItems(data.leaderboard);
        }
      } catch (e) {
        console.error("Failed to load bracket leaderboard:", e);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
        <div className="h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Loading Leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      <div className="bg-slate-950/50 p-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400 animate-pulse" />
          Global Bracket Leaderboard
        </h2>
      </div>

      <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic flex flex-col gap-2">
            <span>No bracket challenge scores logged yet.</span>
            <span className="text-xs text-slate-600">Leaderboard scores calculate after matches finish!</span>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 transition-colors hover:bg-slate-800/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-400 border border-white/5">
                  {idx + 1}
                </div>
                <div className="font-semibold text-slate-200">{item.nickname}</div>
              </div>
              <div className="font-mono font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                {item.score} pts
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
