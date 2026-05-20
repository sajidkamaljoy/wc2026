"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function TimezoneBanner() {
  const [tzName, setTzName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTzName(tz);
    } catch {
      setTzName("UTC");
    }
  }, []);

  if (!tzName) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 text-xs text-amber-300/80 max-w-fit mb-6 transition-all">
      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      <span>
        Kickoff times adjusted automatically to your local timezone:{" "}
        <strong className="text-amber-300 font-bold uppercase tracking-wider">{tzName}</strong>
      </span>
    </div>
  );
}
