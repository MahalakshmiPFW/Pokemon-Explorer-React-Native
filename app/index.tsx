import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FilterPanel } from "../components/FilterPanel";
import { PokemonCard } from "../components/PokemonCard";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { useDebounce } from "../hooks/useDebounce";
import { useFavorites } from "../hooks/useFavorites";
import { API_CONFIG } from "../utils/constants";
import { FilterMode, Pokemon, PokemonListItem } from "../utils/types";

/**
 * Main Pokémon list screen
 * Displays a searchable, filterable list of Pokémon with infinite scroll
 */
export default function Index() {
  // State management
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("name");
  const [filterOpen, setFilterOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Custom hooks
  const debouncedSearch = useDebounce(search, 300); // Wait 300ms after user stops typing
  const { toggleFavorite, isFavorite } = useFavorites();

  // Fetch Pokémon data from API
  const fetchPokemons = useCallback(async (pageToFetch: number, reset = false) => {
    try {
      if (reset) {
        setHasMore(true);
        setError(null);
      }

      const offset = (pageToFetch - 1) * API_CONFIG.POKEMON_LIMIT;

      // Fetch list of Pokémon
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/pokemon/?limit=${API_CONFIG.POKEMON_LIMIT}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      // Check if there are more Pokémon to load
      setHasMore(data.next !== null);

      // Fetch detailed information for each Pokémon in parallel
      // await Promise.allSettled is used to fetch all Pokémon details in parallel and wait for all of them to be fetched
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
            image: details.sprites.front_default,
            imageBack: details.sprites.back_default,
            baseExperience: details.base_experience,
            types: details.types,
          } as Pokemon;
        })
      );

      // Extract successfully fetched Pokémon
      const detailedPokemons = detailResults
        .filter((result): result is PromiseFulfilledResult<Pokemon> => result.status === "fulfilled")
        .map((result) => result.value);

      // Append or replace Pokémon based on pagination
      if (reset || pageToFetch === 1) {
        setPokemons(detailedPokemons);
      } else {
        setPokemons((prev) => [...prev, ...detailedPokemons]);
      }

      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    } catch (e) {
      console.error("Error fetching pokemons: ", e);
      setError("Could not reach PokeAPI. Please check your network and try again.");
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchPokemons(1, true);
  }, [fetchPokemons]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchPokemons(1, true);
  }, [fetchPokemons]);

  // Load more Pokémon when scrolling to bottom
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPokemons(nextPage, false);
    }
  }, [loadingMore, hasMore, loading, page, fetchPokemons]);

  // Filter and sort Pokémon based on search and filter mode
  const filteredPokemons = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    
    // Filter by search term (name or ID)
    const bySearch = term
      ? pokemons.filter((pokemon) =>
          pokemon.name.toLowerCase().includes(term) ||
          String(pokemon.id).includes(term)
        )
      : pokemons;

    // Sort based on selected filter mode
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
      // "power" mode: sort by base experience (highest first)
      return b.baseExperience - a.baseExperience;
    });

    return sorted;
  }, [pokemons, debouncedSearch, filterMode]);

  // Handle filter mode change
  const handleFilterChange = useCallback((mode: FilterMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterMode(mode);
  }, []);

  // Handle search input clear
  const handleClearSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearch("");
  }, []);

  // Memoized key extractor for FlatList performance
  const keyExtractor = useCallback((item: Pokemon) => item.name, []);

  // Render individual Pokémon card - memoized (means it will only re-render if the props change) for performance
  const renderPokemonCard = useCallback(
    ({ item }: { item: Pokemon }) => (
      <PokemonCard
        pokemon={item}
        isFavorite={isFavorite(item.id)}
        onToggleFavorite={toggleFavorite}
      />
    ),
    [isFavorite, toggleFavorite]
  );

  // Render footer with loading indicator
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2F3E46" />
        <Text style={styles.footerText}>Loading more Pokémon...</Text>
      </View>
    );
  }, [loadingMore]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (loading) {
      return <SkeletonLoader />;
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchPokemons(1, true)}
            accessibilityLabel="Retry loading Pokémon"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredPokemons.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={48} color="#8BA0AE" />
          <Text style={styles.emptyText}>No Pokémon found</Text>
          <Text style={styles.emptySubtext}>
            Try adjusting your search or filter
          </Text>
        </View>
      );
    }

    return null;
  }, [loading, error, filteredPokemons.length, fetchPokemons]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to the world of Pokémon! 👋 </Text>
          <Text style={styles.title}>Pokémon Explorer</Text>
          <Text style={styles.subtitle}>
            Search by name or number and discover your favorite Pokémon
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#8BA0AE" />
          <TextInput
            placeholder="Search by name or number"
            placeholderTextColor="#8BA0AE"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            accessibilityLabel="Search Pokémon"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
            >
              <Ionicons name="close-circle" size={20} color="#8BA0AE" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setFilterOpen((prev) => !prev);
            }}
            style={[
              styles.filterBadge,
              filterOpen && styles.filterBadgeActive,
            ]}
            accessibilityLabel="Toggle filter options"
          >
            <Ionicons
              name="options"
              size={18}
              color={filterOpen ? "#2F3E46" : "#5f7381"}
            />
          </TouchableOpacity>
        </View>

        {/* Filter Panel */}
        <FilterPanel
          filterMode={filterMode}
          onFilterChange={handleFilterChange}
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
        />

        {/* Pokémon List */}
        <FlatList
          data={filteredPokemons}
          renderItem={renderPokemonCard}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2F3E46"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          updateCellsBatchingPeriod={50}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#d7e4eb",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  header: {
    gap: 6,
    marginBottom: 16,
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
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2F3E46",
  },
  clearButton: {
    padding: 4,
  },
  filterBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#c9d7e1",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeActive: {
    backgroundColor: "#a8b9c6",
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  row: {
    justifyContent: "space-between",
    gap: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    color: "#5f7381",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2F3E46",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#5f7381",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
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
});
