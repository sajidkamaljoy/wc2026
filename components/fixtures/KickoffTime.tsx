"use client";

import { useState, useEffect } from "react";
import { formatKickoff } from "@/lib/timezone";

interface Props {
  utcIso: string;
  showAbbr?: boolean;
}

export function KickoffTime({ utcIso, showAbbr = false }: Props) {
  const [data, setData] = useState<{ time: string; tzAbbr: string } | null>(null);

  useEffect(() => {
    try {
      const formatted = formatKickoff(utcIso);
      setData({ time: formatted.time, tzAbbr: formatted.tzAbbr });
    } catch {
      // fallback
      setData({ time: utcIso.slice(11, 16), tzAbbr: "UTC" });
    }
  }, [utcIso]);

  // Render a clean UTC placeholder during SSR to prevent hydration mismatches
  if (!data) {
    return (
      <span className="font-mono text-slate-400">
        {utcIso.slice(11, 16)} <span className="text-[10px] text-slate-500 font-sans">UTC</span>
      </span>
    );
  }

  return (
    <span className="font-mono text-slate-100 flex items-center gap-1">
      <span>{data.time}</span>
      {showAbbr && data.tzAbbr && (
        <span className="text-[10px] text-slate-500 font-sans tracking-wide uppercase font-semibold">
          {data.tzAbbr}
        </span>
      )}
    </span>
  );
}
