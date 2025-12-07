import { StyleSheet, Text, View } from "react-native";

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

/**
 * Stat bar component for displaying Pokémon statistics
 * Shows a visual progress bar with the stat value
 */
export function StatBar({ label, value, maxValue = 150, color = "#2F3E46" }: StatBarProps) {
  // Calculate percentage width (cap at 100%)
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statBarTrack}>
        <View
          style={[
            styles.statBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 13,
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
    borderRadius: 6,
  },
  statValue: {
    width: 40,
    textAlign: "right",
    color: "#2F3E46",
    fontWeight: "700",
    fontSize: 13,
  },
});

