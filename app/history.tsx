import { router } from "expo-router";
import React from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useToolStore } from "../toolStore";

export default function HistoryScreen() {
  const historyLogs = useToolStore((state) => state.historyLogs);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>History</Text>

      <Text style={styles.subtitle}>
        Tool movements and warehouse activity
      </Text>

      {historyLogs.length === 0 ? (
        <Text style={styles.emptyText}>No history yet</Text>
      ) : (
        historyLogs.map((log) => (
          <View key={log.id} style={styles.card}>
            <Text style={styles.type}>{log.type}</Text>

            <Text style={styles.message}>{log.message}</Text>

            {log.workerName ? (
              <Text style={styles.meta}>Worker: {log.workerName}</Text>
            ) : null}

            {log.location ? (
              <Text style={styles.meta}>Location: {log.location}</Text>
            ) : null}

            <Text style={styles.date}>{formatDate(log.createdAt)}</Text>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
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

  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },

  type: {
    color: "#ff6b00",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  message: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  meta: {
    color: "#d1d5db",
    fontSize: 15,
    marginBottom: 4,
  },

  date: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 8,
  },

  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 60,
  },

  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});