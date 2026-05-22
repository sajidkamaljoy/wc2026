import { FixtureList } from "@/components/fixtures/FixtureList";
import { NewsFeed } from "@/components/news/NewsFeed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournament Fixtures & Calendar — FIFA World Cup 2026™",
  description: "View the official 104-match schedule of the FIFA World Cup 2026, filtered by group or knockout stages, automatically translated to your timezone.",
};

export default function FixturesPage() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Tournament Fixtures
        </h1>
      </div>

      <NewsFeed />

      {/* Fixtures list organizer */}
      <FixtureList />
    </div>
  );
}
