import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../utils/constants";

/**
 * Custom hook to manage favorite Pokémon
 * Persists favorites to device storage so they survive app restarts
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load favorites from storage when app starts
  useEffect(() => {
    loadFavorites();
  }, []);

  // Load saved favorites from device storage
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (stored) {
        const favoriteIds = JSON.parse(stored) as number[];
        setFavorites(new Set(favoriteIds));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status (add if not favorited, remove if favorited)
  const toggleFavorite = useCallback(async (pokemonId: number) => {
    try {
      const newFavorites = new Set(favorites);
      
      if (newFavorites.has(pokemonId)) {
        newFavorites.delete(pokemonId);
      } else {
        newFavorites.add(pokemonId);
      }

      setFavorites(newFavorites);
      
      // Save to device storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITES,
        JSON.stringify(Array.from(newFavorites))
      );
    } catch (error) {
      console.error("Error saving favorite:", error);
    }
  }, [favorites]);

  // Check if a Pokémon is favorited
  const isFavorite = useCallback((pokemonId: number): boolean => {
    return favorites.has(pokemonId);
  }, [favorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    loading,
  };
}

