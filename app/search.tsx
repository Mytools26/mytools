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
  if (name.includes("cable") || name.includes("wire") || name.includes("crimp")) return "CableTools";
  if (name.includes("glove") || name.includes("helmet") || name.includes("glasses")) return "SafetyEquipment";
  if (name.includes("light")) return "Lighting";

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
  if (name.includes("light")) return "light";

  return "tool";
};

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

const getLogColor = (type?: string) => {
  switch (type) {
    case "ASSIGN":
      return "#2563eb";
    case "RETURN":
      return "#16a34a";
    case "DELETE":
      return "#7f1d1d";
    case "UPDATE":
      return "#f59e0b";
    case "WAREHOUSE":
      return "#ff6b00";
    case "CUSTOM_TOOL":
      return "#7c3aed";
    case "ADD":
      return "#0f766e";
    default:
      return "#374151";
  }
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
          log.toolName?.toLowerCase().includes(text) ||
          log.workerName?.toLowerCase().includes(text) ||
          log.location?.toLowerCase().includes(text) ||
          log.type?.toLowerCase().includes(text)
        );
      })
    : [];

  const workerResults = text
    ? Array.from(
        new Set(
          tools
            .map((tool) => tool.borrowedBy || tool.holder)
            .filter(Boolean)
        )
      ).filter((worker) => worker.toLowerCase().includes(text))
    : [];

  const hasResults =
    toolResults.length > 0 ||
    warehouseResults.length > 0 ||
    historyResults.length > 0 ||
    workerResults.length > 0;

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
      <Text style={styles.title}>Search</Text>

      <Text style={styles.subtitle}>
        Find tools, workers, warehouse stock and history
      </Text>

      <TextInput
        placeholder="Search tool, worker, location, status..."
        placeholderTextColor="#888"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />

      {!search.trim() ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Start typing</Text>
          <Text style={styles.emptyText}>
            Search by tool name, worker, project, status or history.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNumber}>{toolResults.length}</Text>
              <Text style={styles.summaryLabel}>Tools</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryNumber}>{workerResults.length}</Text>
              <Text style={styles.summaryLabel}>Workers</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryNumber}>{historyResults.length}</Text>
              <Text style={styles.summaryLabel}>Logs</Text>
            </View>
          </View>

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

          {toolResults.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Tools</Text>

              {toolResults.map((tool, index) => {
                const realId = tool.id || `old-tool-${index}`;

                return (
                  <TouchableOpacity
                    key={realId}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/item-details",
                        params: { toolId: realId },
                      } as any)
                    }
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardTextBox}>
                        <Text style={styles.cardTitle}>{tool.name}</Text>

                        <Text style={styles.text}>
                          {(tool.borrowedBy || tool.holder || "Storage") +
                            " · " +
                            (tool.location || "No location")}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(tool.status) },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {tool.status || "Unknown"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.text}>Qty: {tool.quantity || "0"}</Text>

                    <Text style={styles.text}>
                      {tool.profession || "Other"} · {tool.category || "General"}
                    </Text>

                    <Text style={styles.linkText}>Tap to open tool details</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : null}

          {workerResults.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Workers</Text>

              {workerResults.map((workerName) => {
                const workerTools = tools.filter(
                  (tool) =>
                    tool.borrowedBy === workerName || tool.holder === workerName
                );

                return (
                  <TouchableOpacity
                    key={workerName}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/worker-details",
                        params: { workerName },
                      } as any)
                    }
                  >
                    <Text style={styles.cardTitle}>{workerName}</Text>

                    <Text style={styles.text}>
                      Assigned tools: {workerTools.length}
                    </Text>

                    <Text style={styles.linkText}>Open worker details</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : null}

          {warehouseResults.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Warehouse</Text>

              {warehouseResults.map(([toolName, stockQuantity]) => (
                <TouchableOpacity
                  key={toolName}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => router.push("/warehouse")}
                >
                  <Text style={styles.cardTitle}>{toolName}</Text>

                  <Text style={styles.text}>Stock: {String(stockQuantity)}</Text>

                  <Text style={styles.linkText}>Open warehouse</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : null}

          {historyResults.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>History</Text>

              {historyResults.slice(0, 20).map((log, index) => (
                <TouchableOpacity
                  key={log.id || index}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => router.push("/history")}
                >
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {log.message}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getLogColor(log.type) },
                      ]}
                    >
                      <Text style={styles.badgeText}>{log.type}</Text>
                    </View>
                  </View>

                  <Text style={styles.text}>
                    Tool: {log.toolName || "Unknown"}
                  </Text>

                  {log.workerName ? (
                    <Text style={styles.text}>Worker: {log.workerName}</Text>
                  ) : null}

                  <Text style={styles.text}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                  </Text>

                  <Text style={styles.linkText}>Open history</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : null}
        </>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
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

  input: {
    backgroundColor: "#111c34",
    color: "white",
    padding: 15,
    borderRadius: 16,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  emptyBox: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  emptyTitle: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 6,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 14,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: "#111c34",
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  summaryNumber: {
    color: "#ff6b00",
    fontSize: 24,
    fontWeight: "bold",
  },

  summaryLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 3,
  },

  sectionTitle: {
    color: "#ff6b00",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 8,
  },

  quickAddCard: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },

  professionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  professionButton: {
    backgroundColor: "#020b1f",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },

  professionButtonActive: {
    backgroundColor: "#ff6b00",
    borderColor: "#ff6b00",
  },

  professionText: {
    color: "#d1d5db",
    fontSize: 13,
    fontWeight: "bold",
  },

  professionTextActive: {
    color: "white",
  },

  addButton: {
    backgroundColor: "#ff6b00",
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
  },

  addButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "flex-start",
    marginBottom: 6,
  },

  cardTextBox: {
    flex: 1,
  },

  cardTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 6,
    flex: 1,
  },

  text: {
    color: "#d1d5db",
    fontSize: 13,
    marginBottom: 3,
  },

  linkText: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 6,
  },

  statusBadge: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },

  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },

  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 16,
  },

  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});