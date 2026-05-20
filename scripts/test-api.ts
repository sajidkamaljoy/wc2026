import { getLiveScores } from "../lib/football-api";
import * as dotenv from "dotenv";
import * as path from "path";

// Explicitly load env variables from local configuration files
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  console.log("-------------------------------------------");
  console.log("API Key Verification Tool");
  console.log("-------------------------------------------");
  
  const key = process.env.FOOTBALL_DATA_API_KEY || "";
  console.log("API Key:", key ? `Configured (Prefix: ${key.slice(0, 4)}...)` : "Not Configured");
  console.log("Base URL:", process.env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4");
  console.log("Competition ID:", process.env.FOOTBALL_DATA_COMPETITION_ID || "2000");
  
  if (!key) {
    console.error("Error: FOOTBALL_DATA_API_KEY environment variable is missing.");
    process.exit(1);
  }

  console.log("\nAttempting live connection to football-data.org...");
  try {
    const scores = await getLiveScores();
    console.log("\n🎉 API Verification SUCCESS!");
    console.log(`Successfully received live/finished matches count: ${scores.length}`);
    if (scores.length > 0) {
      console.log("\nMatches sample:");
      console.log(JSON.stringify(scores.slice(0, 3), null, 2));
    } else {
      console.log("\nNo matches currently active/finished returned from external API (Standard for non-match days).");
    }
  } catch (error) {
    console.error("\n❌ API Verification FAILED!");
    console.error(error);
  }
  console.log("-------------------------------------------");
}

main();
