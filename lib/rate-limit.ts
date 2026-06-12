import { NextRequest } from "next/server";

interface RateLimitWindow {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitWindow>();

// Periodically clean up expired keys to prevent memory leaks (every minute)
if (typeof setInterval !== "undefined") {
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, window] of rateLimitStore.entries()) {
      // Keep only timestamps within the last 1 minute
      const validTimestamps = window.timestamps.filter((t) => now - t < 60_000);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(key);
      } else {
        window.timestamps = validTimestamps;
      }
    }
  }, 60_000);

  // Prevent blocking process termination during local runs/tests
  if (interval && typeof interval.unref === "function") {
    interval.unref();
  }
}

/**
 * Extracts client IP from headers or NextRequest object.
 */
export function getClientIp(req: Request | NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if ("ip" in req && typeof (req as any).ip === "string") {
    return (req as any).ip;
  }

  return "127.0.0.1";
}

/**
 * Validates request rate limiting for a client ID.
 * 
 * @param identifier Unique identifier for the client (e.g., IP address)
 * @param limit Max requests allowed in the window duration
 * @param windowMs Window duration in milliseconds (default: 60,000 / 1 minute)
 */
export function rateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60_000
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  let window = rateLimitStore.get(identifier);

  if (!window) {
    window = { timestamps: [] };
    rateLimitStore.set(identifier, window);
  }

  // Filter out timestamps older than the window
  window.timestamps = window.timestamps.filter((t) => now - t < windowMs);

  if (window.timestamps.length >= limit) {
    const oldest = window.timestamps[0];
    return {
      success: false,
      limit,
      remaining: 0,
      reset: oldest + windowMs,
    };
  }

  window.timestamps.push(now);
  return {
    success: true,
    limit,
    remaining: limit - window.timestamps.length,
    reset: now + windowMs,
  };
}
