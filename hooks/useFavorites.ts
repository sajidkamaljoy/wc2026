"use client";

import { useState, useEffect, useCallback } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("wc2026_favorites");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  const isFavorite = useCallback(
    (teamId: string) => {
      return favorites.includes(teamId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((teamId: string) => {
    setFavorites((prev) => {
      let next;
      if (prev.includes(teamId)) {
        next = prev.filter((id) => id !== teamId);
      } else {
        next = [...prev, teamId];
      }
      try {
        localStorage.setItem("wc2026_favorites", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save favorites to localStorage:", e);
      }
      return next;
    });
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    isLoaded,
  };
}
