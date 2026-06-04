"use client";

import { useState, useEffect, useMemo } from "react";
import { useBracketPrediction } from "@/hooks/useBracketPrediction";
import { BracketProgressBar } from "./BracketProgressBar";
import { BracketMatchCard } from "./BracketMatchCard";
import { BracketLeaderboard } from "./BracketLeaderboard";
import { encodePredictionState } from "@/lib/bracket-prediction";
import {
  ChevronUp,
  ChevronDown,
  LayoutGrid,
  Trophy,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Share2,
  Image,
} from "lucide-react";

export function BracketChallenge() {
  const {
    groups,
    loading,
    groupRankings,
    thirdPlaces,
    knockoutPicks,
    knockoutMatches,
    rankTeam,
    toggleThirdPlace,
    pickWinner,
    resetBracket,
    isGroupsCompleted,
    isThirdPlacesCompleted,
    knockoutMatchesCount,
    totalKnockoutMatches,
    isBracketComplete,
  } = useBracketPrediction();

  const [activeTab, setActiveTab] = useState<"groups" | "wildcard" | "bracket" | "leaderboard">("groups");
  const [copiedShare, setCopiedShare] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Sync theme state with HTML class list
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Compute prediction code and share URL
  const predictionCode = useMemo(() => {
    if (!isBracketComplete) return "";
    return encodePredictionState({ groupRankings, thirdPlaces, knockoutPicks });
  }, [groupRankings, thirdPlaces, knockoutPicks, isBracketComplete]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !predictionCode) return "";
    return `${window.location.origin}/bracket/share?p=${predictionCode}&theme=${theme}`;
  }, [predictionCode, theme]);

  const handleCopyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Calculate overall percentage
  const totalSteps = 12 + 8 + totalKnockoutMatches; // 12 groups ranked + 8 thirds selected + 32 matches predicted = 52 steps
  const completedGroupsCount = Object.keys(groupRankings).length;
  const completedThirdsCount = thirdPlaces.length;
  const currentStep = completedGroupsCount + completedThirdsCount + knockoutMatchesCount;
  const completionPercentage = groups.length === 0 ? 0 : (currentStep / totalSteps) * 100;

  if (loading || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400 gap-3">
        <div className="h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-base font-semibold tracking-widest animate-pulse">Initializing Predictor...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-fade-in">
      {/* Top Controller Panel */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch justify-between bg-slate-900/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex-1 flex flex-col gap-4">
          <BracketProgressBar percentage={completionPercentage} />
          
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-full border ${
              isGroupsCompleted 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-slate-950 text-slate-500 border-white/5"
            }`}>
              Groups Ranked (12/12)
            </span>
            <span className={`px-2.5 py-1 rounded-full border ${
              isThirdPlacesCompleted 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-slate-950 text-slate-500 border-white/5"
            }`}>
              Wildcards Picked ({thirdPlaces.length}/8)
            </span>
            <span className={`px-2.5 py-1 rounded-full border ${
              knockoutMatchesCount === totalKnockoutMatches 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-slate-950 text-slate-500 border-white/5"
            }`}>
              Knockout Picks ({knockoutMatchesCount}/{totalKnockoutMatches})
            </span>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-3 justify-end items-center md:items-stretch">
          <button
            onClick={resetBracket}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer grow text-center animate-fade-in"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2 scrollbar-none overflow-x-auto pb-px">
        {[
          { key: "groups", label: "1. Group Stage", icon: LayoutGrid },
          { key: "wildcard", label: "2. Wildcards", icon: HelpCircle },
          { key: "bracket", label: "3. Knockouts", icon: Trophy },
          { key: "leaderboard", label: "Leaderboard", icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as "groups" | "wildcard" | "bracket" | "leaderboard")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {/* Step 1: Groups */}
        {activeTab === "groups" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group) => {
              const rankings = groupRankings[group.id] || [];
              return (
                <div
                  key={group.id}
                  className="flex flex-col bg-slate-900/30 rounded-2xl border border-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="text-base font-extrabold text-amber-400 mb-4 border-b border-white/5 pb-2 uppercase tracking-wide">
                    {group.name}
                  </div>

                  <div className="flex flex-col gap-2">
                    {rankings.map((teamId, idx) => {
                      const team = group.teams.find((t) => t.id === teamId);
                      if (!team) return null;

                      // Styles for positions
                      let numberBadgeClass = "bg-slate-800 text-slate-400";
                      if (idx === 0) numberBadgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
                      if (idx === 1) numberBadgeClass = "bg-sky-500/10 text-sky-400 border border-sky-500/25";
                      if (idx === 2) numberBadgeClass = "bg-amber-500/10 text-amber-300 border border-amber-500/20";

                      return (
                        <div
                          key={teamId}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-slate-950/80 transition-colors gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${numberBadgeClass}`}>
                              {idx + 1}
                            </span>
                            {team.flagUrl && (
                              <img
                                src={team.flagUrl}
                                alt=""
                                className="h-5 w-7 object-cover rounded shadow-sm border border-white/5"
                              />
                            )}
                            <span className="text-sm font-semibold text-slate-200 truncate">
                              {team.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => rankTeam(group.id, teamId, "up")}
                              disabled={idx === 0}
                              className={`p-1 rounded bg-slate-900 border border-white/5 transition-all text-slate-400 ${
                                idx === 0 
                                  ? "opacity-30 cursor-not-allowed" 
                                  : "cursor-pointer hover:bg-slate-800 hover:text-white"
                              }`}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => rankTeam(group.id, teamId, "down")}
                              disabled={idx === 3}
                              className={`p-1 rounded bg-slate-900 border border-white/5 transition-all text-slate-400 ${
                                idx === 3 
                                  ? "opacity-30 cursor-not-allowed" 
                                  : "cursor-pointer hover:bg-slate-800 hover:text-white"
                              }`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Wildcards */}
        {activeTab === "wildcard" && (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex gap-4 items-start text-sm text-slate-300">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-amber-300">Choose the 8 Best 3rd-Place Qualifiers</span>
                <span>
                  Under the expanded 48-team format, 8 of the 12 third-place finishers advance to the Round of 32. 
                  Based on your Group rankings, select the **exactly 8 groups** whose third-place team should advance.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groups.map((group) => {
                const thirdPlaceTeamId = groupRankings[group.id]?.[2];
                const thirdPlaceTeam = group.teams.find((t) => t.id === thirdPlaceTeamId);
                const isSelected = thirdPlaces.includes(group.id);
                
                if (!thirdPlaceTeam) return null;

                return (
                  <button
                    key={group.id}
                    onClick={() => toggleThirdPlace(group.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-400/5 shadow-md shadow-amber-500/5"
                        : "border-white/5 bg-slate-900/30 hover:border-white/10 hover:bg-slate-900/60"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                      Group {group.id} 3rd
                    </span>

                    {thirdPlaceTeam.flagUrl && (
                      <img
                        src={thirdPlaceTeam.flagUrl}
                        alt=""
                        className="h-8 w-12 object-cover rounded-md shadow border border-white/5"
                      />
                    )}

                    <span className="text-sm font-bold text-slate-200">
                      {thirdPlaceTeam.name}
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-amber-400 text-slate-950"
                        : "bg-slate-950 text-slate-500"
                    }`}>
                      {isSelected ? "QUALIFIED" : "ELIMINATED"}
                    </span>
                  </button>
                );
              })}
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setActiveTab("bracket")}
                disabled={!isThirdPlacesCompleted}
                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  isThirdPlacesCompleted
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/10 hover:scale-[1.01]"
                    : "bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed"
                }`}
              >
                Go to Knockout Bracket →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Knockouts */}
        {activeTab === "bracket" && (
          <div className="flex flex-col gap-10 w-full">
            {/* Warning if steps 1 & 2 are incomplete */}
            {(!isGroupsCompleted || !isThirdPlacesCompleted) ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 gap-4 border border-dashed border-white/10 rounded-2xl bg-slate-900/10 max-w-xl mx-auto">
                <AlertCircle className="h-10 w-10 text-amber-500 animate-pulse" />
                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-white text-base">Complete Steps 1 & 2 First</span>
                  <span className="text-sm max-w-md">
                    To populate the Round of 32 matches, you need to rank all 12 group standings and pick exactly 8 wildcard 3rd-placed teams.
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveTab("groups")}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 text-white cursor-pointer hover:bg-slate-700"
                  >
                    1. Rank Groups
                  </button>
                  <button
                    onClick={() => setActiveTab("wildcard")}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-800 text-white cursor-pointer hover:bg-slate-700"
                  >
                    2. Pick Wildcards
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-12 w-full">
                {/* Round of 32 */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 flex items-center gap-2 border-b border-white/10 pb-3">
                    Round of 32
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 16 }).map((_, idx) => {
                      const matchNum = idx + 73;
                      const match = knockoutMatches[matchNum];
                      return (
                        <BracketMatchCard
                          key={matchNum}
                          matchNumber={matchNum}
                          stageLabel="Round of 32"
                          homeTeam={match?.home}
                          awayTeam={match?.away}
                          winnerId={knockoutPicks[matchNum]}
                          onPickWinner={pickWinner}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Round of 16 */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 flex items-center gap-2 border-b border-white/10 pb-3">
                    Round of 16
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, idx) => {
                      const matchNum = idx + 89;
                      const match = knockoutMatches[matchNum];
                      return (
                        <BracketMatchCard
                          key={matchNum}
                          matchNumber={matchNum}
                          stageLabel="Round of 16"
                          homeTeam={match?.home}
                          awayTeam={match?.away}
                          winnerId={knockoutPicks[matchNum]}
                          onPickWinner={pickWinner}
                          homePlaceholder={`Winner Match ${(idx * 2) + 73}`}
                          awayPlaceholder={`Winner Match ${(idx * 2) + 74}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Quarter-finals */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 flex items-center gap-2 border-b border-white/10 pb-3">
                    Quarter-finals
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, idx) => {
                      const matchNum = idx + 97;
                      const match = knockoutMatches[matchNum];
                      return (
                        <BracketMatchCard
                          key={matchNum}
                          matchNumber={matchNum}
                          stageLabel="Quarter-final"
                          homeTeam={match?.home}
                          awayTeam={match?.away}
                          winnerId={knockoutPicks[matchNum]}
                          onPickWinner={pickWinner}
                          homePlaceholder={`Winner Match ${(idx * 2) + 89}`}
                          awayPlaceholder={`Winner Match ${(idx * 2) + 90}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Semi-finals */}
                <div className="flex flex-col gap-4">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 flex items-center gap-2 border-b border-white/10 pb-3">
                    Semi-finals
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                    {Array.from({ length: 2 }).map((_, idx) => {
                      const matchNum = idx + 101;
                      const match = knockoutMatches[matchNum];
                      return (
                        <BracketMatchCard
                          key={matchNum}
                          matchNumber={matchNum}
                          stageLabel="Semi-final"
                          homeTeam={match?.home}
                          awayTeam={match?.away}
                          winnerId={knockoutPicks[matchNum]}
                          onPickWinner={pickWinner}
                          homePlaceholder={`Winner Match ${(idx * 2) + 97}`}
                          awayPlaceholder={`Winner Match ${(idx * 2) + 98}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Third Place & Final side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Third Place */}
                  <div className="flex flex-col gap-4">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-amber-400 flex items-center gap-2 border-b border-white/10 pb-3">
                      Third Place Play-off
                    </h2>
                    <BracketMatchCard
                      matchNumber={103}
                      stageLabel="Third Place"
                      homeTeam={knockoutMatches[103]?.home}
                      awayTeam={knockoutMatches[103]?.away}
                      winnerId={knockoutPicks[103]}
                      onPickWinner={pickWinner}
                      homePlaceholder="Loser Match 101"
                      awayPlaceholder="Loser Match 102"
                    />
                  </div>

                  {/* Final */}
                  <div className="flex flex-col gap-4">
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight text-emerald-400 flex items-center gap-2 border-b border-white/10 pb-3">
                      <Trophy className="h-5 w-5 animate-pulse" />
                      Grand Final
                    </h2>
                    <BracketMatchCard
                      matchNumber={104}
                      stageLabel="Grand Final"
                      homeTeam={knockoutMatches[104]?.home}
                      awayTeam={knockoutMatches[104]?.away}
                      winnerId={knockoutPicks[104]}
                      onPickWinner={pickWinner}
                      homePlaceholder="Winner Match 101"
                      awayPlaceholder="Winner Match 102"
                    />
                  </div>
                </div>

                {/* Ultimate Champion Display! */}
                {knockoutPicks[104] && (
                  <div className="flex flex-col gap-6 items-center max-w-md mx-auto mt-8">
                    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30 rounded-3xl text-center gap-3 shadow-2xl relative overflow-hidden animate-pulse w-full">
                      <Trophy className="h-16 w-16 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-400">
                        Predicted Champion
                      </span>
                      <span className="text-3xl font-extrabold text-white">
                        {knockoutMatches[104]?.home?.id === knockoutPicks[104]
                          ? knockoutMatches[104]?.home?.name
                          : knockoutMatches[104]?.away?.name}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                      <button
                        onClick={handleCopyShare}
                        className="px-5 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer grow text-center"
                      >
                        {copiedShare ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            Link Copied!
                          </>
                        ) : (
                          <>
                            <Share2 className="h-4 w-4" />
                            Share Prediction
                          </>
                        )}
                      </button>

                      <a
                        href={`/api/predict/bracket/og?p=${predictionCode}&theme=${theme}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10 bg-slate-950 text-slate-200 hover:bg-slate-900 hover:text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer grow text-center"
                      >
                        <Image className="h-4 w-4 text-amber-400" />
                        Download Card
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Leaderboard */}
        {activeTab === "leaderboard" && <BracketLeaderboard />}
      </div>
    </div>
  );
}
