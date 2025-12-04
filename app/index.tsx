import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Pokemon {
  name: string;
  id: number;
  image: string;
  imageBack: string;
  baseExperience: number;
  types: PokemonType[];
}

// We will also define an interface for the PokemonType object that we will be fetching from the API. This will help us to type our state variable and make sure that we are getting the correct data from the API.
interface PokemonType {
  type: {
    name: string;
    url: string;
  }
}
// Data returned from the first list call includes the url for details
interface PokemonListItem {
  name: string;
  url: string;
}

// based on the type we could define the colors we want to use for each type
//an object that would return the color that we should use based on the type of pokemon
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

export default function Index() {
  // we will use the useState hook to store the list of pokemons in state. We will initialize it as undefined, and then set it to the data we get from the API when we fetch it.
  // pokemons is the actual value of the variable and setPokemons is the function that we will use to update the value of pokemons. We will call this function when we get the data from the API and want to store it in state.
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"name" | "type" | "power">("name");
  const [filterOpen, setFilterOpen] = useState(false); // toggles the little filter popover

  // we will use the useEffect hook to fetch the data from the API when the component mounts. This will allow us to run the code that fetches the data when the screen loads.
  // we will also use the useEffect hook to log the first pokemon in the list to the console, so we can see what data we are getting from the API.
  console.log(JSON.stringify(pokemons[0], null, 2));
  const [error, setError] = useState<string | null>(null);
  
  //when i load the app, i want to fetch the list of pokemon from the pokeapi and store it in state. I will use react hooks to do this. 
  // I will use the useEffect hook to fetch the data when the component mount (allows us to run code when the screen mounts), and I will 
  // use the useState hook to store the data in state (allows us to save the data in a state variable that we can then display on screen).
  useEffect(() => {
    // fetch the list of pokemons from the pokeapi
    fetchPokemons();
  }, []);

  async function fetchPokemons() {
    try {
      setError(null);
      // fetch is a function that allows us to hit an api. It takes an url as a parameter and then some request info (like method, headers, body, etc). It returns a response object that we can then parse to get the data we need.
      // It is a simple GET request
      const response = await fetch(
        "https://pokeapi.co/api/v2/pokemon/?limit=25"
      );

      if (!response.ok) {
        throw new Error(`List request failed: ${response.status}`);
      }

      // once we get a response, its going to come in a JSON format
      //so we can abstract the data and get the results property which is an array of pokemons (by using await).
      const data = await response.json();

      // we will use Promise.allSettled to fetch the details of each pokemon in parallel. If any single request fails, we still show the rest.
      const detailResults = await Promise.allSettled(
        data.results.map(async (pokemon: PokemonListItem) => {
          const res = await fetch(pokemon.url);
          if (!res.ok) {
            throw new Error(`Detail failed: ${res.status} for ${pokemon.name}`);
          }
          const details = await res.json();
          return {
            name: pokemon.name,
            id: details.id,
            image: details.sprites.front_default, //main sprite of the pokemon
            imageBack: details.sprites.back_default, //back sprite of the pokemon
            baseExperience: details.base_experience, // handy power-ish metric from the API
            types: details.types //array of types of the pokemon
          };
        })
      );

      const detailedPokemons = detailResults
        .filter((result): result is PromiseFulfilledResult<Pokemon> => result.status === "fulfilled")
        .map((result) => result.value);

      console.log("Detailed Pokemons: ", detailedPokemons);

      setPokemons(detailedPokemons);
      setLoading(false);
    } catch(e) {
      console.log("Error fetching pokemons: ", e);
      setLoading(false);
      setError("Could not reach PokeAPI. Please check your network and pull to refresh.");
    }
  }

  // derive a filtered list so we only render once per change
  const filteredPokemons = useMemo(() => {
    const term = search.trim().toLowerCase();
    const bySearch = term
      ? pokemons.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        String(pokemon.id).includes(search.trim())
      )
      : pokemons;

    // Sort based on chosen filter mode so the user can pick how to browse.
    const sorted = [...bySearch].sort((a, b) => {
      if (filterMode === "name") {
        return a.name.localeCompare(b.name);
      }
      if (filterMode === "type") {
        const typeA = a.types[0]?.type.name || "";
        const typeB = b.types[0]?.type.name || "";
        const byType = typeA.localeCompare(typeB);
        return byType !== 0 ? byType : a.name.localeCompare(b.name);
      }
      // "power" mode: higher base experience first
      return b.baseExperience - a.baseExperience;
    });

    return sorted;
  }, [pokemons, search, filterMode]);

  // small helper to capitalize pokemon names for display
  const prettyName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1);
  
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi there! 👋</Text>
          <Text style={styles.title}>Pokemon Explorer</Text>
          <Text style={styles.subtitle}>
            Welcome to your cozy Pokémon corner—search by name or National number and let's catch 'em all.
          </Text>
        </View>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#8BA0AE" />
          <TextInput
            placeholder="Name or number"
            placeholderTextColor="#8BA0AE"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          <TouchableOpacity
            onPress={() => setFilterOpen((prev) => !prev)}
            style={styles.filterBadge}
            accessibilityLabel="Toggle filters"
          >
            <Ionicons name="options" size={18} color="#2F3E46" />
          </TouchableOpacity>
        </View>

        {filterOpen && (
          <View style={styles.filterPanel}>
            <Text style={styles.filterTitle}>Filter by</Text>
            <View style={styles.filterRow}>
              {[
                { key: "name", label: "Name" },
                { key: "type", label: "Type" },
                { key: "power", label: "Most Powerful" },
              ].map((option) => {
                const active = filterMode === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => {
                      setFilterMode(option.key as typeof filterMode);
                      setFilterOpen(false); // close after picking
                    }}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        active && styles.filterChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {loading && !error && (
          <Text style={styles.status}>Loading pokémons…</Text>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {!loading && filteredPokemons.length === 0 && !error && (
          <Text style={styles.status}>No pokémons match your search.</Text>
        )}

        <View style={styles.grid}>
          {filteredPokemons.map((pokemon) => {
            const mainType = pokemon.types[0]?.type.name;
            const cardColor = `${colorsByType[mainType] || "#A0AEC0"}33`; // light tint background

            return (
              <Link
                key={pokemon.name}
                href={{
                  pathname: "/pok_details",
                  params: { name: pokemon.name, type: mainType },
                }}
                style={[styles.card, { backgroundColor: cardColor }]}
              >
                <Text style={styles.cardName}>{prettyName(pokemon.name)}</Text>
                <Image
                  source={{ uri: pokemon.image }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </Link>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

//This takes an object of styles and you then start defining your styles. You can then use these styles in your components by referencing the style object 
// and the name of the style you want to use. For ex., if you have a style called container, you can use it in your component like this: style={styles.container}.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#d7e4eb",
  },
  page: {
    flex: 1,
    backgroundColor: "#d7e4eb",
  },
  pageContent: {
    padding: 18,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5f7381",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2F3E46",
  },
  subtitle: {
    fontSize: 14,
    color: "#5f7381",
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f7fa",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2F3E46",
  },
  filterBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#c9d7e1",
    alignItems: "center",
    justifyContent: "center",
  },
  filterPanel: {
    backgroundColor: "#eef4f8",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#d2dee7",
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5f7381",
    letterSpacing: 0.4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#eef4f8",
    borderWidth: 1,
    borderColor: "#d2dee7",
  },
  filterChipActive: {
    backgroundColor: "#c9d7e1",
    borderColor: "#a8b9c6",
  },
  filterChipText: {
    color: "#5f7381",
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: "#2F3E46",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: 18,
    padding: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
  error: {
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
  status: {
    textAlign: "center",
    color: "#5f7381",
    fontWeight: "600",
  },
});
