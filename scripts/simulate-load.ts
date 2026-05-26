async function simulateLoad() {
  const URL = "https://fifawc2026.me/api/fixtures";
  const CONCURRENT_USERS = 100;
  
  console.log("--------------------------------------------------");
  console.log(`Starting Load Simulation: ${CONCURRENT_USERS} concurrent requests`);
  console.log(`Target URL: ${URL}`);
  console.log("--------------------------------------------------");
  
  const startTime = Date.now();
  
  // Create 100 concurrent fetch promises
  const promises = Array.from({ length: CONCURRENT_USERS }).map(async (_, index) => {
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
      
      return {
        index,
        success: res.ok,
        status: res.status,
        duration: reqDuration,
        vercelCache,
        cacheControl,
        age
      };
    } catch (err: any) {
      const reqDuration = Date.now() - reqStart;
      return {
        index,
        success: false,
        status: 0,
        duration: reqDuration,
        vercelCache: "N/A",
        cacheControl: "N/A",
        age: "N/A",
        error: err.message
      };
    }
  });

  const results = await Promise.all(promises);
  const totalDuration = Date.now() - startTime;

  // Calculate statistics
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const durations = results.map(r => r.duration);
  
  const avgDuration = durations.reduce((a, b) => a + b, 0) / CONCURRENT_USERS;
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  // Group by cache status
  const cacheStats: Record<string, number> = {};
  results.forEach(r => {
    cacheStats[r.vercelCache] = (cacheStats[r.vercelCache] || 0) + 1;
  });

  console.log("\n--- Simulation Summary ---");
  console.log(`Total Elapsed Time: ${totalDuration}ms`);
  console.log(`Successful Requests: ${successful.length} / ${CONCURRENT_USERS}`);
  console.log(`Failed Requests: ${failed.length} / ${CONCURRENT_USERS}`);
  console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
  console.log(`Min Response Time: ${minDuration}ms`);
  console.log(`Max Response Time: ${maxDuration}ms`);
  
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
