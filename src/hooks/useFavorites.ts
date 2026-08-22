/**
 * useFavorites Hook
 * Manages restaurant favorites with localStorage persistence
 */

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/supabase/config";

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

async function getUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id ?? null;
  } catch {
    return null;
  }
}

function toDbMetadata(r: Omit<FavoriteRestaurant, "addedAt">): Record<string, unknown> {
  return {
    title: r.name,
    titleEn: r.nameEn ?? null,
    cuisine: r.cuisine,
    avgPrice: r.avgPrice,
    rating: r.rating,
    address: r.address,
    city: r.city,
    cityZh: r.cityZh,
    type: r.type,
    imageUrl: r.imageUrl ?? null,
  };
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);

  // Load from localStorage on mount, then merge with Supabase bookmarks
  // for signed-in users (DB is authoritative for the personal center).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setFavorites(loadFavorites());
      const uid = await getUserId();
      if (!uid || cancelled) return;
      try {
        const { data } = await supabase
          .from("bookmarks")
          .select("reference_id, created_at, metadata")
          .eq("user_id", uid)
          .eq("bookmark_type", "restaurant")
          .order("created_at", { ascending: false });
        if (!data || cancelled) return;
        const dbFavorites: FavoriteRestaurant[] = data
          .filter((b) => b.reference_id && b.metadata && b.metadata.title)
          .map((b) => {
            const md = (b.metadata ?? {}) as Record<string, unknown>;
            return {
              id: b.reference_id,
              name: String(md.title ?? b.reference_id),
              nameEn: md.titleEn ? String(md.titleEn) : undefined,
              cuisine: String(md.cuisine ?? ""),
              avgPrice: Number(md.avgPrice ?? 0),
              rating: Number(md.rating ?? 0),
              address: String(md.address ?? ""),
              city: String(md.city ?? ""),
              cityZh: String(md.cityZh ?? ""),
              type: (md.type as FavoriteRestaurant["type"]) ?? "local",
              imageUrl: md.imageUrl ? String(md.imageUrl) : undefined,
              addedAt: b.created_at ?? new Date().toISOString(),
            };
          });
        if (cancelled) return;
        setFavorites((prev) => {
          const merged = [...prev];
          for (const f of dbFavorites) {
            if (!merged.some((m) => m.id === f.id)) merged.push(f);
          }
          return merged;
        });
      } catch {
        // DB unavailable — stay offline-first
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorited = useCallback(
    (id: string): boolean => {
      return favorites.some((f) => f.id === id);
    },
    [favorites],
  );

  const addFavorite = useCallback((restaurant: Omit<FavoriteRestaurant, "addedAt">): void => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === restaurant.id)) return prev;
      const updated = [...prev, { ...restaurant, addedAt: new Date().toISOString() }];
      saveFavorites(updated);
      return updated;
    });
    // Persist to Supabase bookmarks when signed in (async, best-effort)
    void (async () => {
      const uid = await getUserId();
      if (!uid) return;
      try {
        await supabase.from("bookmarks").upsert(
          {
            user_id: uid,
            bookmark_type: "restaurant",
            reference_id: restaurant.id,
            metadata: toDbMetadata(restaurant),
          },
          { onConflict: "user_id,bookmark_type,reference_id" },
        );
      } catch {
        // offline / DB error — keep local copy
      }
    })();
  }, []);

  const removeFavorite = useCallback((id: string): void => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveFavorites(updated);
      return updated;
    });
    // Remove from Supabase bookmarks when signed in
    void (async () => {
      const uid = await getUserId();
      if (!uid) return;
      try {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", uid)
          .eq("bookmark_type", "restaurant")
          .eq("reference_id", id);
      } catch {
        // ignore
      }
    })();
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
    void (async () => {
      const uid = await getUserId();
      if (!uid) return;
      try {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", uid)
          .eq("bookmark_type", "restaurant");
      } catch {
        // ignore
      }
    })();
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
