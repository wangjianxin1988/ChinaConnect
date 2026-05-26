/**
 * useFavorites Hook
 * Manages restaurant favorites with localStorage persistence
 */

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "chinaconnect-favorites";

export interface FavoriteRestaurant {
  id: string;
  name: string;
  nameEn?: string;
  cuisine: string;
  avgPrice: number;
  rating: number;
  address: string;
  city: string;
  cityZh: string;
  type: "michelin" | "blackpearl" | "local";
  imageUrl?: string;
  addedAt: string;
}

export interface UseFavoritesReturn {
  favorites: FavoriteRestaurant[];
  isFavorited: (id: string) => boolean;
  addFavorite: (restaurant: Omit<FavoriteRestaurant, "addedAt">) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (restaurant: Omit<FavoriteRestaurant, "addedAt">) => void;
  clearFavorites: () => void;
  favoriteCount: number;
}

function loadFavorites(): FavoriteRestaurant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: FavoriteRestaurant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  const isFavorited = useCallback(
    (id: string): boolean => {
      return favorites.some((f) => f.id === id);
    },
    [favorites],
  );

  const addFavorite = useCallback(
    (restaurant: Omit<FavoriteRestaurant, "addedAt">): void => {
      setFavorites((prev) => {
        if (prev.some((f) => f.id === restaurant.id)) return prev;
        const updated = [
          ...prev,
          { ...restaurant, addedAt: new Date().toISOString() },
        ];
        saveFavorites(updated);
        return updated;
      });
    },
    [],
  );

  const removeFavorite = useCallback((id: string): void => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveFavorites(updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback(
    (restaurant: Omit<FavoriteRestaurant, "addedAt">): void => {
      if (isFavorited(restaurant.id)) {
        removeFavorite(restaurant.id);
      } else {
        addFavorite(restaurant);
      }
    },
    [isFavorited, addFavorite, removeFavorite],
  );

  const clearFavorites = useCallback((): void => {
    setFavorites([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    favorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    favoriteCount: favorites.length,
  };
}