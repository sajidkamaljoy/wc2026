"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLiveScores } from "@/components/live/useLiveScores";
import { Calendar, LayoutGrid, Network, Target } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const { scores } = useLiveScores();
  const hasLive = scores.some((s) => s.status === "LIVE" || s.status === "HALF_TIME");

  const links = [
    { href: "/fixtures", label: "Fixtures", icon: Calendar, showLiveBadge: true },
    { href: "/groups", label: "Groups", icon: LayoutGrid },
    { href: "/bracket", label: "Bracket", icon: Network },
    { href: "/pickem", label: "Pick'em", icon: Target },
  ];

  const isLinkActive = (href: string) =>
    pathname.startsWith(href) || (href === "/fixtures" && pathname === "/");

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around px-2">
        {links.map((link) => {
          const isActive = isLinkActive(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                isActive ? "text-amber-400" : "text-slate-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                {link.showLiveBadge && hasLive && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold tracking-wider uppercase">
                {link.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-[2px] w-6 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
