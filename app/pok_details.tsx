import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatBar } from "../components/StatBar";
import { useFavorites } from "../hooks/useFavorites";
import { colorsByType } from "../utils/constants";
import { addAlpha, prettyName } from "../utils/helpers";
import { PokemonDetails } from "../utils/types";

/**
 * Pokémon detail screen
 * Displays comprehensive information about a selected Pokémon
 */
export default function Pok_Details() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();

  // State management
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"forms" | "types" | "stats" | "weight">("forms");

  // Fetch Pokémon details from API
  useEffect(() => {
    if (params.name) {
      fetchPokemonDetails(params.name as string);
    }
  }, [params.name]);

  async function fetchPokemonDetails(name: string) {
    try {
      setError(null);
      setLoading(true);

      // Fetch Pokémon data
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error(`Details failed: ${res.status}`);
      const data = await res.json();

      // Fetch species data for description
      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();
      
      // Find English flavor text
      const englishFlavor = speciesData.flavor_text_entries.find(
        (entry: { language: { name: string } }) => entry.language.name === "en"
      )?.flavor_text;

      // Transform API data into our PokemonDetails format
      setDetails({
        id: data.id,
        name: data.name,
        artwork:
          data.sprites.other["official-artwork"]?.front_default ??
          data.sprites.front_default,
        forms: [
          data.sprites.front_default,
          data.sprites.front_shiny,
          data.sprites.back_default,
        ].filter(Boolean),
        types: data.types.map(
          (typeObj: { type: { name: string } }) => typeObj.type.name
        ),
        height: data.height,
        weight: data.weight,
        description: englishFlavor?.replace(/\f/g, " "),
        stats: data.stats.map(
          (statObj: { stat: { name: string }; base_stat: number }) => ({
            name: statObj.stat.name.replace("-", " "),
            value: statObj.base_stat,
          })
        ),
      });
    } catch (e) {
      console.error("Error fetching details: ", e);
      setError("Could not load this Pokémon. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Format Pokémon name for display
  const displayName = useMemo(() => {
    return details?.name ? prettyName(details.name) : "";
  }, [details?.name]);

  // Get primary type and theme colors
  const primaryType = (params.type as string) || details?.types[0] || "";
  const primaryColor = colorsByType[primaryType] || "#c1d5df";
  const surfaceTint = addAlpha(primaryColor, "22");
  const cardTint = addAlpha(primaryColor, "55");

  // Tab configuration
  const tabs: { key: typeof activeTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "forms", label: "Forms", icon: "images" },
    { key: "types", label: "Types", icon: "color-palette" },
    { key: "stats", label: "Stats", icon: "stats-chart" },
    { key: "weight", label: "Size", icon: "resize" },
  ];

  // Handle tab change with haptic feedback
  const handleTabChange = (tab: typeof activeTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (details) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleFavorite(details.id);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const isFavorited = details ? isFavorite(details.id) : false;

  return (
    <>
      <SafeAreaView
        style={[styles.page, { backgroundColor: surfaceTint }]}
        edges={["top", "bottom"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button and favorite */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={24} color="#2F3E46" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.name}>{displayName || "Loading..."}</Text>
              {details && (
                <Text style={styles.id}>#{String(details.id).padStart(3, "0")}</Text>
              )}
            </View>
            {details && (
              <TouchableOpacity
                onPress={handleToggleFavorite}
                style={styles.favoriteButton}
                accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Ionicons
                  name={isFavorited ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorited ? "#FF6B6B" : "#2F3E46"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#2F3E46" />
              <Text style={styles.subtle}>Loading Pokémon info...</Text>
            </View>
          )}

          {/* Error State */}
          {!!error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => params.name && fetchPokemonDetails(params.name as string)}
                accessibilityLabel="Retry loading Pokémon"
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pokémon Details */}
          {details && !loading && (
            <>
              {/* Hero Image */}
              <View style={[styles.heroCard, { backgroundColor: cardTint }]}>
                <Image
                  source={{ uri: details.artwork }}
                  style={styles.heroImage}
                  contentFit="contain"
                  transition={300}
                  placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
                />
              </View>

              {/* Tab Navigation */}
              <View style={styles.tabRow}>
                {tabs.map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => handleTabChange(tab.key)}
                      style={styles.tabButton}
                      accessibilityLabel={`View ${tab.label}`}
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={tab.icon}
                        size={18}
                        color={active ? primaryColor : "#7b8d98"}
                      />
                      <Text style={[styles.tab, active && styles.tabActive]}>
                        {tab.label}
                      </Text>
                      {active && (
                        <View
                          style={[styles.tabUnderline, { backgroundColor: primaryColor }]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Tab Content */}
              {activeTab === "forms" && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.formsRow}
                >
                  {details.forms.map((form, index) => (
                    <View key={`${form}-${index}`} style={styles.formCard}>
                      <Image
                        source={{ uri: form }}
                        style={styles.formImage}
                        contentFit="contain"
                        transition={200}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}

              {activeTab === "types" && (
                <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
                  <Text style={styles.sectionTitle}>Types</Text>
                  <View style={styles.chipRow}>
                    {details.types.map((type) => {
                      const typeColor = colorsByType[type] || "#A0AEC0";
                      return (
                        <View
                          key={type}
                          style={[styles.chip, { backgroundColor: typeColor }]}
                        >
                          <Text style={styles.chipText}>{type.toUpperCase()}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {activeTab === "stats" && (
                <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
                  <Text style={styles.sectionTitle}>Base Stats</Text>
                  {details.stats.map((stat) => {
                    const statColor = primaryColor;
                    return (
                      <StatBar
                        key={stat.name}
                        label={stat.name}
                        value={stat.value}
                        color={statColor}
                      />
                    );
                  })}
                </View>
              )}

              {activeTab === "weight" && (
                <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
                  <Text style={styles.sectionTitle}>Size & Weight</Text>
                  <View style={styles.chipRow}>
                    <View style={styles.chip}>
                      <Ionicons name="resize" size={16} color="#2F3E46" />
                      <Text style={styles.chipText}>
                        Height: {details.height / 10}m
                      </Text>
                    </View>
                    <View style={styles.chip}>
                      <Ionicons name="scale" size={16} color="#2F3E46" />
                      <Text style={styles.chipText}>
                        Weight: {details.weight / 10}kg
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Quick Facts Section */}
              <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
                <Text style={styles.sectionTitle}>Quick Facts</Text>
                <View style={styles.chipRow}>
                  {details.types.map((type) => {
                    const typeColor = colorsByType[type] || "#A0AEC0";
                    return (
                      <View
                        key={type}
                        style={[styles.chip, { backgroundColor: typeColor }]}
                      >
                        <Text style={styles.chipText}>{type.toUpperCase()}</Text>
                      </View>
                    );
                  })}
                  <View style={styles.chip}>
                    <Text style={styles.chipTextDark}>
                      Height: {details.height / 10}m
                    </Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipTextDark}>
                      Weight: {details.weight / 10}kg
                    </Text>
                  </View>
                </View>
                {details.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                      Description
                    </Text>
                    <Text style={styles.description}>{details.description}</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 18,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2F3E46",
  },
  id: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5f7381",
    marginTop: 2,
  },
  favoriteButton: {
    padding: 4,
  },
  loadingBox: {
    backgroundColor: "#f3f7fa",
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  subtle: {
    color: "#5f7381",
    fontWeight: "600",
    marginTop: 8,
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: "#FF6B6B",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2F3E46",
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  heroCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroImage: {
    width: "100%",
    height: 260,
  },
  tabRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginTop: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  tab: {
    color: "#7b8d98",
    fontWeight: "700",
    fontSize: 12,
  },
  tabActive: {
    color: "#2F3E46",
  },
  tabUnderline: {
    marginTop: 4,
    height: 3,
    width: "100%",
    borderRadius: 2,
  },
  formsRow: {
    gap: 10,
    paddingVertical: 4,
  },
  formCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#f3f7fa",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  formImage: {
    width: 70,
    height: 70,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2F3E46",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#d7e4eb",
    borderRadius: 12,
  },
  chipText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 12,
  },
  chipTextDark: {
    fontWeight: "700",
    color: "#2F3E46",
    fontSize: 12,
  },
  descriptionContainer: {
    width: "100%",
    alignSelf: "stretch",
  },
  description: {
    color: "#495662",
    lineHeight: 22,
    fontSize: 14,
    marginTop: 8,
    textAlign: "left",
    letterSpacing: 0.2,
    width: "100%",
  },
});
