"use client";

import { useEffect, useState } from "react";
import { Loader2, Activity } from "lucide-react";
import { format } from "date-fns";

interface FormMatch {
  id: string;
  outcome: "W" | "D" | "L";
  opponent: string;
  score: string;
  date: string;
}

interface Props {
  teamId: string;
}

export function TeamForm({ teamId }: Props) {
  const [form, setForm] = useState<FormMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/form`)
      .then((res) => res.json())
      .then((data) => {
        setForm(data.form || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading recent form...
      </div>
    );
  }

  if (form.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-white/5 bg-slate-900/40 w-full mb-8">
      <div className="flex items-center gap-2 text-slate-300 font-bold mb-2">
        <Activity className="h-5 w-5 text-amber-400" />
        <h2>Recent Form</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 overflow-x-auto pb-2">
        {form.map((match) => (
          <div key={match.id} className="flex flex-col items-center min-w-[90px] shrink-0 gap-2">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black border-2 ${
                match.outcome === "W"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                  : match.outcome === "D"
                  ? "bg-slate-500/10 border-slate-500/50 text-slate-400"
                  : "bg-red-500/10 border-red-500/50 text-red-400"
              }`}
            >
              {match.outcome}
            </div>
            
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-slate-300">vs {match.opponent}</span>
              <span className="text-[10px] text-slate-500 font-mono">{match.score}</span>
              <span className="text-[9px] text-slate-600 mt-1">{format(new Date(match.date), "MMM d, yyyy")}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
