import type { MatchStatusType } from "@/types";

interface Props {
  status: MatchStatusType;
  minute?: number;
}

export function LiveScoreBadge({ status, minute }: Props) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-semibold uppercase tracking-wider mt-0.5 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        {minute ? `${minute}'` : "LIVE"}
      </span>
    );
  }
  if (status === "HALF_TIME") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/30 text-xs text-yellow-400 font-semibold uppercase tracking-wider mt-0.5">
        HT
      </span>
    );
  }
  if (status === "FINISHED") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-500/10 border border-gray-700/50 text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
        FT
      </span>
    );
  }
  return null;
}
