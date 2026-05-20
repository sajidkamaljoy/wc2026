"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveScores } from "@/components/live/useLiveScores";
import { Trophy, Calendar, LayoutGrid, Radio, Search } from "lucide-react";
import { SearchModal } from "@/components/search/SearchModal";

export function NavBar() {
  const pathname = usePathname();
  const { scores } = useLiveScores();
  const hasLive = scores.some((s) => s.status === "LIVE" || s.status === "HALF_TIME");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const links = [
    { href: "/fixtures", label: "Fixtures", icon: Calendar },
    { href: "/groups", label: "Groups", icon: LayoutGrid },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          {/* Logo / Title */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:scale-[1.02] transition-transform"
          >
            <Trophy className="h-6 w-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            <span className="font-extrabold uppercase">WC2026</span>
            <span className="hidden sm:inline text-xs font-medium text-amber-500/80 uppercase tracking-widest border border-amber-500/30 px-1.5 py-0.5 rounded">
              Companion
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex space-x-1 sm:space-x-2">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href) || (link.href === "/fixtures" && pathname === "/");
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? "text-white bg-white/5 border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Search & Live Indicator */}
        <div className="flex items-center gap-3">
          {/* Spotlight Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/10 hover:bg-slate-900 transition-all cursor-pointer text-xs font-medium"
            title="Search matches (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-slate-300" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 bg-slate-950/80 text-[9px] text-slate-500 font-mono select-none">
              <span className="text-[7px]">Ctrl</span>
              <span>K</span>
            </kbd>
          </button>

          {/* Live Indicator */}
          <div>
            {hasLive ? (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="hidden sm:inline flex items-center gap-1">
                  <Radio className="h-3.5 w-3.5" /> Live matches on
                </span>
                <span className="sm:hidden">Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-slate-600" />
                <span className="hidden sm:inline">Live Feed: Idle</span>
                <span className="sm:hidden">Idle</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Global Spotlight Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
