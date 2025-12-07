import { StyleSheet, View } from "react-native";
import { isTablet } from "../utils/helpers";

/**
 * Skeleton loader component
 * Shows animated placeholder while content is loading
 * Provides better UX than blank screens or simple text
 */
export function SkeletonLoader() {
  const cardWidth = isTablet() ? "31%" : "48%";

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={[styles.skeletonCard, { width: cardWidth }]}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonImage} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  skeletonCard: {
    borderRadius: 18,
    padding: 12,
    gap: 6,
    backgroundColor: "#e8eef2",
  },
  skeletonHeader: {
    height: 16,
    borderRadius: 8,
    backgroundColor: "#d0d8de",
    width: "60%",
  },
  skeletonImage: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    backgroundColor: "#d0d8de",
  },
});

