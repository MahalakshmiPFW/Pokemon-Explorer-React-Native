import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Define the small slice of data we care about for the details page.
interface PokemonDetails {
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

// Shared type-color map so we can theme the screen per Pokémon.
const colorsByType: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export default function Pok_Details() {
  // Grab the name passed in from the list screen so we can fetch the right Pokémon.
  const params = useLocalSearchParams();
  const router = useRouter();
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "forms" | "types" | "stats" | "weight"
  >("forms");

  useEffect(() => {
    if (params.name) {
      fetchPokemonDetails(params.name as string);
    }
  }, [params.name]);

  async function fetchPokemonDetails(name: string) {
    try {
      setError(null);
      // First call grabs sprites, types, and links to the species endpoint.
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!res.ok) throw new Error(`Details failed: ${res.status}`);
      const data = await res.json();

      // Second call grabs a short flavor text so the description is not empty.
      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();
      const englishFlavor = speciesData.flavor_text_entries.find(
        (entry: { language: { name: string } }) => entry.language.name === "en"
      )?.flavor_text;

      setDetails({
        id: data.id,
        name: data.name,
        artwork:
          data.sprites.other["official-artwork"].front_default ??
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
            name: statObj.stat.name,
            value: statObj.base_stat,
          })
        ),
      });
    } catch (e) {
      console.log("Error fetching details: ", e);
      setError(
        "Could not load this Pokémon right now. Please go back and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Memoized pretty name so we do the string work once.
  const prettyName = useMemo(() => {
    if (!details?.name) return "";
    return details.name.charAt(0).toUpperCase() + details.name.slice(1);
  }, [details?.name]);

  // Helper to lightly tint a hex color; keeps the UI soft like the mock.
  const addAlpha = (hex: string, alpha: string) =>
    hex.length === 7 ? `${hex}${alpha}` : hex;
  const primaryType = (params.type as string) || details?.types[0] || "";
  const primaryColor = colorsByType[primaryType] || "#c1d5df";
  const surfaceTint = addAlpha(primaryColor, "22");
  const cardTint = addAlpha(primaryColor, "55");

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "forms", label: "Forms" },
    { key: "types", label: "Types" },
    { key: "stats", label: "Stats" },
    { key: "weight", label: "Weight" },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Pokemon Explorer",
          headerShown: false, // hide default navigation bar so we only see the custom one below
        }}
      />
      <ScrollView
        style={[styles.page, { backgroundColor: surfaceTint }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#2F3E46"
            onPress={() => router.back()}
          />
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.name}>{prettyName}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#2F3E46" />
            <Text style={styles.subtle}>Fetching Pokémon info…</Text>
          </View>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {details && (
          <>
            <View style={[styles.heroCard, { backgroundColor: cardTint }]}>
              <Image
                source={{ uri: details.artwork }}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.tabRow}>
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={styles.tabButton}
                  >
                    <Text style={[styles.tab, active && styles.tabActive]}>
                      {tab.label}
                    </Text>
                    {active && <View style={styles.tabUnderline} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeTab === "forms" && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.formsRow}
              >
                {details.forms.map((form) => (
                  <View key={form} style={styles.formCard}>
                    <Image
                      source={{ uri: form }}
                      style={styles.formImage}
                      resizeMode="contain"
                    />
                  </View>
                ))}
              </ScrollView>
            )}

            {activeTab === "types" && (
              <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
                <Text style={styles.sectionTitle}>Types</Text>
                <View style={styles.chipRow}>
                  {details.types.map((type) => (
                    <View key={type} style={styles.chip}>
                      <Text style={styles.chipText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activeTab === "stats" && (
              <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
                <Text style={styles.sectionTitle}>Stats</Text>
                {details.stats.map((stat) => (
                  <View key={stat.name} style={styles.statRow}>
                    <Text style={styles.statLabel}>{stat.name}</Text>
                    <View style={styles.statBarTrack}>
                      <View
                        style={[
                          styles.statBarFill,
                          { width: `${Math.min(stat.value, 150) / 1.5}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === "weight" && (
              <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
                <Text style={styles.sectionTitle}>Size & Weight</Text>
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      Height: {details.height / 10}m
                    </Text>
                  </View>
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>
                      Weight: {details.weight / 10}kg
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.infoCard, { backgroundColor: cardTint }]}>
              <Text style={styles.sectionTitle}>Quick Facts</Text>
              <View style={styles.chipRow}>
                {details.types.map((type) => (
                  <View key={type} style={styles.chip}>
                    <Text style={styles.chipText}>{type}</Text>
                  </View>
                ))}
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    Height: {details.height / 10}m
                  </Text>
                </View>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>
                    Weight: {details.weight / 10}kg
                  </Text>
                </View>
              </View>
              <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
                Story
              </Text>
              <Text style={styles.description}>
                {details.description ||
                  "In order to support its flower, it grows sturdy legs and a thicker body as it evolves."}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}

//This takes an object of styles and you then start defining your styles. You can then use these styles in your components by referencing the style object 
// and the name of the style you want to use. For ex., if you have a style called container, you can use it in your component like this: style={styles.container}.
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#d7e4eb",
  },
  content: {
    padding: 18,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2F3E46",
  },
  loadingBox: {
    backgroundColor: "#f3f7fa",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  subtle: {
    color: "#5f7381",
    fontWeight: "600",
  },
  heroCard: {
    backgroundColor: "#c1d5df",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
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
    alignItems: "center",
  },
  tab: {
    color: "#7b8d98",
    fontWeight: "700",
  },
  tabActive: {
    color: "#2F3E46",
  },
  tabUnderline: {
    marginTop: 4,
    height: 3,
    width: "100%",
    backgroundColor: "#2F3E46",
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
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  formImage: {
    width: 70,
    height: 70,
  },
  infoCard: {
    backgroundColor: "#f3f7fa",
    borderRadius: 16,
    padding: 16,
    gap: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#d7e4eb",
    borderRadius: 12,
  },
  chipText: {
    fontWeight: "700",
    color: "#2F3E46",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statLabel: {
    width: 80,
    color: "#2F3E46",
    fontWeight: "700",
    textTransform: "capitalize",
  },
  statBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#d7e4eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  statBarFill: {
    height: 8,
    backgroundColor: "#2F3E46",
  },
  statValue: {
    width: 40,
    textAlign: "right",
    color: "#2F3E46",
    fontWeight: "700",
  },
  description: {
    color: "#495662",
    lineHeight: 20,
  },
  error: {
    color: "red",
    fontWeight: "bold",
  },
});
