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

import { useToolStore } from "../toolStore";
import toolCatalog from "./toolCatalog";

const professions = Object.keys(toolCatalog || {});

const guessCategory = (toolName: string) => {
  const name = toolName.toLowerCase();

  if (name.includes("screwdriver")) return "Screwdrivers";
  if (name.includes("drill") || name.includes("grinder") || name.includes("saw")) return "PowerTools";
  if (name.includes("battery") || name.includes("charger")) return "BatteriesChargers";
  if (name.includes("meter") || name.includes("tester") || name.includes("laser")) return "MeasuringTools";

  return "CustomTools";
};

const getAutoImage = (toolName: string) => {
  const name = toolName.toLowerCase();

  if (name.includes("drill")) return "drill";
  if (name.includes("screwdriver")) return "screwdriver";
  if (name.includes("battery")) return "battery";
  if (name.includes("ladder")) return "ladder";
  if (name.includes("meter") || name.includes("tester")) return "tester";
  if (name.includes("cutter")) return "cutter";
  if (name.includes("grinder")) return "grinder";
  if (name.includes("saw")) return "saw";

  return "tool";
};

export default function GlobalSearchScreen() {
  const tools = useToolStore((state) => state.tools || []);
  const warehouseStock = useToolStore((state) => state.warehouseStock || {});
  const historyLogs = useToolStore((state) => state.historyLogs || []);
  const addCustomTool = useToolStore((state) => state.addCustomTool);
  const setWarehouseQuantity = useToolStore((state) => state.setWarehouseQuantity);

  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [profession, setProfession] = useState(professions[0] || "Electrician");

  const text = search.toLowerCase().trim();

  const toolResults = text
    ? tools.filter((tool) => {
        return (
          tool.name?.toLowerCase().includes(text) ||
          tool.profession?.toLowerCase().includes(text) ||
          tool.category?.toLowerCase().includes(text) ||
          tool.location?.toLowerCase().includes(text) ||
          tool.borrowedBy?.toLowerCase().includes(text) ||
          tool.holder?.toLowerCase().includes(text) ||
          tool.status?.toLowerCase().includes(text)
        );
      })
    : [];

  const warehouseResults = text
    ? Object.entries(warehouseStock).filter(
        ([toolName, stockQuantity]) =>
          toolName.toLowerCase().includes(text) ||
          String(stockQuantity).toLowerCase().includes(text)
      )
    : [];

  const historyResults = text
    ? historyLogs.filter((log) => {
        return (
          log.message?.toLowerCase().includes(text) ||
          log.toolName?.toLowerCase().includes(text)
        );
      })
    : [];

  const hasResults =
    toolResults.length > 0 ||
    warehouseResults.length > 0 ||
    historyResults.length > 0;

  const saveNewTool = () => {
    const toolName = search.trim();

    if (!toolName) {
      Alert.alert("Error", "Type tool name.");
      return;
    }

    if (!quantity.trim()) {
      Alert.alert("Error", "Enter quantity.");
      return;
    }

    addCustomTool({
      id: `${Date.now()}-${toolName}`,
      name: toolName,
      profession,
      category: guessCategory(toolName),
      image: getAutoImage(toolName),
    });

    setWarehouseQuantity(toolName, quantity.trim());

    Alert.alert("Saved", `${toolName} added to warehouse`);

    setSearch("");
    setQuantity("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Global Search</Text>

      <Text style={styles.subtitle}>Search tools, workers and warehouse</Text>

      <TextInput
        placeholder="Search tool..."
        placeholderTextColor="#888"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      {!search.trim() ? (
        <Text style={styles.emptyText}>Type something to search</Text>
      ) : (
        <>
          {!hasResults ? (
            <View style={styles.quickAddCard}>
              <Text style={styles.sectionTitle}>No results found</Text>

              <Text style={styles.text}>Add "{search}" to warehouse</Text>

              <Text style={styles.label}>Profession</Text>

              <View style={styles.professionWrap}>
                {professions.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.professionButton,
                      profession === item && styles.professionButtonActive,
                    ]}
                    onPress={() => setProfession(item)}
                  >
                    <Text
                      style={[
                        styles.professionText,
                        profession === item && styles.professionTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Quantity"
                placeholderTextColor="#888"
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />

              <TouchableOpacity style={styles.addButton} onPress={saveNewTool}>
                <Text style={styles.addButtonText}>Add To Warehouse</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Tools</Text>

          {toolResults.map((tool, index) => (
            <View key={tool.id || index} style={styles.card}>
              <Text style={styles.cardTitle}>{tool.name}</Text>
              <Text style={styles.text}>Quantity: {tool.quantity || "0"}</Text>
              <Text style={styles.text}>Status: {tool.status || "Unknown"}</Text>
              <Text style={styles.text}>
                Worker: {tool.borrowedBy || tool.holder || "Storage"}
              </Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>Warehouse</Text>

          {warehouseResults.map(([toolName, stockQuantity]) => (
            <View key={toolName} style={styles.card}>
              <Text style={styles.cardTitle}>{toolName}</Text>
              <Text style={styles.text}>Stock: {String(stockQuantity)}</Text>
            </View>
          ))}

          <Text style={styles.sectionTitle}>History</Text>

          {historyResults.map((log, index) => (
            <View key={log.id || index} style={styles.card}>
              <Text style={styles.cardTitle}>{log.message}</Text>
              <Text style={styles.text}>
                {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
              </Text>
            </View>
          ))}
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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

  input: {
    backgroundColor: "#111c34",
    color: "white",
    padding: 18,
    borderRadius: 18,
    fontSize: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    color: "#ff6b00",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 10,
  },

  quickAddCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },

  label: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  professionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  professionButton: {
    backgroundColor: "#020b1f",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#374151",
  },

  professionButtonActive: {
    backgroundColor: "#ff6b00",
    borderColor: "#ff6b00",
  },

  professionText: {
    color: "#d1d5db",
    fontSize: 15,
    fontWeight: "bold",
  },

  professionTextActive: {
    color: "white",
  },

  addButton: {
    backgroundColor: "#ff6b00",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  cardTitle: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
  },

  text: {
    color: "#d1d5db",
    fontSize: 15,
    marginBottom: 4,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 14,
  },

  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 60,
  },

  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});