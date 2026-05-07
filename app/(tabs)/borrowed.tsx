import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useToolStore } from "../../toolStore";

export default function BorrowedScreen() {
  const tools = useToolStore((state) => state.tools);

  const borrowedTools = tools.filter(
    (tool) => tool.status === "In Use" || tool.holder
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Borrowed</Text>

      <Text style={styles.subtitle}>
        Tools currently assigned to someone
      </Text>

      {borrowedTools.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>No borrowed tools yet</Text>
        </View>
      ) : (
        borrowedTools.map((tool) => (
          <View key={tool.id} style={styles.card}>
            <Text style={styles.toolTitle}>{tool.name}</Text>

            {tool.holder ? (
              <Text style={styles.text}>Holder: {tool.holder}</Text>
            ) : (
              <Text style={styles.warningText}>No holder assigned</Text>
            )}

            <Text style={styles.text}>Status: {tool.status}</Text>

            {tool.quantity ? (
              <Text style={styles.text}>Quantity: {tool.quantity}</Text>
            ) : null}

            {tool.location ? (
              <Text style={styles.text}>Location: {tool.location}</Text>
            ) : null}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: "/edit-tool",
                  params: { id: tool.id },
                })
              }
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
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
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 60,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },

  toolTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },

  text: {
    color: "#d1d5db",
    fontSize: 18,
    marginBottom: 6,
  },

  warningText: {
    color: "#f97316",
    fontSize: 18,
    marginBottom: 6,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#d1d5db",
    fontSize: 18,
  },

  editButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
  },

  editButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});