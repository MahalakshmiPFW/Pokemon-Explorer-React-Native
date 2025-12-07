import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colorsByType } from "../utils/constants";
import { addAlpha, formatPokemonId, isTablet, prettyName } from "../utils/helpers";
import { Pokemon } from "../utils/types";

interface PokemonCardProps {
  pokemon: Pokemon;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

/**
 * Reusable Pokémon card component
 * Displays Pokémon info in a clickable card with favorite button
 * Memoized to prevent unnecessary re-renders in FlatList
 */
function PokemonCardComponent({ pokemon, isFavorite, onToggleFavorite }: PokemonCardProps) {
  const mainType = pokemon.types[0]?.type.name || "normal";
  const cardColor = addAlpha(colorsByType[mainType] || "#A0AEC0", "33");
  const cardWidth = isTablet() ? "31%" : "48%";

  // Haptic feedback when toggling favorite
  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite(pokemon.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(pokemon.id * 50)}
      style={[styles.cardContainer, { width: cardWidth }]}
    >
      <View style={[styles.card, { backgroundColor: cardColor }]}>
        {/* Header with ID and favorite button */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>{formatPokemonId(pokemon.id)}</Text>
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.favoriteButton}
            accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
            accessibilityRole="button"
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#FF6B6B" : "#8BA0AE"}
            />
          </TouchableOpacity>
        </View>

        {/* Clickable content area */}
        <Link
          href={{
            pathname: "/pok_details",
            params: { name: pokemon.name, type: mainType },
          }}
          style={styles.cardContent}
          accessibilityLabel={`View details for ${prettyName(pokemon.name)}`}
        >
          {/* Pokémon name */}
          <Text style={styles.cardName}>{prettyName(pokemon.name)}</Text>

          {/* Pokémon image */}
          <Image
            source={{ uri: pokemon.image }}
            style={styles.cardImage}
            contentFit="contain"
            transition={200}
            placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
          />
        </Link>

        {/* Type badge container - below image */}
        <View style={styles.typeBadgeContainer}>
          {pokemon.types.map((typeObj, index) => {
            const typeName = typeObj.type.name;
            const typeColor = colorsByType[typeName] || "#A0AEC0";
            return (
              <View
                key={`${typeName}-${index}`}
                style={[styles.typeBadge, { backgroundColor: typeColor }]}
              >
                <Text style={styles.typeText}>{typeName.toUpperCase()}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 18,
    padding: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardContent: {
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardId: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5f7381",
    letterSpacing: 0.5,
  },
  favoriteButton: {
    padding: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F3E46",
  },
  cardImage: {
    width: "100%",
    height: 110,
  },
  typeBadgeContainer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

// Memoize component to prevent unnecessary re-renders
// Only re-renders when pokemon data or favorite status changes
export const PokemonCard = memo(PokemonCardComponent, (prevProps, nextProps) => {
  // Compare essential props that affect rendering
  return (
    prevProps.pokemon.id === nextProps.pokemon.id &&
    prevProps.pokemon.name === nextProps.pokemon.name &&
    prevProps.pokemon.image === nextProps.pokemon.image &&
    prevProps.isFavorite === nextProps.isFavorite
  );
});

