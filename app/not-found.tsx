"use client";

import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-16 animate-fade-in">
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-16 h-16 bg-slate-900/50 border border-white/5 text-amber-400 rounded-2xl">
          <Compass className="w-8 h-8" />
        </div>
      </div>

      <h2 className="text-3xl font-extrabold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-3">
        404 — Page Not Found
      </h2>
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed text-sm sm:text-base">
        It looks like you've wandered off the pitch. The page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/10 active:scale-[0.98] flex items-center gap-2 text-sm"
      >
        <Home className="w-4 h-4" />
        Back to Fixtures
      </Link>
    </div>
  );
}
