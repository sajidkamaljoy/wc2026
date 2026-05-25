import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatKickoff, getLocalDateLabel, isToday } from "@/lib/timezone";

describe("timezone utilities", () => {
  const mockUtcIso = "2026-06-11T20:00:00Z"; // FIFA 2026 Opening Match time

  describe("formatKickoff", () => {
    it("should format UTC ISO string correctly in UTC environment", () => {
      // By default inside jsdom, resolvedOptions().timeZone is often UTC or host timezone.
      // We will assert on generic properties to keep tests timezone-independent.
      const result = formatKickoff(mockUtcIso);

      expect(result).toHaveProperty("date");
      expect(result).toHaveProperty("time");
      expect(result).toHaveProperty("dateTime");
      expect(result).toHaveProperty("tzAbbr");

      expect(typeof result.date).toBe("string");
      expect(typeof result.time).toBe("string");
      expect(result.dateTime).toContain(result.date);
      expect(result.dateTime).toContain(result.time);
    });

    it("should resolve date and time properly", () => {
      const result = formatKickoff("2026-06-11T12:34:56Z");
      expect(result.time).toMatch(/^\d{2}:\d{2}$/); // e.g., "12:34" or localized version
    });
  });

  describe("getLocalDateLabel", () => {
    it("should return a formatted date label containing day, month, and year", () => {
      const label = getLocalDateLabel(mockUtcIso);
      expect(typeof label).toBe("string");
      expect(label).toContain("2026");
      expect(label).toContain("June");
    });
  });

  describe("isToday", () => {
    it("should return true when date matches today's date in local time", () => {
      const todayIso = new Date().toISOString();
      expect(isToday(todayIso)).toBe(true);
    });

    it("should return false for a date far in the past or future", () => {
      expect(isToday("2000-01-01T00:00:00Z")).toBe(false);
      expect(isToday("2099-12-31T23:59:59Z")).toBe(false);
    });
  });
});
