"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveScores } from "@/components/live/useLiveScores";
import {
  Trophy,
  Calendar,
  LayoutGrid,
  Radio,
  Search,
  Network,
  Sun,
  Moon,
  Target,
  MoreHorizontal,
} from "lucide-react";
import { SearchModal } from "@/components/search/SearchModal";
import { useTheme } from "@/hooks/useTheme";

export function NavBar() {
  const pathname = usePathname();
  const { scores } = useLiveScores();
  const hasLive = scores.some((s) => s.status === "LIVE" || s.status === "HALF_TIME");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, toggleTheme, isLoaded } = useTheme();

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
    { href: "/bracket", label: "Bracket", icon: Network },
    { href: "/pickem", label: "Pick'em", icon: Target },
  ];

  const isLinkActive = (href: string) =>
    pathname.startsWith(href) || (href === "/fixtures" && pathname === "/");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Left: Logo + Nav ── */}
        <div className="flex items-center gap-4 sm:gap-8">

          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold hover:scale-[1.01] transition-transform shrink-0"
          >
            <img 
              src="/fifa-2026-logo.svg" 
              alt="FIFA World Cup 2026 Logo" 
              className="h-10 w-auto object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.2)] rounded-md border border-white/5"
            />
            <span className="font-extrabold uppercase text-base sm:text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
              WC2026
            </span>
            <span className="hidden sm:inline text-[10px] font-bold text-amber-400 uppercase tracking-widest border border-amber-500/20 px-1.5 py-0.5 rounded bg-slate-950/40 shadow-inner">
              Companion
            </span>
          </Link>

          {/* Navigation (Desktop only) */}
          <nav className="hidden sm:flex items-center space-x-1">
            {links.map((link) => {
              const isActive = isLinkActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={`relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${isActive
                    ? "text-white bg-white/5 border border-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Right: Theme + Search + Live ── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/10 hover:bg-slate-900 transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isLoaded ? (
              theme === "dark" ? (
                <Sun className="h-4 w-4 shrink-0 transition-all duration-300 rotate-0 scale-100 hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 shrink-0 transition-all duration-300 rotate-0 scale-100 hover:-rotate-12" />
              )
            ) : (
              <div className="h-4 w-4 rounded-full bg-slate-800 animate-pulse" />
            )}
          </button>

          {/* Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/5 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/10 hover:bg-slate-900 transition-all cursor-pointer text-xs font-medium"
            title="Search matches (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-500" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 bg-slate-950/80 text-[9px] text-slate-500 font-mono select-none">
              <span className="text-[7px]">Ctrl</span>
              <span>K</span>
            </kbd>
          </button>

          {/* Live Indicator */}
          <div className="shrink-0">
            {hasLive ? (
              <>
                {/* Mobile: pulsing dot only */}
                <span
                  className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-red-500/10 border border-red-500/30 animate-pulse"
                  title="Live matches on"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                </span>
                {/* sm+: full badge */}
                <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.2)] animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <Radio className="h-3.5 w-3.5" />
                  Live
                </span>
              </>
            ) : (
              <>
                {/* Mobile: grey dot only */}
                <span
                  className="flex sm:hidden items-center justify-center w-7 h-7 rounded-full bg-slate-900 border border-slate-800"
                  title="Live Feed: Idle"
                >
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                </span>
                {/* sm+: full badge */}
                <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <span className="h-2 w-2 rounded-full bg-slate-600" />
                  Live Feed: Idle
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Global Spotlight Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}