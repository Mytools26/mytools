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

export default function ItemDetailsScreen() {
  const params = useLocalSearchParams();

  const name = String(params.name || "Unknown item");
  const profession = String(params.profession || "Not set");
  const category = String(params.category || "Not set");
  const brand = String(params.brand || "No brand");
  const quantity = String(params.quantity || "0");

  const [workerName, setWorkerName] = useState("");

  const tools = useToolStore((state) => state.tools);
  const assignTool = useToolStore((state) => state.assignTool);

  const selectedTool = tools.find(
    (tool) =>
      tool.name === name &&
      tool.profession === profession &&
      tool.category === category &&
      tool.brand === brand
  );

  const handleAssign = () => {
    if (!workerName.trim()) {
      Alert.alert("Error", "Enter worker name");
      return;
    }

    if (!selectedTool?.id) {
      Alert.alert("Error", "Tool not found in storage");
      return;
    }

    assignTool(selectedTool.id, workerName.trim());

    Alert.alert("Success", `Assigned to ${workerName}`);

    router.replace("/borrowed");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      <Text style={styles.subtitle}>Item details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Profession</Text>
        <Text style={styles.value}>{profession}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{category}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Brand</Text>
        <Text style={styles.value}>{brand}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Quantity</Text>
        <Text style={styles.value}>{quantity}</Text>
      </View>

      <Text style={styles.label}>Assign to worker</Text>

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
        <Text style={styles.assignButtonText}>Assign this item</Text>
      </TouchableOpacity>

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
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 60,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },

  label: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  value: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#111c34",
    color: "white",
    padding: 18,
    borderRadius: 16,
    fontSize: 18,
    marginBottom: 18,
  },

  assignButton: {
    backgroundColor: "#ff6b00",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  assignButtonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 60,
  },

  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});