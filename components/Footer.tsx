"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Copy, Check, Calendar, LayoutGrid, Network, Target, ShieldAlert } from "lucide-react";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const email = "sajidkamaljoy@gmail.com";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const navLinks = [
    { href: "/fixtures", label: "Match Schedule", icon: Calendar },
    { href: "/groups", label: "Group Standings", icon: LayoutGrid },
    { href: "/bracket", label: "Knockout Bracket", icon: Network },
    { href: "/pickem", label: "Pick'em Predictor", icon: Target },
  ];

  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/90 backdrop-blur-md mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-white/5">
          
          {/* About / Logo Section */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <img 
                src="/fifa-2026-logo.svg" 
                alt="FIFA World Cup 2026 Logo" 
                className="h-8 w-auto object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.15)] rounded bg-slate-950/40 border border-white/5"
              />
              <span className="font-extrabold uppercase text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                WC2026
              </span>
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest border border-amber-500/20 px-1.5 py-0.5 rounded bg-slate-950/40">
                Companion
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Your ultimate fan hub for the 104-match historic FIFA World Cup 2026™. Follow real-time scores, predict match outcomes, and track knockout path predictions.
            </p>

            <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-900/30 border border-white/5 rounded-xl p-3 max-w-md shadow-inner mt-2">
              <ShieldAlert className="h-4 w-4 text-amber-500/60 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> This is an unofficial, non-commercial fan-run platform. We are not associated with, endorsed by, or affiliated with FIFA, the official organizers, or any participating national teams.
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 sm:col-span-6 md:col-span-3 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tournament Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 group w-fit"
                    >
                      <Icon className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact / Gmail Section */}
          <div className="col-span-1 sm:col-span-6 md:col-span-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Contact & Feedback
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Have suggestions, reported bugs, or looking to collaborate? Drop a message directly to the developer.
            </p>
            
            <div className="flex flex-col gap-2.5 mt-1">
              {/* Direct Mail Link Button */}
              <a
                href={`mailto:${email}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400/30 hover:bg-slate-900/80 hover:text-amber-400 transition-all duration-300 shadow-md group"
              >
                <Mail className="h-4 w-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                sajidkamaljoy@gmail.com
              </a>

              {/* Click to Copy Sub-option */}
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer w-fit mx-auto sm:mx-0 px-2 py-1 rounded-md hover:bg-white/5"
                title="Copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 shrink-0" />
                    <span>Copy email</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FIFA World Cup 2026™ Fan Companion. All rights reserved.</p>
          <p className="font-medium text-slate-600 hover:text-slate-500 transition-colors">
            Designed for fans worldwide ⚽
          </p>
        </div>
        
      </div>
    </footer>
  );
}
