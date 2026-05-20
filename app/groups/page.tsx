import { GroupGrid } from "@/components/groups/GroupGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Standings — FIFA World Cup 2026™",
  description: "Track live group standings for all 48 national teams across Groups A to L. Visual indicators for qualification and best third-place slots.",
};

export default function GroupsPage() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Group Standings
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          Real-time tournament tables for Groups A through L.
        </p>
      </div>

      {/* Standings Grid */}
      <GroupGrid />
    </div>
  );
}
