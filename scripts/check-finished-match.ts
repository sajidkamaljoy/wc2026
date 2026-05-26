import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const BASE = process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY || "";

async function main() {
  if (!KEY) {
    console.error("No API key configured!");
    return;
  }

  const headers = { "X-Auth-Token": KEY };

  try {
    console.log("Fetching a finished match from Premier League (2021) to check score structure...");
    const res = await fetch(`${BASE}/competitions/PL/matches?status=FINISHED&limit=1`, { headers });
    const data = await res.json();
    
    if (data.matches && data.matches.length > 0) {
      const match = data.matches[0];
      console.log("\n--- Sample Finished Match ---");
      console.log(JSON.stringify(match, null, 2));

      // Test mapping logic
      console.log("\n--- Tested Mapping Output ---");
      console.log({
        matchId: match.id.toString(),
        homeScore: match.score?.fullTime?.home ?? null,
        awayScore: match.score?.fullTime?.away ?? null,
        status: match.status, // Raw status
        minute: match.minute ?? null
      });
    } else {
      console.log("No finished matches returned for Premier League. Let's check CL (Champions League)...");
      const resCL = await fetch(`${BASE}/competitions/CL/matches?status=FINISHED&limit=1`, { headers });
      const dataCL = await resCL.json();
      if (dataCL.matches && dataCL.matches.length > 0) {
        console.log(JSON.stringify(dataCL.matches[0], null, 2));
      } else {
        console.log("No matches found in standard leagues either.");
      }
    }
  } catch (error) {
    console.error("Error fetching match:", error);
  }
}

main();
