/**
 * Format a UTC ISO string into the user's local date + time.
 * Runs in the browser only (uses Intl).
 */
export function formatKickoff(utcIso: string): {
  date: string;
  time: string;
  dateTime: string;
  tzAbbr: string;
} {
  const date = new Date(utcIso);
  const userTZ = typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";

  const dateStr = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: userTZ,
  }).format(date);

  const timeStr = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: userTZ,
  }).format(date);

  // Get timezone abbreviation or offset
  const tzStr = new Intl.DateTimeFormat("en-US", {
    timeZoneName: "short",
    timeZone: userTZ,
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value ?? "";

  return {
    date: dateStr,
    time: timeStr,
    dateTime: `${dateStr} · ${timeStr}`,
    tzAbbr: tzStr,
  };
}

/**
 * Get a date-only label for grouping fixtures (in user's timezone).
 * e.g. "Thursday, 11 June 2026"
 */
export function getLocalDateLabel(utcIso: string): string {
  const userTZ = typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: userTZ,
  }).format(new Date(utcIso));
}

/**
 * Check whether a UTC ISO string falls on "today" in user's timezone.
 */
export function isToday(utcIso: string): boolean {
  const userTZ = typeof window !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";
  const now = new Date();
  const match = new Date(utcIso);

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { // en-CA gives YYYY-MM-DD
      year: "numeric", month: "2-digit", day: "2-digit",
      timeZone: userTZ,
    }).format(d);

  return fmt(now) === fmt(match);
}
