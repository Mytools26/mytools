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

const getToolIcon = (image?: string) => {
  switch (image) {
    case "drill":
      return "🛠️";
    case "screwdriver":
      return "🪛";
    case "battery":
      return "🔋";
    case "ladder":
      return "🪜";
    case "tester":
      return "📟";
    case "cutter":
      return "✂️";
    case "grinder":
      return "⚙️";
    case "saw":
      return "🪚";
    case "light":
      return "💡";
    case "safety":
      return "🦺";
    case "electrical":
      return "⚡";
    default:
      return "🔧";
  }
};

const statuses = ["Available", "In Use", "Missing", "Broken"];

export default function InventoryScreen() {
  const tools = useToolStore((state) => state.tools);
  const updateTool = useToolStore((state) => state.updateTool);
  const deleteTool = useToolStore((state) => state.deleteTool);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState("");

  const filteredTools = tools.filter((tool) => {
    const text = search.toLowerCase();

    return (
      tool.name?.toLowerCase().includes(text) ||
      tool.profession?.toLowerCase().includes(text) ||
      tool.category?.toLowerCase().includes(text) ||
      tool.location?.toLowerCase().includes(text) ||
      tool.borrowedBy?.toLowerCase().includes(text) ||
      tool.holder?.toLowerCase().includes(text) ||
      tool.status?.toLowerCase().includes(text)
    );
  });

  const handleDelete = (toolId?: string, toolName?: string) => {
    if (!toolId) return;

    Alert.alert("Delete Tool", `Delete ${toolName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTool(toolId),
      },
    ]);
  };

  const startEdit = (toolId: string, quantity: string) => {
    setEditingId(toolId);
    setNewQuantity(quantity || "");
  };

  const saveEdit = (tool: any, toolId: string) => {
    updateTool(toolId, {
      ...tool,
      id: toolId,
      quantity: newQuantity,
    });

    setEditingId(null);
    setNewQuantity("");
  };

  const changeStatus = (tool: any, toolId: string, status: string) => {
    updateTool(toolId, {
      ...tool,
      id: toolId,
      status,
      holder: status === "Available" ? "" : tool.holder,
      borrowedBy: status === "Available" ? "" : tool.borrowedBy,
      location: status === "Available" ? "Warehouse" : tool.location,
    });
  };

  const grouped = filteredTools.reduce((acc, tool) => {
    const profession = tool.profession || "Other";
    const category = tool.category || "General";
    const brand = tool.brand || "No Brand";

    if (!acc[profession]) acc[profession] = {};
    if (!acc[profession][category]) acc[profession][category] = {};
    if (!acc[profession][category][brand]) {
      acc[profession][category][brand] = [];
    }

    acc[profession][category][brand].push(tool);

    return acc;
  }, {} as Record<string, Record<string, Record<string, typeof tools>>>);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Inventory</Text>

      <TextInput
        placeholder="Search tool, worker, location, status..."
        placeholderTextColor="#888"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-tool")}
      >
        <Text style={styles.addButtonText}>+ Add / Assign Tools</Text>
      </TouchableOpacity>

      {filteredTools.length === 0 ? (
        <Text style={styles.emptyText}>
          {tools.length === 0 ? "No tools yet" : "No results found"}
        </Text>
      ) : (
        Object.entries(grouped).map(([profession, categories]) => (
          <View key={profession} style={styles.card}>
            <Text style={styles.profession}>{profession}</Text>

            {Object.entries(categories).map(([category, brands]) => (
              <View key={category} style={styles.section}>
                <Text style={styles.category}>{category}</Text>

                {Object.entries(brands).map(([brand, brandTools]) => (
                  <View key={brand} style={styles.brandCard}>
                    {brand !== "No Brand" ? (
                      <Text style={styles.brand}>{brand}</Text>
                    ) : null}

                    {brandTools.map((tool, index) => {
                      const realId = tool.id || `old-tool-${index}`;
                      const isEditing = editingId === realId;

                      return (
                        <TouchableOpacity
                          key={realId}
                          style={styles.compactToolRow}
                          activeOpacity={0.85}
                          onPress={() => {
                            if (!isEditing) {
                              startEdit(realId, tool.quantity || "");
                            }
                          }}
                        >
                          <View style={styles.compactLeft}>
                            <Text style={styles.compactIcon}>
                              {getToolIcon(tool.image)}
                            </Text>

                            <View style={styles.compactTextBox}>
                              <Text style={styles.compactToolName}>
                                {tool.name}
                              </Text>

                              <Text style={styles.compactMeta}>
                                {(tool.borrowedBy ||
                                  tool.holder ||
                                  "Storage") +
                                  " · " +
                                  (tool.location || "No location")}
                              </Text>

                              <Text
                                style={[
                                  styles.statusText,
                                  tool.status === "Missing" &&
                                    styles.statusMissing,
                                  tool.status === "Broken" &&
                                    styles.statusBroken,
                                  tool.status === "Available" &&
                                    styles.statusAvailable,
                                  tool.status === "In Use" &&
                                    styles.statusInUse,
                                ]}
                              >
                                Status: {tool.status || "Unknown"}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.compactRight}>
                            {isEditing ? (
                              <TextInput
                                style={styles.compactInput}
                                value={newQuantity}
                                onChangeText={setNewQuantity}
                                keyboardType="numeric"
                              />
                            ) : (
                              <Text style={styles.compactQty}>
                                x{tool.quantity || "0"}
                              </Text>
                            )}

                            {isEditing ? (
                              <View style={styles.editPanel}>
                                <View style={styles.compactButtons}>
                                  <TouchableOpacity
                                    style={styles.saveMiniButton}
                                    onPress={() => saveEdit(tool, realId)}
                                  >
                                    <Text style={styles.miniButtonText}>
                                      Save
                                    </Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={styles.deleteMiniButton}
                                    onPress={() =>
                                      handleDelete(realId, tool.name)
                                    }
                                  >
                                    <Text style={styles.miniButtonText}>
                                      Delete
                                    </Text>
                                  </TouchableOpacity>
                                </View>

                                <View style={styles.statusRow}>
                                  {statuses.map((status) => (
                                    <TouchableOpacity
                                      key={status}
                                      style={[
                                        styles.statusButton,
                                        tool.status === status &&
                                          styles.statusButtonActive,
                                      ]}
                                      onPress={() =>
                                        changeStatus(tool, realId, status)
                                      }
                                    >
                                      <Text style={styles.statusButtonText}>
                                        {status}
                                      </Text>
                                    </TouchableOpacity>
                                  ))}
                                </View>
                              </View>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            ))}
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
    fontSize: 44,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 18,
  },

  searchInput: {
    backgroundColor: "#111c34",
    color: "white",
    padding: 18,
    borderRadius: 18,
    fontSize: 18,
    marginBottom: 16,
  },

  addButton: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 24,
  },

  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 26,
    padding: 18,
    marginBottom: 22,
  },

  profession: {
    color: "#ff6b00",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 18,
  },

  section: {
    marginBottom: 18,
  },

  category: {
    color: "#9ca3af",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },

  brandCard: {
    backgroundColor: "#1a2747",
    borderRadius: 18,
    padding: 12,
    marginBottom: 14,
  },

  brand: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  compactToolRow: {
    backgroundColor: "#111c34",
    borderRadius: 16,
    padding: 12,
    marginBottom: 9,
  },

  compactLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  compactIcon: {
    fontSize: 23,
    marginRight: 10,
  },

  compactTextBox: {
    flex: 1,
  },

  compactToolName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  compactMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },

  statusAvailable: {
    color: "#86efac",
  },

  statusInUse: {
    color: "#60a5fa",
  },

  statusMissing: {
    color: "#fbbf24",
  },

  statusBroken: {
    color: "#f87171",
  },

  compactRight: {
    marginTop: 10,
    alignItems: "flex-end",
  },

  compactQty: {
    color: "#ff6b00",
    fontSize: 20,
    fontWeight: "bold",
  },

  compactInput: {
    backgroundColor: "#020b1f",
    color: "white",
    width: 68,
    padding: 8,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 17,
    borderWidth: 1,
    borderColor: "#374151",
  },

  editPanel: {
    width: "100%",
    marginTop: 8,
  },

  compactButtons: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },

  saveMiniButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteMiniButton: {
    flex: 1,
    backgroundColor: "#991b1b",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  miniButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  statusButton: {
    backgroundColor: "#020b1f",
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: "#374151",
  },

  statusButtonActive: {
    backgroundColor: "#ff6b00",
    borderColor: "#ff6b00",
  },

  statusButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});