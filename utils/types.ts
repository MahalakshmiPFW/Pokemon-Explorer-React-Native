/**
 * Type definitions for Pokémon data structures
 * These interfaces ensure type safety throughout the app
 */

// Represents a complete Pokémon with all necessary data
export interface Pokemon {
  name: string;
  id: number;
  image: string;
  imageBack: string;
  baseExperience: number;
  types: PokemonType[];
}

// Type information from the API
export interface PokemonType {
  type: {
    name: string;
    url: string;
  };
}

// Simplified Pokémon data from the list endpoint
export interface PokemonListItem {
  name: string;
  url: string;
}

// Detailed Pokémon information for the detail screen
export interface PokemonDetails {
  id: number;
  name: string;
  artwork: string;
  forms: string[];
  types: string[];
  height: number;
  weight: number;
  description?: string;
  stats: { name: string; value: number }[];
}

// Filter mode options
export type FilterMode = "name" | "type" | "power";

