"use client";

import { useState, useEffect } from "react";

interface Props {
  utcIso: string | Date;
}

export function Countdown({ utcIso }: Props) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isClose, setIsClose] = useState(false);

  useEffect(() => {
    const kickoffTime = new Date(utcIso).getTime();

    const update = () => {
      const now = new Date().getTime();
      const diff = kickoffTime - now;

      if (diff <= 0) {
        setTimeLeft("Started");
        setIsClose(false);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Highlight in amber if less than 24 hours to kickoff
      setIsClose(diff < 24 * 60 * 60 * 1000);

      const parts: string[] = [];
      if (days > 0) {
        parts.push(`${days}d`);
      }
      if (hours > 0 || days > 0) {
        parts.push(`${hours}h`);
      }
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(" "));
    };

    update();
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [utcIso]);

  if (!timeLeft || timeLeft === "Started") return null;

  return (
    <div className={`text-[9px] font-mono mt-1 font-bold tracking-wider uppercase transition-colors duration-300 ${
      isClose ? "text-amber-400 animate-pulse" : "text-slate-500"
    }`}>
      {timeLeft}
    </div>
  );
}
