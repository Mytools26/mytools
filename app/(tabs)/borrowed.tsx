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

  const deleteTool = useToolStore(
    (state) => state.deleteTool
  );

  const duplicateWorkerGroup = useToolStore(
    (state) => state.duplicateWorkerGroup
  );

  const [copyingWorker, setCopyingWorker] =
    useState<string | null>(null);

  const [newWorkerName, setNewWorkerName] =
    useState("");

  const [newLocation, setNewLocation] =
    useState("");

  const borrowedTools = tools.filter(
    (tool) =>
      tool.status === "In Use" ||
      tool.holder ||
      tool.borrowedBy
  );

  const groupedByWorker = borrowedTools.reduce(
    (acc, tool) => {
      const workerName =
        tool.borrowedBy ||
        tool.holder ||
        "Unknown Worker";

      if (!acc[workerName]) {
        acc[workerName] = [];
      }

      acc[workerName].push(tool);

      return acc;
    },
    {} as Record<string, typeof borrowedTools>
  );

  const deleteWorkerGroup = (
    workerName: string,
    workerTools: typeof borrowedTools
  ) => {
    Alert.alert(
      "Delete Worker Group",
      `Delete ${workerName} and all assigned tools?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: () => {
            workerTools.forEach(
              (tool, index) => {
                const realId =
                  tool.id ||
                  `old-tool-${index}`;

                deleteTool(realId);
              }
            );
          },
        },
      ]
    );
  };

  const copyGroup = (
    workerName: string
  ) => {
    if (!newWorkerName.trim()) {
      Alert.alert(
        "Error",
        "Enter worker name"
      );

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

    Alert.alert(
      "Success",
      "Group copied"
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Borrowed
      </Text>

      <Text style={styles.subtitle}>
        Active worker assignments
      </Text>

      {borrowedTools.length === 0 ? (
        <Text style={styles.emptyText}>
          No borrowed tools
        </Text>
      ) : (
        Object.entries(groupedByWorker).map(
          ([workerName, workerTools]) => (
            <View
              key={workerName}
              style={styles.workerCard}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname:
                      "/worker-details",

                    params: {
                      workerName,
                    },
                  } as any)
                }
              >
                <View style={styles.topRow}>
                  <View>
                    <Text
                      style={styles.workerName}
                    >
                      {workerName}
                    </Text>

                    <Text
                      style={styles.summaryText}
                    >
                      {workerTools.length} tools assigned
                    </Text>
                  </View>

                  <View
                    style={styles.badge}
                  >
                    <Text
                      style={
                        styles.badgeText
                      }
                    >
                      OPEN
                    </Text>
                  </View>
                </View>

                <Text
                  style={styles.openText}
                >
                  Tap to open worker details
                </Text>
              </TouchableOpacity>

              {copyingWorker ===
              workerName ? (
                <View
                  style={styles.copyBox}
                >
                  <TextInput
                    placeholder="New worker name"
                    placeholderTextColor="#888"
                    style={styles.input}
                    value={newWorkerName}
                    onChangeText={
                      setNewWorkerName
                    }
                  />

                  <TextInput
                    placeholder="New location"
                    placeholderTextColor="#888"
                    style={styles.input}
                    value={newLocation}
                    onChangeText={
                      setNewLocation
                    }
                  />

                  <View
                    style={
                      styles.copyButtons
                    }
                  >
                    <TouchableOpacity
                      style={
                        styles.saveButton
                      }
                      onPress={() =>
                        copyGroup(
                          workerName
                        )
                      }
                    >
                      <Text
                        style={
                          styles.buttonText
                        }
                      >
                        Save
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={
                        styles.cancelButton
                      }
                      onPress={() => {
                        setCopyingWorker(
                          null
                        );

                        setNewWorkerName(
                          ""
                        );

                        setNewLocation(
                          ""
                        );
                      }}
                    >
                      <Text
                        style={
                          styles.buttonText
                        }
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View
                  style={styles.actionRow}
                >
                  <TouchableOpacity
                    style={
                      styles.copyButton
                    }
                    onPress={() =>
                      setCopyingWorker(
                        workerName
                      )
                    }
                  >
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Copy
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.deleteButton
                    }
                    onPress={() =>
                      deleteWorkerGroup(
                        workerName,
                        workerTools
                      )
                    }
                  >
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        )
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b1f",
    padding: 16,
  },

  title: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 54,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 18,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 30,
  },

  workerCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  workerName: {
    color: "#ff6b00",
    fontSize: 24,
    fontWeight: "bold",
  },

  summaryText: {
    color: "#d1d5db",
    fontSize: 14,
    marginTop: 4,
  },

  openText: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 10,
  },

  badge: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    color: "#60a5fa",
    fontSize: 11,
    fontWeight: "bold",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },

  copyButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#7f1d1d",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  copyBox: {
    marginTop: 14,
  },

  input: {
    backgroundColor: "#020b1f",
    color: "white",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },

  copyButtons: {
    flexDirection: "row",
    gap: 10,
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#374151",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});