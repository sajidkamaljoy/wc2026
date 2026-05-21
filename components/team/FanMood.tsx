"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { format } from "date-fns";

interface Headline {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: number;
}

interface SentimentData {
  score: number;
  label: string;
  emoji: string;
  colorClass: string;
  barColorClass: string;
  articlesAnalyzed: number;
  headlines: Headline[];
}

interface Props {
  teamId: string;
}

export function FanMood({ teamId }: Props) {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    fetch(`/api/teams/${teamId}/sentiment`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [teamId, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-white/5 bg-slate-900/40 w-full mb-8 animate-pulse">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
          <span>Analyzing latest fan mood and news sentiment...</span>
        </div>
      </div>
    );
  }

  if (!data || data.articlesAnalyzed === 0) {
    return (
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-white/5 bg-slate-900/40 w-full mb-8">
        <div className="flex items-center gap-2 text-slate-300 font-bold mb-1">
          <TrendingUp className="h-5 w-5 text-slate-400" />
          <h2>Fan Mood Analyzer</h2>
        </div>
        <div className="text-slate-400 text-sm italic">
          No recent news found to analyze sentiment for this team.
        </div>
      </div>
    );
  }

  // Map sentiment score (-5 to +5) to gauge percentage (0% to 100%)
  const percentage = Math.min(Math.max(((data.score + 5) / 10) * 100, 0), 100);

  return (
    <div className="flex flex-col gap-5 p-5 rounded-2xl border border-white/5 bg-slate-900/40 w-full mb-8 transition-all duration-300 hover:border-white/10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          <h2>Fan Mood Sentiment</h2>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
          <span className="bg-white/5 px-2 py-0.5 rounded-full">
            {data.articlesAnalyzed} articles analyzed
          </span>
        </div>
      </div>

      {/* Main Gauge Row */}
      <div className="flex flex-col md:flex-row items-center gap-6 py-2">
        {/* Emoji & Label */}
        <div className="flex flex-col items-center justify-center min-w-[120px] text-center gap-1">
          <span className="text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-110 select-none">
            {data.emoji}
          </span>
          <span className={`text-base font-black uppercase tracking-wider ${data.colorClass.split(" ")[0]}`}>
            {data.label}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Avg Score: {data.score > 0 ? `+${data.score}` : data.score}
          </span>
        </div>

        {/* Visual Gauge Track */}
        <div className="flex-1 w-full flex flex-col gap-2">
          <div className="flex justify-between text-[10px] text-slate-500 px-1 font-mono">
            <span>Critical (-5)</span>
            <span>Neutral (0)</span>
            <span>Hype (+5)</span>
          </div>

          {/* Bar track */}
          <div className="relative h-3 w-full bg-slate-950/60 rounded-full border border-white/5 overflow-visible">
            {/* Center tick */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-800 z-0"></div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 via-slate-500/10 to-emerald-500/20 z-0"></div>
            
            {/* Indicator Dot */}
            <div 
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-slate-900 shadow-lg cursor-default transition-all duration-1000 ease-out z-10 ${data.barColorClass}`}
              style={{ left: `${percentage}%` }}
            >
              <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-current"></div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-1">
            Real-time public mood gauge based on natural language sentiment analysis of the latest international sports articles.
          </p>
        </div>
      </div>

      {/* Expandable Headlines */}
      <div className="border-t border-white/5 pt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors focus:outline-none"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 text-amber-500" />
              <span>Hide Sentiment Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 text-amber-500" />
              <span>Show Analyzed Headlines</span>
            </>
          )}
        </button>

        {expanded && (
          <div className="mt-3 flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
            {data.headlines.map((headline, idx) => (
              <a
                key={idx}
                href={headline.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-4 p-2.5 rounded-lg bg-slate-950/20 border border-white/0 hover:border-white/5 hover:bg-slate-950/40 transition-all text-xs"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-slate-200 font-medium leading-relaxed hover:underline">
                    {headline.title}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>{headline.source}</span>
                    <span>•</span>
                    <span>
                      {headline.publishedAt ? format(new Date(headline.publishedAt), "MMM d, h:mm a") : "Recent"}
                    </span>
                  </div>
                </div>

                {/* Score badge */}
                <div 
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                    headline.sentiment > 0
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : headline.sentiment < 0
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-slate-800/50 text-slate-400 border border-slate-700/30"
                  }`}
                >
                  {headline.sentiment > 0 ? `+${headline.sentiment}` : headline.sentiment}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
