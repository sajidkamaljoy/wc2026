"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  reset?: () => void;
  showHome?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this page. Please try again.",
  reset,
  showHome = true,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4 py-12 animate-fade-in">
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse" />
        <div className="relative flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
      </div>

      <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-amber-500 bg-clip-text text-transparent mb-3">
        {title}
      </h2>
      <p className="text-slate-400 max-w-md mb-8 leading-relaxed text-sm sm:text-base">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none justify-center">
        {reset && (
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/10 active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        )}

        {showHome && (
          <Link
            href="/"
            className="w-full sm:w-auto border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 px-6 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        )}
      </div>
    </div>
  );
}
