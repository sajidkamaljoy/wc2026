import { ImageResponse } from "next/og";

export const runtime = "edge";

// Static 48-team lookup mapping for Edge runtime compatibility
const TEAM_MAP: Record<string, { name: string; flagUrl: string }> = {
  MEX: { name: "Mexico", flagUrl: "https://flagcdn.com/w40/mx.png" },
  ZAF: { name: "South Africa", flagUrl: "https://flagcdn.com/w40/za.png" },
  KOR: { name: "South Korea", flagUrl: "https://flagcdn.com/w40/kr.png" },
  CZE: { name: "Czech Republic", flagUrl: "https://flagcdn.com/w40/cz.png" },
  CAN: { name: "Canada", flagUrl: "https://flagcdn.com/w40/ca.png" },
  BIH: { name: "Bosnia & Herz.", flagUrl: "https://flagcdn.com/w40/ba.png" },
  QAT: { name: "Qatar", flagUrl: "https://flagcdn.com/w40/qa.png" },
  SUI: { name: "Switzerland", flagUrl: "https://flagcdn.com/w40/ch.png" },
  BRA: { name: "Brazil", flagUrl: "https://flagcdn.com/w40/br.png" },
  MAR: { name: "Morocco", flagUrl: "https://flagcdn.com/w40/ma.png" },
  HAI: { name: "Haiti", flagUrl: "https://flagcdn.com/w40/ht.png" },
  SCO: { name: "Scotland", flagUrl: "https://flagcdn.com/w40/gb-sct.png" },
  USA: { name: "United States", flagUrl: "https://flagcdn.com/w40/us.png" },
  PAR: { name: "Paraguay", flagUrl: "https://flagcdn.com/w40/py.png" },
  AUS: { name: "Australia", flagUrl: "https://flagcdn.com/w40/au.png" },
  TUR: { name: "Türkiye", flagUrl: "https://flagcdn.com/w40/tr.png" },
  GER: { name: "Germany", flagUrl: "https://flagcdn.com/w40/de.png" },
  CUW: { name: "Curaçao", flagUrl: "https://flagcdn.com/w40/cw.png" },
  CIV: { name: "Ivory Coast", flagUrl: "https://flagcdn.com/w40/ci.png" },
  ECU: { name: "Ecuador", flagUrl: "https://flagcdn.com/w40/ec.png" },
  NED: { name: "Netherlands", flagUrl: "https://flagcdn.com/w40/nl.png" },
  JPN: { name: "Japan", flagUrl: "https://flagcdn.com/w40/jp.png" },
  SWE: { name: "Sweden", flagUrl: "https://flagcdn.com/w40/se.png" },
  TUN: { name: "Tunisia", flagUrl: "https://flagcdn.com/w40/tn.png" },
  BEL: { name: "Belgium", flagUrl: "https://flagcdn.com/w40/be.png" },
  EGY: { name: "Egypt", flagUrl: "https://flagcdn.com/w40/eg.png" },
  IRN: { name: "Iran", flagUrl: "https://flagcdn.com/w40/ir.png" },
  NZL: { name: "New Zealand", flagUrl: "https://flagcdn.com/w40/nz.png" },
  ESP: { name: "Spain", flagUrl: "https://flagcdn.com/w40/es.png" },
  CPV: { name: "Cape Verde", flagUrl: "https://flagcdn.com/w40/cv.png" },
  KSA: { name: "Saudi Arabia", flagUrl: "https://flagcdn.com/w40/sa.png" },
  URU: { name: "Uruguay", flagUrl: "https://flagcdn.com/w40/uy.png" },
  FRA: { name: "France", flagUrl: "https://flagcdn.com/w40/fr.png" },
  SEN: { name: "Senegal", flagUrl: "https://flagcdn.com/w40/sn.png" },
  IRQ: { name: "Iraq", flagUrl: "https://flagcdn.com/w40/iq.png" },
  NOR: { name: "Norway", flagUrl: "https://flagcdn.com/w40/no.png" },
  ARG: { name: "Argentina", flagUrl: "https://flagcdn.com/w40/ar.png" },
  ALG: { name: "Algeria", flagUrl: "https://flagcdn.com/w40/dz.png" },
  AUT: { name: "Austria", flagUrl: "https://flagcdn.com/w40/at.png" },
  JOR: { name: "Jordan", flagUrl: "https://flagcdn.com/w40/jo.png" },
  POR: { name: "Portugal", flagUrl: "https://flagcdn.com/w40/pt.png" },
  COD: { name: "DR Congo", flagUrl: "https://flagcdn.com/w40/cd.png" },
  UZB: { name: "Uzbekistan", flagUrl: "https://flagcdn.com/w40/uz.png" },
  COL: { name: "Colombia", flagUrl: "https://flagcdn.com/w40/co.png" },
  ENG: { name: "England", flagUrl: "https://flagcdn.com/w40/gb-eng.png" },
  CRO: { name: "Croatia", flagUrl: "https://flagcdn.com/w40/hr.png" },
  GHA: { name: "Ghana", flagUrl: "https://flagcdn.com/w40/gh.png" },
  PAN: { name: "Panama", flagUrl: "https://flagcdn.com/w40/pa.png" },
};

// Base64 decode function working fully on Edge runtime without Node Buffer dependency
function decodePredictionStateLocal(code: string) {
  try {
    let base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonStr = atob(base64);
    const data = JSON.parse(jsonStr);
    return {
      groupRankings: data.g as Record<string, string[]>,
      thirdPlaces: data.t as string[],
      knockoutPicks: data.k as Record<string, string>,
    };
  } catch (e) {
    console.error("Failed to decode bracket prediction state:", e);
    return null;
  }
}

// Solves 3rd-place allocations using backtracking search (Edge compatible)
function allocateThirdPlaces(selectedGroups: string[]): Record<number, string> {
  const pools: Record<number, string[]> = {
    74: ["A", "B", "C", "D", "F"],
    77: ["C", "D", "F", "G", "H"],
    79: ["C", "E", "F", "H", "I"],
    80: ["E", "H", "I", "J", "K"],
    81: ["B", "E", "F", "I", "J"],
    82: ["A", "E", "H", "I", "J"],
    85: ["E", "F", "G", "I", "J"],
    87: ["D", "E", "I", "J", "L"],
  };

  const assignment: Record<number, string> = {};
  const used = new Set<string>();
  const matchNumbers = [74, 77, 79, 80, 81, 82, 85, 87];

  function backtrack(index: number): boolean {
    if (index === matchNumbers.length) return true;
    const matchNum = matchNumbers[index];
    const allowed = pools[matchNum];

    for (const group of selectedGroups) {
      if (!used.has(group) && allowed.includes(group)) {
        used.add(group);
        assignment[matchNum] = group;
        if (backtrack(index + 1)) return true;
        delete assignment[matchNum];
        used.delete(group);
      }
    }
    return false;
  }

  if (backtrack(0)) {
    return assignment;
  }

  // Fallback: greedy match
  const remainingMatches = matchNumbers.filter((m) => !assignment[m]);
  const unusedGroups = selectedGroups.filter((g) => !used.has(g));
  for (let i = 0; i < remainingMatches.length; i++) {
    if (unusedGroups[i]) {
      assignment[remainingMatches[i]] = unusedGroups[i];
    }
  }

  return assignment;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const p = searchParams.get("p");
    const themeParam = searchParams.get("theme") || "light";
    const { origin } = new URL(request.url);
    const logoUrl = `${origin}/fifa-2026-logo.svg`;

    const isDark = themeParam === "dark";

    // 1. Fallback if no prediction query code parameter is provided
    if (!p) {
      return renderFallbackImage(isDark);
    }

    const prediction = decodePredictionStateLocal(p);
    if (!prediction) {
      return renderFallbackImage(isDark);
    }

    const { groupRankings, thirdPlaces, knockoutPicks: picks } = prediction;

    // Theme Color Tokens
    const bgStyle = isDark
      ? {
          backgroundColor: "#020617",
          backgroundImage: "radial-gradient(circle at center, #0b1329 0%, #020617 100%)",
        }
      : {
          backgroundColor: "#ffffff",
          backgroundImage: "radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%)",
        };

    const textMainColor = isDark ? "#f8fafc" : "#0f172a";
    const textMutedColor = isDark ? "#cbd5e1" : "#475569";
    const borderHeaderColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)";
    const borderMatchColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.06)";
    const borderMatchInnerColor = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.04)";
    const bgMatchColor = isDark ? "rgba(2, 6, 23, 0.4)" : "rgba(15, 23, 42, 0.04)";
    const textMatchColor = isDark ? "#cbd5e1" : "#334155";
    const borderConnectorColor = isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.12)";
    const bgFinalColor = isDark ? "rgba(2, 6, 23, 0.6)" : "rgba(255, 255, 255, 0.8)";
    const borderFinalColor = isDark ? "rgba(251, 191, 36, 0.3)" : "rgba(217, 119, 6, 0.3)";
    const bgFinalWinnerColor = isDark ? "rgba(251, 191, 36, 0.15)" : "rgba(217, 119, 6, 0.1)";
    const textFinalWinnerColor = isDark ? "#fbbf24" : "#b45309";
    const goldHighlightColor = isDark ? "#fbbf24" : "#d97706";
    const goldDarkColor = isDark ? "#fbbf24" : "#b45309";
    const winnerBgColor = isDark ? "#1e40af" : "#2563eb";
    const flagPlaceholderColor = isDark ? "#334155" : "#cbd5e1";

    // Helper to get team details
    const getTeam = (teamId: string | null) => {
      if (!teamId) return { name: "TBD", flagUrl: "" };
      return TEAM_MAP[teamId] || { name: teamId, flagUrl: "" };
    };

    const getHighResFlag = (flagUrl: string | null) => {
      if (!flagUrl) return "";
      return flagUrl.replace("/w40/", "/w160/");
    };

    // Reconstruct all match slots (73 to 104) from decoded bracket state
    interface PredictedMatch {
      homeId: string | null;
      awayId: string | null;
      winnerId: string | null;
    }
    const matches: Record<number, PredictedMatch> = {};

    // A. Resolve R32 Matches
    const thirdPlaceAssignments = allocateThirdPlaces(thirdPlaces);
    const r32Config: Record<number, [string, number, string, number | null]> = {
      73: ["A", 1, "B", 1],
      74: ["E", 0, "thirdPlace", 74],
      75: ["F", 0, "C", 1],
      76: ["C", 0, "F", 1],
      77: ["I", 0, "thirdPlace", 77],
      78: ["E", 1, "I", 1],
      79: ["A", 0, "thirdPlace", 79],
      80: ["L", 0, "thirdPlace", 80],
      81: ["D", 0, "thirdPlace", 81],
      82: ["G", 0, "thirdPlace", 82],
      83: ["K", 1, "L", 1],
      84: ["H", 0, "J", 1],
      85: ["B", 0, "thirdPlace", 85],
      86: ["J", 0, "H", 1],
      87: ["K", 0, "thirdPlace", 87],
      88: ["D", 1, "G", 1],
    };

    for (let m = 73; m <= 88; m++) {
      const cfg = r32Config[m];
      let homeId: string | null = null;
      let awayId: string | null = null;

      if (cfg) {
        const [hGroup, hRank, aGroup, aRank] = cfg;
        homeId = groupRankings[hGroup]?.[hRank] || null;
        if (aGroup === "thirdPlace") {
          const assignedGroup = thirdPlaceAssignments[aRank!];
          awayId = groupRankings[assignedGroup]?.[2] || null;
        } else {
          awayId = groupRankings[aGroup]?.[aRank!] || null;
        }
      }

      matches[m] = {
        homeId,
        awayId,
        winnerId: picks[m] || picks[String(m)] || null,
      };
    }

    const MATCH_SOURCES: Record<number, { home: number; away: number }> = {
      89: { home: 74, away: 77 },
      90: { home: 73, away: 75 },
      91: { home: 76, away: 78 },
      92: { home: 79, away: 80 },
      93: { home: 83, away: 84 },
      94: { home: 81, away: 82 },
      95: { home: 86, away: 88 },
      96: { home: 85, away: 87 },
      97: { home: 89, away: 90 },
      98: { home: 93, away: 94 },
      99: { home: 91, away: 92 },
      100: { home: 95, away: 96 },
      101: { home: 97, away: 98 },
      102: { home: 99, away: 100 },
    };

    // B. Resolve downstream matches (89 to 102)
    for (let m = 89; m <= 102; m++) {
      const src = MATCH_SOURCES[m];
      matches[m] = {
        homeId: matches[src.home]?.winnerId || null,
        awayId: matches[src.away]?.winnerId || null,
        winnerId: picks[m] || picks[String(m)] || null,
      };
    }

    // E. Resolve Final Match (104)
    matches[104] = {
      homeId: matches[101]?.winnerId || null,
      awayId: matches[102]?.winnerId || null,
      winnerId: picks[104] || picks["104"] || null,
    };

    const finalMatch = matches[104];
    const fHome = getTeam(finalMatch?.homeId);
    const fAway = getTeam(finalMatch?.awayId);
    const fWinnerId = finalMatch?.winnerId;

    const championId = finalMatch?.winnerId;
    const champion = getTeam(championId);

    // Helpers to render match boxes in symmetrical rounds (theme sensitive)
    const renderMatchBox = (matchNumber: number) => {
      const match = matches[matchNumber];
      const home = getTeam(match?.homeId);
      const away = getTeam(match?.awayId);
      const wId = match?.winnerId;

      const isHomeWinner = wId && wId === match?.homeId;
      const isAwayWinner = wId && wId === match?.awayId;

      return (
        <div
          key={matchNumber}
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            borderRadius: "4px",
            overflow: "hidden",
            backgroundColor: bgMatchColor,
            border: `1px solid ${borderMatchColor}`,
          }}
        >
          {/* Home team row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "22px",
              paddingLeft: "5px",
              paddingRight: "5px",
              backgroundColor: isHomeWinner ? winnerBgColor : "transparent",
              borderBottom: `1px solid ${borderMatchInnerColor}`,
            }}
          >
            {home?.flagUrl ? (
              <img
                src={home.flagUrl}
                style={{ width: "15px", height: "10px", marginRight: "5px", borderRadius: "1px" }}
              />
            ) : (
              <div style={{ width: "15px", height: "10px", backgroundColor: flagPlaceholderColor, marginRight: "5px", borderRadius: "1px" }} />
            )}
            <span
              style={{
                fontSize: "10px",
                fontWeight: isHomeWinner ? "bold" : "normal",
                color: isHomeWinner ? "#ffffff" : textMatchColor,
              }}
            >
              {match?.homeId || "TBD"}
            </span>
          </div>

          {/* Away team row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "22px",
              paddingLeft: "5px",
              paddingRight: "5px",
              backgroundColor: isAwayWinner ? winnerBgColor : "transparent",
            }}
          >
            {away?.flagUrl ? (
              <img
                src={away.flagUrl}
                style={{ width: "15px", height: "10px", marginRight: "5px", borderRadius: "1px" }}
              />
            ) : (
              <div style={{ width: "15px", height: "10px", backgroundColor: flagPlaceholderColor, marginRight: "5px", borderRadius: "1px" }} />
            )}
            <span
              style={{
                fontSize: "10px",
                fontWeight: isAwayWinner ? "bold" : "normal",
                color: isAwayWinner ? "#ffffff" : textMatchColor,
              }}
            >
              {match?.awayId || "TBD"}
            </span>
          </div>
        </div>
      );
    };

    const renderColumn = (label: string, width: number, matchNumbers: number[]) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: `${width}px`,
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "20px",
            borderBottom: `1px solid ${borderHeaderColor}`,
            marginBottom: "8px",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: "8px",
              fontWeight: "bold",
              color: textMutedColor,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "460px",
            justifyContent: "space-around",
          }}
        >
          {matchNumbers.map(renderMatchBox)}
        </div>
      </div>
    );

    // Connector components
    const LeftConnectorColumn = ({ count, height }: { count: number; height: number }) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          height: "460px",
          width: "6px",
          paddingTop: "20px",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              height: `${height}px`,
              width: "6px",
              borderTop: `1px solid ${borderConnectorColor}`,
              borderBottom: `1px solid ${borderConnectorColor}`,
              borderRight: `1px solid ${borderConnectorColor}`,
            }}
          />
        ))}
      </div>
    );

    const RightConnectorColumn = ({ count, height }: { count: number; height: number }) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          height: "460px",
          width: "6px",
          paddingTop: "20px",
        }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              height: `${height}px`,
              width: "6px",
              borderTop: `1px solid ${borderConnectorColor}`,
              borderBottom: `1px solid ${borderConnectorColor}`,
              borderLeft: `1px solid ${borderConnectorColor}`,
            }}
          />
        ))}
      </div>
    );

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            ...bgStyle,
            paddingTop: "24px",
            paddingBottom: "24px",
            paddingLeft: "29px",
            paddingRight: "29px",
            justifyContent: "flex-start",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "70px",
              borderBottom: `1px solid ${borderHeaderColor}`,
              paddingBottom: "10px",
              marginBottom: "15px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left Info: flex 1 to hold left third of the width */}
            <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <img
                src={logoUrl}
                style={{
                  width: "35px",
                  height: "50px",
                  objectFit: "contain",
                  marginRight: "12px",
                  filter: isDark ? "invert(1) brightness(1.5)" : "none",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: "900", color: textMainColor, letterSpacing: "0.05em" }}>
                  FIFA WORLD CUP 2026™
                </span>
                <span style={{ fontSize: "11px", fontWeight: "bold", color: goldHighlightColor, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Bracket Predictor
                </span>
              </div>
            </div>

            {/* Center Predicted Champion: flex 1 to align perfectly in the middle */}
            <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
              {championId && champion ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ fontSize: "9px", fontWeight: "bold", color: textMutedColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    🏆 Predicted Champion
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: "900", color: goldHighlightColor, textTransform: "uppercase" }}>
                    {champion.name}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Right Branding: flex 1, items right-aligned to hold right third of the width */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1 }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: textMainColor }}>
                USA · Canada · Mexico
              </span>
              <span style={{ fontSize: "9px", color: textMutedColor, marginTop: "2px" }}>
                fifawc2026.me/bracket/predict
              </span>
            </div>
          </div>

          {/* Symmetrical Bracket Skeletons */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "490px",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Left Symmetrical columns */}
            {renderColumn("Round of 32", 130, [73, 74, 75, 76, 77, 78, 79, 80])}
            <LeftConnectorColumn count={4} height={62} />
            {renderColumn("Round of 16", 120, [89, 90, 91, 92])}
            <LeftConnectorColumn count={2} height={125} />
            {renderColumn("Quarter-finals", 110, [97, 98])}
            <LeftConnectorColumn count={1} height={250} />
            {renderColumn("Semi-finals", 105, [101])}

            {/* CENTER COLUMN: Final Match & Champion */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "170px",
                height: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "20px",
                  borderBottom: `1px solid ${borderHeaderColor}`,
                  marginBottom: "8px",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    color: goldHighlightColor,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Grand Final
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "460px",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "10px", fontWeight: "900", color: goldHighlightColor, letterSpacing: "0.1em" }}>FINAL</span>
                <span style={{ fontSize: "8px", color: textMutedColor, marginTop: "2px" }}>MetLife Stadium</span>
                <span style={{ fontSize: "8px", color: textMutedColor }}>July 19, 2026</span>

                {/* Final match card */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    borderRadius: "6px",
                    border: `1px solid ${borderFinalColor}`,
                    overflow: "hidden",
                    backgroundColor: bgFinalColor,
                    marginBottom: "12px",
                    marginTop: "12px",
                    boxShadow: isDark ? "none" : "0 2px 6px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  {/* Home Finalist */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "28px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      backgroundColor: fWinnerId && fWinnerId === finalMatch?.homeId ? bgFinalWinnerColor : "transparent",
                      borderBottom: `1px solid ${borderFinalColor}`,
                    }}
                  >
                    {fHome?.flagUrl ? (
                      <img src={fHome.flagUrl} style={{ width: "20px", height: "13px", marginRight: "8px", borderRadius: "1.5px" }} />
                    ) : (
                      <div style={{ width: "20px", height: "13px", backgroundColor: flagPlaceholderColor, marginRight: "8px", borderRadius: "1.5px" }} />
                    )}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: fWinnerId && fWinnerId === finalMatch?.homeId ? "bold" : "normal",
                        color: fWinnerId && fWinnerId === finalMatch?.homeId ? textFinalWinnerColor : textMatchColor,
                      }}
                    >
                      {finalMatch?.homeId || "TBD"}
                    </span>
                  </div>

                  {/* Away Finalist */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "28px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      backgroundColor: fWinnerId && fWinnerId === finalMatch?.awayId ? bgFinalWinnerColor : "transparent",
                    }}
                  >
                    {fAway?.flagUrl ? (
                      <img src={fAway.flagUrl} style={{ width: "20px", height: "13px", marginRight: "8px", borderRadius: "1.5px" }} />
                    ) : (
                      <div style={{ width: "20px", height: "13px", backgroundColor: flagPlaceholderColor, marginRight: "8px", borderRadius: "1.5px" }} />
                    )}
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: fWinnerId && fWinnerId === finalMatch?.awayId ? "bold" : "normal",
                        color: fWinnerId && fWinnerId === finalMatch?.awayId ? textFinalWinnerColor : textMatchColor,
                      }}
                    >
                      {finalMatch?.awayId || "TBD"}
                    </span>
                  </div>
                </div>

                {/* Champion Trophy */}
                {championId && champion ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginTop: "10px",
                    }}
                  >
                    <span style={{ fontSize: "28px", marginBottom: "4px" }}>🏆</span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "900",
                        color: goldDarkColor,
                        textAlign: "center",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {champion.name}
                    </span>
                    {champion.flagUrl && (
                      <img
                        src={getHighResFlag(champion.flagUrl)}
                        style={{
                          width: "70px",
                          height: "45px",
                          objectFit: "cover",
                          borderRadius: "4px",
                          marginTop: "8px",
                          border: `1px solid ${borderFinalColor}`,
                          boxShadow: isDark ? "0 4px 10px rgba(0,0,0,0.4)" : "0 3px 8px rgba(15,23,42,0.15)",
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginTop: "10px",
                      opacity: 0.4,
                    }}
                  >
                    <span style={{ fontSize: "28px", marginBottom: "4px" }}>🏆</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        color: textMutedColor,
                        textAlign: "center",
                      }}
                    >
                      CHAMPION TBD
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Symmetrical columns */}
            {renderColumn("Semi-finals", 105, [102])}
            <RightConnectorColumn count={1} height={250} />
            {renderColumn("Quarter-finals", 110, [99, 100])}
            <RightConnectorColumn count={2} height={125} />
            {renderColumn("Round of 16", 120, [93, 94, 95, 96])}
            <RightConnectorColumn count={4} height={62} />
            {renderColumn("Round of 32", 130, [81, 82, 83, 84, 85, 86, 87, 88])}
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

// Fallback image template returned when params are missing or incorrect
function renderFallbackImage(isDark: boolean) {
  const bgStyle = isDark
    ? {
        backgroundColor: "#020617",
        backgroundImage: "radial-gradient(circle at center, #0b1329 0%, #020617 100%)",
      }
    : {
        backgroundColor: "#ffffff",
        backgroundImage: "radial-gradient(circle at center, #ffffff 0%, #f1f5f9 100%)",
      };

  const borderGold = isDark ? "#fbbf24" : "#d97706";
  const textTitle = isDark ? "#ffffff" : "#0f172a";
  const textSub = isDark ? "#fbbf24" : "#d97706";
  const textInfo = isDark ? "#94a3b8" : "#475569";

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
          ...bgStyle,
          fontFamily: "sans-serif",
          color: textTitle,
          padding: "40px",
          border: `8px solid ${borderGold}`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: "800px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "40px",
              fontWeight: "900",
              color: textSub,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "10px",
            }}
          >
            World Cup 2026™
          </h1>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: textTitle,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "20px",
            }}
          >
            Bracket Predictor
          </h2>
          <span style={{ fontSize: "14px", color: textInfo }}>
            Crown your champion. Make predictions and share your bracket!
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
