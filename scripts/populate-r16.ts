/**
 * Script: populate-r16.ts
 *
 * One-shot script to populate R16 (and cascade to later rounds) from
 * the current R32 finished results.  Run whenever you need to
 * "catch up" the bracket after R32 results are in the DB.
 */
import { prisma } from "../lib/db";
import { autoResolveNextRound } from "../lib/knockout-resolver";

async function main() {
  console.log("🏆 Propagating knockout winners through all bracket rounds...\n");
  await autoResolveNextRound();
  console.log("\n✅ Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
