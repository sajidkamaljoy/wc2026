import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Countdown } from "@/components/fixtures/Countdown";

describe("Countdown component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Freeze the current system time to avoid drift
    vi.setSystemTime(new Date("2026-05-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render correct remaining time for a kickoff far in the future", () => {
    // 5 days and 3 hours in the future
    const futureKickoff = new Date("2026-05-30T15:00:00Z").toISOString();

    const { container } = render(<Countdown utcIso={futureKickoff} />);

    expect(screen.getByText(/5d 3h 0m 0s/i)).toBeInTheDocument();
    // Should not be close (<24h), so standard style class
    expect(container.firstChild).toHaveClass("text-slate-500");
    expect(container.firstChild).not.toHaveClass("text-amber-400");
  });

  it("should apply amber highlight and pulsing class when kickoff is less than 24 hours away", () => {
    // 2 hours in the future
    const closeKickoff = new Date("2026-05-25T14:00:00Z").toISOString();

    const { container } = render(<Countdown utcIso={closeKickoff} />);

    expect(screen.getByText(/2h 0m 0s/i)).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-amber-400");
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("should tick/update every second using fake timers", () => {
    const closeKickoff = new Date("2026-05-25T12:05:00Z").toISOString(); // 5 min out

    render(<Countdown utcIso={closeKickoff} />);
    expect(screen.getByText(/5m 0s/i)).toBeInTheDocument();

    // Advance clock by 30 seconds
    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(screen.getByText(/4m 30s/i)).toBeInTheDocument();
  });

  it("should render nothing (null) if kickoff has already occurred/started", () => {
    const pastKickoff = new Date("2026-05-25T11:00:00Z").toISOString(); // 1 hour ago

    const { container } = render(<Countdown utcIso={pastKickoff} />);

    expect(container.firstChild).toBeNull();
  });
});

// Helper imports from React for acts
import { act } from "react";
