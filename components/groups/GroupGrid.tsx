"use client";

import { useState, useEffect } from "react";
import { GroupTable } from "./GroupTable";
import type { GroupWithStandings } from "@/types";
import { Loader2, LayoutGrid } from "lucide-react";

export function GroupGrid() {
  const [groups, setGroups] = useState<GroupWithStandings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/groups")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch group standings");
        return r.json();
      })
      .then((data) => {
        if (active && data && data.groups) {
          setGroups(data.groups);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        <span className="text-sm font-medium tracking-wide">Loading group standings…</span>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500 border border-dashed border-white/5 rounded-3xl bg-slate-900/10">
        <LayoutGrid className="h-10 w-10 text-slate-600" />
        <span className="text-sm font-semibold">No group standings available.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300">
      {groups.map((g) => (
        <GroupTable key={g.id} group={g} />
      ))}
    </div>
  );
}
