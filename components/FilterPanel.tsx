import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FilterMode } from "../utils/types";

interface FilterPanelProps {
  filterMode: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Filter panel component
 * Allows users to sort Pokémon by name, type, or power
 */
export function FilterPanel({
  filterMode,
  onFilterChange,
  isOpen,
  onClose,
}: FilterPanelProps) {
  if (!isOpen) return null;

  const filterOptions: { key: FilterMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: "name", label: "Name", icon: "text" },
    { key: "type", label: "Type", icon: "color-palette" },
    { key: "power", label: "Power", icon: "flash" },
  ];

  const handleFilterSelect = (mode: FilterMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFilterChange(mode);
    onClose();
  };

  return (
    <View style={styles.filterPanel}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Sort by</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel="Close filter panel"
        >
          <Ionicons name="close" size={18} color="#5f7381" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        {filterOptions.map((option) => {
          const active = filterMode === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleFilterSelect(option.key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              accessibilityLabel={`Sort by ${option.label}`}
              accessibilityRole="button"
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={active ? "#2F3E46" : "#5f7381"}
                style={styles.filterIcon}
              />
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
  );
}

const styles = StyleSheet.create({
  filterPanel: {
    backgroundColor: "#eef4f8",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#d2dee7",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#5f7381",
    letterSpacing: 0.4,
  },
  closeButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#eef4f8",
    borderWidth: 1,
    borderColor: "#d2dee7",
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: "#c9d7e1",
    borderColor: "#a8b9c6",
  },
  filterIcon: {
    marginRight: 2,
  },
  filterChipText: {
    color: "#5f7381",
    fontWeight: "700",
    fontSize: 13,
  },
  filterChipTextActive: {
    color: "#2F3E46",
  },
});

