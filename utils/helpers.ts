import { Dimensions } from "react-native";

/**
 * Capitalizes the first letter of a Pokémon name
 * Example: "pikachu" -> "Pikachu"
 */
export const prettyName = (name: string): string => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Adds alpha transparency to a hex color
 * Used for creating tinted backgrounds
 */
export const addAlpha = (hex: string, alpha: string): string => {
  return hex.length === 7 ? `${hex}${alpha}` : hex;
};

/**
 * Formats Pokémon ID with leading zeros
 * Example: 1 -> "#001", 25 -> "#025"
 */
export const formatPokemonId = (id: number): string => {
  return `#${String(id).padStart(3, "0")}`;
};

/**
 * Checks if device is a tablet based on screen width
 * Useful for responsive layouts
 */
export const isTablet = (): boolean => {
  const { width } = Dimensions.get("window");
  return width >= 768;
};

/**
 * Scales font size based on screen width
 * Ensures text is readable on all devices
 */
export const scaleFont = (size: number): number => {
  const { width } = Dimensions.get("window");
  return width > 400 ? size * 1.1 : size;
};

/**
 * Debounce function to limit how often a function is called
 * Useful for search input to avoid excessive API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

