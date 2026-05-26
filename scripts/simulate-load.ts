async function simulateLoad() {
  const URL = "https://fifawc2026.me/api/fixtures";
  const TOTAL_REQUESTS = 10000;
  const CONCURRENCY_LIMIT = 200; // Safe limit of active sockets to avoid local OS exhaustion

  console.log("--------------------------------------------------");
  console.log(`Starting Load Simulation: ${TOTAL_REQUESTS} total requests`);
  console.log(`Concurrency Limit (Active Sockets): ${CONCURRENCY_LIMIT}`);
  console.log(`Target URL: ${URL}`);
  console.log("--------------------------------------------------");

  const startTime = Date.now();
  const results: any[] = [];
  let nextIndex = 0;

  // Progress tracking helper
  let lastLoggedProgress = 0;

  async function worker() {
    while (true) {
      const currentIdx = nextIndex++;
      if (currentIdx >= TOTAL_REQUESTS) break;

      // Log progress every 10%
      const percent = Math.floor((currentIdx / TOTAL_REQUESTS) * 10);
      if (percent > lastLoggedProgress) {
        lastLoggedProgress = percent;
        console.log(`Progress: ~${percent * 10}% completed...`);
      }

      const reqStart = Date.now();
      try {
        const res = await fetch(URL, {
          headers: {
            "User-Agent": "WC2026-Load-Simulator/1.0",
          }
        });
        const reqDuration = Date.now() - reqStart;

        // Read some key headers for cache verification
        const vercelCache = res.headers.get("x-vercel-cache") || "N/A";
        const cacheControl = res.headers.get("cache-control") || "N/A";
        const age = res.headers.get("age") || "N/A";

        // Read body to fully consume response stream
        await res.json();

        results.push({
          index: currentIdx,
          success: res.ok,
          status: res.status,
          duration: reqDuration,
          vercelCache,
          cacheControl,
          age
        });
      } catch (err: any) {
        const reqDuration = Date.now() - reqStart;
        results.push({
          index: currentIdx,
          success: false,
          status: 0,
          duration: reqDuration,
          vercelCache: "N/A",
          cacheControl: "N/A",
          age: "N/A",
          error: err.message
        });
      }
    }
  }

  // Launch workers
  const workers = Array.from({ length: CONCURRENCY_LIMIT }).map(() => worker());
  await Promise.all(workers);

  const totalDuration = Date.now() - startTime;

  // Calculate statistics
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const durations = results.map(r => r.duration);

  const avgDuration = durations.reduce((a, b) => a + b, 0) / TOTAL_REQUESTS;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  // Group by cache status
  const cacheStats: Record<string, number> = {};
  results.forEach(r => {
    cacheStats[r.vercelCache] = (cacheStats[r.vercelCache] || 0) + 1;
  });

  console.log("\n--- Simulation Summary ---");
  console.log(`Total Elapsed Time: ${totalDuration}ms`);
  console.log(`Successful Requests: ${successful.length} / ${TOTAL_REQUESTS}`);
  console.log(`Failed Requests: ${failed.length} / ${TOTAL_REQUESTS}`);
  console.log(`Average Latency: ${avgDuration.toFixed(2)}ms`);
  console.log(`Min Latency: ${minDuration}ms`);
  console.log(`Max Latency: ${maxDuration}ms`);

  console.log("\n--- Edge Cache Status (x-vercel-cache) ---");
  Object.entries(cacheStats).forEach(([status, count]) => {
    console.log(`- ${status}: ${count} requests`);
  });

  if (successful.length > 0) {
    console.log("\n--- Response Headers Sample (Request #1) ---");
    const sample = successful[0];
    console.log(`- Cache-Control: ${sample.cacheControl}`);
    console.log(`- Age (seconds): ${sample.age}`);
  }

  if (failed.length > 0) {
    console.log("\n--- Failure Samples ---");
    failed.slice(0, 3).forEach(f => {
      console.log(`- Request #${f.index}: Status ${f.status} (Error: ${f.error || "None"})`);
    });
  }
  console.log("--------------------------------------------------");
}

simulateLoad();
