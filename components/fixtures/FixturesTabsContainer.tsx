"use client";

import { useState } from "react";
import { FixtureList } from "./FixtureList";
import { HeadToHead } from "./HeadToHead";
import { Calendar, ArrowLeftRight } from "lucide-react";
import type { MatchWithTeams } from "@/types";

export function FixturesTabsContainer({ initialMatches = [] }: { initialMatches?: MatchWithTeams[] }) {
  const [activeTab, setActiveTab] = useState<"schedule" | "h2h">("schedule");

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tab Navigators */}
      <div className="flex border-b border-white/10 pb-px">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 cursor-pointer ${
            activeTab === "schedule"
              ? "border-amber-400 text-white font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className={`h-4 w-4 ${activeTab === "schedule" ? "text-amber-400" : "text-slate-500"}`} />
          <span>Match Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab("h2h")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all duration-300 cursor-pointer ${
            activeTab === "h2h"
              ? "border-amber-400 text-white font-bold"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ArrowLeftRight className={`h-4 w-4 ${activeTab === "h2h" ? "text-amber-400" : "text-slate-500"}`} />
          <span>Head-To-Head</span>
        </button>
      </div>

      {/* Render Active Component with animations */}
      <div className="animate-fade-in duration-300">
        {activeTab === "schedule" ? (
          <FixtureList initialMatches={initialMatches} />
        ) : (
          <HeadToHead />
        )}
      </div>
    </div>
  );
}
