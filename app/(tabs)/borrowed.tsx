import { router } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useToolStore } from "../../toolStore";

export default function BorrowedScreen() {
  const tools = useToolStore((state) => state.tools);
  const deleteTool = useToolStore((state) => state.deleteTool);
  const duplicateWorkerGroup = useToolStore(
    (state) => state.duplicateWorkerGroup
  );

  const [copyingWorker, setCopyingWorker] = useState<string | null>(null);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const borrowedTools = tools.filter(
    (tool) => tool.status === "In Use" || tool.holder || tool.borrowedBy
  );

  const groupedByWorker = borrowedTools.reduce((acc, tool) => {
    const workerName = tool.borrowedBy || tool.holder || "Unknown worker";

    if (!acc[workerName]) {
      acc[workerName] = [];
    }

    acc[workerName].push(tool);

    return acc;
  }, {} as Record<string, typeof borrowedTools>);

  const deleteWorkerGroup = (
    workerName: string,
    workerTools: typeof borrowedTools
  ) => {
    Alert.alert(
      "Delete Worker Group",
      `Delete ${workerName} and all assigned tools?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            workerTools.forEach((tool, index) => {
              const realId = tool.id || `old-tool-${index}`;
              deleteTool(realId);
            });
          },
        },
      ]
    );
  };

  const copyGroup = (workerName: string) => {
    if (!newWorkerName.trim()) {
      Alert.alert("Error", "Enter new worker/group name");
      return;
    }

    duplicateWorkerGroup(
      workerName,
      newWorkerName.trim(),
      newLocation.trim()
    );

    setCopyingWorker(null);
    setNewWorkerName("");
    setNewLocation("");

    Alert.alert("Success", "Group copied");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Borrowed Tools</Text>

      <Text style={styles.subtitle}>Workers currently using tools</Text>

      {borrowedTools.length === 0 ? (
        <Text style={styles.emptyText}>No borrowed tools</Text>
      ) : (
        Object.entries(groupedByWorker).map(([workerName, workerTools]) => (
          <View key={workerName} style={styles.workerCard}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/worker-details",
                  params: { workerName },
                } as any)
              }
            >
              <Text style={styles.workerName}>{workerName}</Text>

              <Text style={styles.summaryText}>
                Total tools: {workerTools.length}
              </Text>

              <Text style={styles.openText}>Tap to open tool list</Text>
            </TouchableOpacity>

            {copyingWorker === workerName ? (
              <View style={styles.copyBox}>
                <TextInput
                  placeholder="New worker / group name"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={newWorkerName}
                  onChangeText={setNewWorkerName}
                />

                <TextInput
                  placeholder="New location / project"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={newLocation}
                  onChangeText={setNewLocation}
                />

                <TouchableOpacity
                  style={styles.copyConfirmButton}
                  onPress={() => copyGroup(workerName)}
                >
                  <Text style={styles.buttonText}>Save Copy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setCopyingWorker(null);
                    setNewWorkerName("");
                    setNewLocation("");
                  }}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => setCopyingWorker(workerName)}
                >
                  <Text style={styles.buttonText}>Copy Group</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteWorkerGroup(workerName, workerTools)}
                >
                  <Text style={styles.buttonText}>Delete Group</Text>
                </TouchableOpacity>
              </View>
            )}
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
    marginBottom: 24,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
    marginTop: 30,
  },

  workerCard: {
    backgroundColor: "#111c34",
    borderRadius: 26,
    padding: 24,
    marginBottom: 20,
  },

  workerName: {
    color: "#ff6b00",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 12,
  },

  summaryText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },

  openText: {
    color: "#9ca3af",
    fontSize: 17,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  copyButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#7f1d1d",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  copyBox: {
    marginTop: 18,
  },

  input: {
    backgroundColor: "#020b1f",
    color: "white",
    padding: 16,
    borderRadius: 14,
    fontSize: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },

  copyConfirmButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  cancelButton: {
    backgroundColor: "#374151",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});