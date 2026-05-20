"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Calendar, MapPin, Command } from "lucide-react";
import type { MatchWithTeams } from "@/types";
import { getLocalDateLabel } from "@/lib/timezone";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load matches once modal is opened
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch("/api/fixtures?sort=date")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.matches) {
          setMatches(data.matches);
        }
      })
      .catch((err) => console.error("Failed to load search fixtures:", err))
      .finally(() => setLoading(false));

    // Focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Global escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Perform search in-memory
  const normalizedQuery = query.trim().toLowerCase();

  const filteredMatches = normalizedQuery
    ? matches
        .filter((m) => {
          const homeName =
            m.homeTeam?.name?.toLowerCase() ?? m.homePlaceholder?.toLowerCase() ?? "";
          const awayName =
            m.awayTeam?.name?.toLowerCase() ?? m.awayPlaceholder?.toLowerCase() ?? "";
          const venueName = m.venue.name.toLowerCase();
          const venueCity = m.venue.city.toLowerCase();
          const stage = m.stage.toLowerCase();

          return (
            homeName.includes(normalizedQuery) ||
            awayName.includes(normalizedQuery) ||
            venueName.includes(normalizedQuery) ||
            venueCity.includes(normalizedQuery) ||
            stage.includes(normalizedQuery) ||
            String(m.matchNumber) === normalizedQuery
          );
        })
        .slice(0, 8) // Limit to top 8 matches for premium, fast UX
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 shadow-[0_10px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Area */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search teams, venues, cities or stages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded border border-white/10 bg-slate-950/40 text-[10px] text-slate-500 font-mono">
            <span>ESC</span>
          </div>
        </div>

        {/* Results scroll area */}
        <div className="max-h-[350px] overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-xs">
              <span className="animate-spin border-2 border-amber-400 border-t-transparent w-4 h-4 rounded-full" />
              <span>Searching matches...</span>
            </div>
          ) : query === "" ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
              <Command className="h-8 w-8 text-slate-600" />
              <p className="text-xs font-medium">Type to search the FIFA World Cup 2026 calendar</p>
              <p className="text-[10px] text-slate-600">
                Search by "Miami", "Argentina", "Group A" or venue names
              </p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-xs font-medium">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5 flex items-center justify-between">
                <span>Matching Fixtures</span>
                <span>{filteredMatches.length} results</span>
              </div>

              {filteredMatches.map((m) => {
                const homeName = m.homeTeam?.name ?? m.homePlaceholder ?? "TBD";
                const awayName = m.awayTeam?.name ?? m.awayPlaceholder ?? "TBD";
                const kickoffDate = getLocalDateLabel(m.kickoffUtc);

                return (
                  <Link
                    key={m.id}
                    href={m.homeTeam?.id ? `/teams/${m.homeTeam.id}` : `/fixtures`}
                    onClick={onClose}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl hover:bg-white/[0.03] hover:border-white/5 border border-transparent transition-all group cursor-pointer"
                  >
                    {/* Teams Display */}
                    <div className="flex items-center gap-3">
                      {/* Flag Home */}
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200 group-hover:text-white transition-colors text-xs sm:text-sm">
                        {m.homeTeam?.flagUrl && (
                          <img
                            src={m.homeTeam.flagUrl}
                            alt=""
                            className="h-3 w-5 object-cover rounded shadow-sm border border-white/10 shrink-0"
                          />
                        )}
                        <span>{homeName}</span>
                      </div>
                      <span className="text-slate-600 text-xs font-bold">vs</span>
                      {/* Flag Away */}
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200 group-hover:text-white transition-colors text-xs sm:text-sm">
                        {m.awayTeam?.flagUrl && (
                          <img
                            src={m.awayTeam.flagUrl}
                            alt=""
                            className="h-3 w-5 object-cover rounded shadow-sm border border-white/10 shrink-0"
                          />
                        )}
                        <span>{awayName}</span>
                      </div>
                    </div>

                    {/* Venue and Stage info */}
                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium shrink-0">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {m.venue.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {kickoffDate}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
