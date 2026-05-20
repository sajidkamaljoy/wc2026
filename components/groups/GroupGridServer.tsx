import { GroupTable } from "./GroupTable";
import type { GroupWithStandings } from "@/types";
import { LayoutGrid } from "lucide-react";

interface Props {
  groups: GroupWithStandings[];
}

/**
 * Server-safe version of the grid — receives data as props (pre-fetched on the server).
 * No useEffect, no spinner, no "use client" — renders immediately.
 */
export function GroupGridServer({ groups }: Props) {
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
