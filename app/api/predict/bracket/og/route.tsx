import { ImageResponse } from "next/og";
import { decodePredictionState } from "../../../../../lib/bracket-prediction";
import { FALLBACK_TEAMS_RAW } from "../../../../../lib/fallback-data";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const p = searchParams.get("p");

    let prediction = null;
    if (p) {
      prediction = decodePredictionState(p);
    }

    // Helper to get team info
    const getTeam = (id?: string) => {
      if (!id) return null;
      return FALLBACK_TEAMS_RAW.find((t) => t.id === id) || null;
    };

    const getHighResFlag = (flagUrl: string | null) => {
      if (!flagUrl) return "";
      return flagUrl.replace("/w40/", "/w160/");
    };

    // Extract picks
    const picks = prediction?.knockoutPicks || {};

    // Ultimate champion (Match 104 winner)
    const championId = picks[104];
    const champion = getTeam(championId);

    // Finalists (Match 104 home & away)
    const finalist1Id = picks[101];
    const finalist2Id = picks[102];
    const finalist1 = getTeam(finalist1Id);
    const finalist2 = getTeam(finalist2Id);

    // Semi-finalists
    const sf1Home = getTeam(picks[97]);
    const sf1Away = getTeam(picks[98]);
    const sf2Home = getTeam(picks[99]);
    const sf2Away = getTeam(picks[100]);

    const hasCompletedBracket = champion && finalist1 && finalist2 && sf1Home && sf1Away && sf2Home && sf2Away;

    if (!hasCompletedBracket) {
      // Return gorgeous default predictor social card
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#020617",
              fontFamily: "sans-serif",
              color: "#f8fafc",
              padding: "40px",
              border: "12px solid #fbbf24",
            }}
          >
            {/* Background elements */}
            <div tw="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none w-full h-full">
              <div tw="flex justify-between w-full p-4">
                <div tw="text-lg font-bold">FIFA WORLD CUP 2026</div>
                <div tw="text-lg font-bold">BRACKET PREDICTOR</div>
              </div>
              <div tw="flex justify-between w-full p-4">
                <div tw="text-lg font-bold">104 MATCHES</div>
                <div tw="text-lg font-bold">ROAD TO METLIFE</div>
              </div>
            </div>

            <div tw="flex flex-col items-center max-w-4xl text-center gap-6">
              {/* Trophy Icon */}
              <div tw="flex items-center justify-center bg-amber-500/10 p-6 rounded-full border border-amber-500/30 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z" />
                </svg>
              </div>

              <h1 tw="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent uppercase">
                World Cup 2026™ Bracket Predictor
              </h1>
              <p tw="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed">
                Rank groups, choose wildcard 3rd-place qualifiers, and predict every knockout match to crown your champion!
              </p>
              <div tw="mt-4 px-6 py-3 bg-amber-500 text-slate-950 font-extrabold rounded-xl text-lg shadow-lg">
                fifawc2026.me/bracket/predict
              </div>
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Render fully custom bracket prediction card!
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#020617",
            backgroundImage: "radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)",
            fontFamily: "sans-serif",
            color: "#f8fafc",
            padding: "36px",
            border: "8px solid #fbbf24",
            justifyContent: "space-between",
          }}
        >
          {/* Header branding */}
          <div tw="flex items-center justify-between w-full border-b border-white/10 pb-4">
            <div tw="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z" />
              </svg>
              <span tw="text-xl font-black tracking-wider text-amber-400 uppercase">
                World Cup 2026™ Bracket Predictor
              </span>
            </div>
            <div tw="px-3.5 py-1.5 bg-slate-900 border border-white/10 rounded-full text-xs font-bold text-slate-400 uppercase tracking-widest">
              Fan companion prediction card
            </div>
          </div>

          {/* Main content area */}
          <div tw="flex flex-row justify-between items-center w-full my-auto gap-8">
            {/* Left Side: Predicted Champion Card */}
            <div tw="flex flex-col items-center justify-center flex-1 bg-slate-900/60 border border-amber-500/40 rounded-3xl p-6 text-center max-w-[480px]">
              <div tw="flex items-center justify-center bg-amber-500/10 p-4 rounded-full border border-amber-500/30 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                  <path d="M12 2a6 6 0 0 0-6 6v5a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6z" />
                </svg>
              </div>
              <span tw="text-xs uppercase font-extrabold tracking-widest text-amber-400 mb-1">
                My Predicted Champion
              </span>
              <h2 tw="text-4xl font-black text-white uppercase tracking-tight mb-4">
                {champion.name}
              </h2>
              {champion.flagUrl && (
                <img
                  src={getHighResFlag(champion.flagUrl)}
                  alt={champion.name}
                  tw="h-28 w-44 object-cover rounded-xl shadow-2xl border border-white/20"
                />
              )}
            </div>

            {/* Right Side: Visual Semis & Final Flow */}
            <div tw="flex flex-col flex-1 gap-5 bg-slate-900/30 border border-white/5 rounded-3xl p-6">
              <span tw="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-white/5 pb-2 mb-1">
                Predicted Tournament Pathway
              </span>

              {/* Semi Final 1 */}
              <div tw="flex flex-row justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                <div tw="flex flex-col gap-1.5">
                  <span tw="text-[10px] uppercase font-bold text-slate-500">Semi-Final 1</span>
                  <div tw="flex items-center gap-2">
                    {sf1Home?.flagUrl && <img src={sf1Home.flagUrl} tw="h-4 w-6 rounded shadow-sm border border-white/5" />}
                    <span tw={`text-sm font-semibold ${finalist1Id === sf1Home?.id ? "text-amber-400 font-bold" : "text-slate-300"}`}>
                      {sf1Home?.name}
                    </span>
                  </div>
                  <div tw="flex items-center gap-2">
                    {sf1Away?.flagUrl && <img src={sf1Away.flagUrl} tw="h-4 w-6 rounded shadow-sm border border-white/5" />}
                    <span tw={`text-sm font-semibold ${finalist1Id === sf1Away?.id ? "text-amber-400 font-bold" : "text-slate-300"}`}>
                      {sf1Away?.name}
                    </span>
                  </div>
                </div>
                <div tw="flex flex-col items-end gap-1">
                  <span tw="text-[9px] uppercase font-extrabold text-amber-500 tracking-wider">Advanced</span>
                  <div tw="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25">
                    {finalist1?.flagUrl && <img src={finalist1.flagUrl} tw="h-3 w-4.5 rounded-sm shadow-sm" />}
                    <span tw="text-xs font-bold text-amber-400">{finalist1?.name}</span>
                  </div>
                </div>
              </div>

              {/* Semi Final 2 */}
              <div tw="flex flex-row justify-between items-center bg-slate-950/40 p-3 rounded-2xl border border-white/5">
                <div tw="flex flex-col gap-1.5">
                  <span tw="text-[10px] uppercase font-bold text-slate-500">Semi-Final 2</span>
                  <div tw="flex items-center gap-2">
                    {sf2Home?.flagUrl && <img src={sf2Home.flagUrl} tw="h-4 w-6 rounded shadow-sm border border-white/5" />}
                    <span tw={`text-sm font-semibold ${finalist2Id === sf2Home?.id ? "text-amber-400 font-bold" : "text-slate-300"}`}>
                      {sf2Home?.name}
                    </span>
                  </div>
                  <div tw="flex items-center gap-2">
                    {sf2Away?.flagUrl && <img src={sf2Away.flagUrl} tw="h-4 w-6 rounded shadow-sm border border-white/5" />}
                    <span tw={`text-sm font-semibold ${finalist2Id === sf2Away?.id ? "text-amber-400 font-bold" : "text-slate-300"}`}>
                      {sf2Away?.name}
                    </span>
                  </div>
                </div>
                <div tw="flex flex-col items-end gap-1">
                  <span tw="text-[9px] uppercase font-extrabold text-amber-500 tracking-wider">Advanced</span>
                  <div tw="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25">
                    {finalist2?.flagUrl && <img src={finalist2.flagUrl} tw="h-3 w-4.5 rounded-sm shadow-sm" />}
                    <span tw="text-xs font-bold text-amber-400">{finalist2?.name}</span>
                  </div>
                </div>
              </div>

              {/* Grand Final Matchup */}
              <div tw="flex flex-row justify-between items-center bg-amber-500/5 p-3 rounded-2xl border border-amber-500/20">
                <div tw="flex flex-col gap-1.5">
                  <span tw="text-[10px] uppercase font-bold text-amber-400">Grand Final Matchup</span>
                  <div tw="flex items-center gap-2">
                    {finalist1?.flagUrl && <img src={finalist1.flagUrl} tw="h-4 w-6 rounded shadow-sm border border-white/5" />}
                    <span tw={`text-sm font-bold ${championId === finalist1Id ? "text-emerald-400" : "text-slate-200"}`}>
                      {finalist1?.name}
                    </span>
                  </div>
                  <div tw="flex items-center gap-2">
                    {finalist2?.flagUrl && <img src={finalist2.flagUrl} tw="h-4 w-6 rounded shadow-sm border border-white/5" />}
                    <span tw={`text-sm font-bold ${championId === finalist2Id ? "text-emerald-400" : "text-slate-200"}`}>
                      {finalist2?.name}
                    </span>
                  </div>
                </div>
                <div tw="flex flex-col items-end gap-1">
                  <span tw="text-[9px] uppercase font-extrabold text-emerald-400 tracking-wider">Champion Pick</span>
                  <div tw="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/25">
                    {champion?.flagUrl && <img src={champion.flagUrl} tw="h-3 w-4.5 rounded-sm" />}
                    <span tw="text-xs font-black text-emerald-400">{champion?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer App branding */}
          <div tw="flex flex-row justify-between items-center w-full border-t border-white/5 pt-4 text-slate-500 text-xs font-semibold">
            <span>Crown your champion. Play the Bracket Predictor now!</span>
            <span>fifawc2026.me/bracket/predict</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error: any) {
    console.error("⚠️ [OG API Error] Dynamic card generation failed:", error);
    return new Response(JSON.stringify({ error: "Failed to generate OG image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
