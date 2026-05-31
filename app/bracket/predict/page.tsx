import { BracketChallenge } from "@/components/bracket/BracketChallenge";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bracket Predictor",
  description: "Predict the group rankings and complete your 2026 World Cup bracket to predict the champion.",
};

export default function BracketPredictPage() {
  return (
    <div className="w-full flex flex-col gap-8 pb-24 px-4 sm:px-0 max-w-7xl mx-auto py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 uppercase bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
          Bracket Predictor
        </h1>
        <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl">
          Build your ultimate World Cup 2026 bracket. Rank groups, choose the wildcard 3rd-place teams, and pick every knockout winner.
        </p>
      </div>

      <BracketChallenge />
    </div>
  );
}
