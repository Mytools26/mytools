import { router, useLocalSearchParams } from "expo-router";
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

import { useToolStore } from "../toolStore";

const getStatusColor = (status?: string) => {
  switch (status) {
    case "Available":
      return "#16a34a";

    case "In Use":
      return "#2563eb";

    case "Missing":
      return "#f59e0b";

    case "Broken":
      return "#7f1d1d";

    default:
      return "#374151";
  }
};

export default function ItemDetailsScreen() {
  const params = useLocalSearchParams();

  const toolId = String(params.toolId || "");

  const tools = useToolStore((state) => state.tools || []);

  const updateTool = useToolStore((state) => state.updateTool);

  const deleteTool = useToolStore((state) => state.deleteTool);

  const assignTool = useToolStore((state) => state.assignTool);

  const returnTool = useToolStore((state) => state.returnTool);

  const selectedTool = tools.find((tool, index) => {
    const realId = tool.id || `old-tool-${index}`;

    return realId === toolId;
  });

  const [workerName, setWorkerName] = useState("");

  const [quantity, setQuantity] = useState(
    selectedTool?.quantity || ""
  );

  if (!selectedTool) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Tool Not Found</Text>

        <Text style={styles.subtitle}>
          This tool no longer exists.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const realId = selectedTool.id || toolId;

  const handleSaveQuantity = () => {
    updateTool(realId, {
      ...selectedTool,
      id: realId,
      quantity,
    });

    Alert.alert("Saved", "Quantity updated");
  };

  const handleAssign = () => {
    if (!workerName.trim()) {
      Alert.alert("Error", "Enter worker name");
      return;
    }

    assignTool(realId, workerName.trim());

    Alert.alert(
      "Success",
      `${selectedTool.name} assigned to ${workerName}`
    );

    router.replace("/borrowed");
  };

  const handleReturn = () => {
    Alert.alert(
      "Return Tool",
      `Return ${selectedTool.name} to warehouse?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Return",

          onPress: () => {
            returnTool(realId);

            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Tool",
      `Delete ${selectedTool.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: () => {
            deleteTool(realId);

            router.replace("/(tabs)");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {selectedTool.name}
      </Text>

      <Text style={styles.subtitle}>
        Tool details and actions
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.label}>
              Status
            </Text>

            <Text style={styles.statusText}>
              {selectedTool.status || "Unknown"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(
                  selectedTool.status
                ),
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {selectedTool.status || "Unknown"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.meta}>
          Quantity: {selectedTool.quantity || "0"}
        </Text>

        <Text style={styles.meta}>
          Worker:{" "}
          {selectedTool.borrowedBy ||
            selectedTool.holder ||
            "Storage"}
        </Text>

        <Text style={styles.meta}>
          Location:{" "}
          {selectedTool.location || "No location"}
        </Text>

        <Text style={styles.meta}>
          Profession:{" "}
          {selectedTool.profession || "Not set"}
        </Text>

        <Text style={styles.meta}>
          Category:{" "}
          {selectedTool.category || "Not set"}
        </Text>

        <Text style={styles.meta}>
          Brand: {selectedTool.brand || "No brand"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Edit Quantity
        </Text>

        <TextInput
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Quantity"
          placeholderTextColor="#888"
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveQuantity}
        >
          <Text style={styles.buttonText}>
            Save Quantity
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Assign to worker
        </Text>

        <TextInput
          placeholder="e.g. Ali, Mehmet, Team A"
          placeholderTextColor="#888"
          style={styles.input}
          value={workerName}
          onChangeText={setWorkerName}
        />

        <TouchableOpacity
          style={styles.assignButton}
          onPress={handleAssign}
        >
          <Text style={styles.buttonText}>
            Assign Tool
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTool.status === "In Use" ||
      selectedTool.borrowedBy ||
      selectedTool.holder ? (
        <TouchableOpacity
          style={styles.returnButton}
          onPress={handleReturn}
        >
          <Text style={styles.buttonText}>
            Return To Warehouse
          </Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
      >
        <Text style={styles.buttonText}>
          Delete Tool
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Back
        </Text>
      </TouchableOpacity>

      <View style={{ height: 70 }} />
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
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 54,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 18,
  },

  summaryCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginVertical: 14,
  },

  label: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
  },

  statusText: {
    color: "#ff6b00",
    fontSize: 22,
    fontWeight: "bold",
  },

  meta: {
    color: "#d1d5db",
    fontSize: 15,
    marginBottom: 7,
  },

  statusBadge: {
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  input: {
    backgroundColor: "#020b1f",
    color: "white",
    padding: 14,
    borderRadius: 13,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },

  saveButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
  },

  assignButton: {
    backgroundColor: "#ff6b00",
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
  },

  returnButton: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  deleteButton: {
    backgroundColor: "#7f1d1d",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },

  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});