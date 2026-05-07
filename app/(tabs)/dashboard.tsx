import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useToolStore } from "../../toolStore";

export default function DashboardScreen() {
  const tools = useToolStore((state) => state.tools);

  const totalTools = tools.length;

  const availableTools = tools.filter(
    (tool) => tool.status === "Available"
  ).length;

  const inUseTools = tools.filter(
    (tool) => tool.status === "In Use"
  ).length;

  const missingTools = tools.filter(
    (tool) => tool.status === "Missing"
  ).length;

  const brokenTools = tools.filter(
    (tool) => tool.status === "Broken"
  ).length;

  const borrowedTools = tools.filter(
    (tool) => tool.status === "In Use" || tool.holder
  ).length;

  const totalLocations = new Set(
    tools
      .map((tool) => tool.location)
      .filter((location) => location && location.trim() !== "")
  ).size;

  const totalProfessions = new Set(
    tools
      .map((tool) => tool.profession)
      .filter((profession) => profession && profession.trim() !== "")
  ).size;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.subtitle}>
        Your inventory overview
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroNumber}>{totalTools}</Text>
        <Text style={styles.heroText}>Total inventory items</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{availableTools}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{inUseTools}</Text>
          <Text style={styles.statLabel}>In Use</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{missingTools}</Text>
          <Text style={styles.statLabel}>Missing</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{brokenTools}</Text>
          <Text style={styles.statLabel}>Broken</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Operational Summary</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          Borrowed / assigned: {borrowedTools}
        </Text>
        <Text style={styles.summaryText}>
          Locations: {totalLocations}
        </Text>
        <Text style={styles.summaryText}>
          Professions: {totalProfessions}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Quick Insight</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {brokenTools + missingTools === 0
            ? "Everything looks good. No broken or missing tools."
            : `${brokenTools + missingTools} item(s) need attention.`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b1f",
    padding: 20,
  },

  title: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 60,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 24,
  },

  heroCard: {
    backgroundColor: "#ff6b00",
    borderRadius: 28,
    padding: 30,
    marginBottom: 22,
  },

  heroNumber: {
    color: "white",
    fontSize: 54,
    fontWeight: "bold",
  },

  heroText: {
    color: "white",
    fontSize: 20,
    marginTop: 8,
    fontWeight: "bold",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    backgroundColor: "#111c34",
    width: "48%",
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
  },

  statNumber: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 8,
  },

  sectionTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 12,
  },

  summaryCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
  },

  summaryText: {
    color: "#d1d5db",
    fontSize: 18,
    marginBottom: 8,
  },
});