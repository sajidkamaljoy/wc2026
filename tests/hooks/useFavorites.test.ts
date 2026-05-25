import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "@/hooks/useFavorites";

describe("useFavorites hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with an empty favorites array if localStorage is empty", () => {
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it("should load existing favorites from localStorage on initialization", () => {
    localStorage.setItem("wc2026_favorites", JSON.stringify(["USA", "ARG"]));

    const { result } = renderHook(() => useFavorites());

    // Initial state is empty on immediate sync, then loads in useEffect
    expect(result.current.favorites).toEqual(["USA", "ARG"]);
    expect(result.current.isFavorite("USA")).toBe(true);
    expect(result.current.isFavorite("FRA")).toBe(false);
  });

  it("should add a team to favorites when toggled and save to localStorage", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("BRA");
    });

    expect(result.current.favorites).toEqual(["BRA"]);
    expect(result.current.isFavorite("BRA")).toBe(true);
    expect(JSON.parse(localStorage.getItem("wc2026_favorites") || "[]")).toEqual(["BRA"]);
  });

  it("should remove a team from favorites when toggling an already favorited team", () => {
    localStorage.setItem("wc2026_favorites", JSON.stringify(["USA", "ARG"]));
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("USA");
    });

    expect(result.current.favorites).toEqual(["ARG"]);
    expect(result.current.isFavorite("USA")).toBe(false);
    expect(result.current.isFavorite("ARG")).toBe(true);
    expect(JSON.parse(localStorage.getItem("wc2026_favorites") || "[]")).toEqual(["ARG"]);
  });
});
