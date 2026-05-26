import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const BASE = process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY || "";
const COMP = process.env.FOOTBALL_DATA_COMPETITION_ID || "2000";

async function main() {
  console.log("Fetching raw competition metadata for:", COMP);
  if (!KEY) {
    console.error("No API key configured!");
    return;
  }

  const headers = { "X-Auth-Token": KEY };

  try {
    const compRes = await fetch(`${BASE}/competitions/${COMP}`, { headers });
    const compData = await compRes.json();
    console.log("\n--- Competition Metadata ---");
    console.log(JSON.stringify(compData, null, 2));

    console.log("\nFetching raw matches for:", COMP);
    const matchesRes = await fetch(`${BASE}/competitions/${COMP}/matches?limit=2`, { headers });
    const matchesData = await matchesRes.json();
    console.log("\n--- Matches Sample Response ---");
    console.log(JSON.stringify(matchesData, null, 2));
    
  } catch (error) {
    console.error("Error fetching raw data:", error);
  }
}

main();
