import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";

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
import { exportPdf } from "./utils/pdf";

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

const getToolEmoji = (toolName: string) => {
  const name = toolName.toLowerCase();

  if (name.includes("drill")) return "🛠️";
  if (name.includes("screwdriver")) return "🪛";
  if (name.includes("battery")) return "🔋";
  if (name.includes("ladder")) return "🪜";
  if (name.includes("tester")) return "📟";
  if (name.includes("grinder")) return "⚙️";
  if (name.includes("saw")) return "🪚";
  if (name.includes("light")) return "💡";

  return "🔧";
};

export default function WorkerDetailsScreen() {
  const { workerName } = useLocalSearchParams();

  const tools = useToolStore((state) => state.tools || []);
  const deleteTool = useToolStore((state) => state.deleteTool);
  const updateTool = useToolStore((state) => state.updateTool);
  const returnTool = useToolStore((state) => state.returnTool);

  const workerNameText = String(workerName || "Unknown worker");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState("");

  const workerTools = useMemo(
    () =>
      tools.filter(
        (tool) =>
          tool.borrowedBy === workerNameText ||
          tool.holder === workerNameText
      ),
    [tools, workerNameText]
  );

  const location =
    workerTools.find((tool) => tool.location)?.location || "No location";

  const totalQuantity = workerTools.reduce(
    (sum, tool) => sum + Number(tool.quantity || 0),
    0
  );

  const brokenCount = workerTools.filter(
    (tool) => tool.status === "Broken"
  ).length;

  const missingCount = workerTools.filter(
    (tool) => tool.status === "Missing"
  ).length;

  const exportWorkerPdf = async () => {
    if (workerTools.length === 0) {
      Alert.alert("No tools", "This worker has no assigned tools.");
      return;
    }

    const rows = workerTools
      .map(
        (tool, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${tool.name}</td>
            <td>${tool.quantity || "0"}</td>
            <td>${tool.status || ""}</td>
            <td>${tool.location || ""}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h1>MyTools - Worker Report</h1>

          <p><strong>Worker:</strong> ${workerNameText}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

          <h2>Summary</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><strong>Tool Lines</strong></td><td>${workerTools.length}</td></tr>
            <tr><td><strong>Total Quantity</strong></td><td>${totalQuantity}</td></tr>
            <tr><td><strong>Broken</strong></td><td>${brokenCount}</td></tr>
            <tr><td><strong>Missing</strong></td><td>${missingCount}</td></tr>
          </table>

          <h2 style="margin-top: 30px;">Assigned Tools</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #333; padding: 8px;">#</th>
              <th style="border: 1px solid #333; padding: 8px;">Tool</th>
              <th style="border: 1px solid #333; padding: 8px;">Qty</th>
              <th style="border: 1px solid #333; padding: 8px;">Status</th>
              <th style="border: 1px solid #333; padding: 8px;">Location</th>
            </tr>
            ${rows}
          </table>

          <div style="margin-top: 70px;">
            <p><strong>Worker Signature:</strong> ______________________</p>
            <p><strong>Manager Signature:</strong> _____________________</p>
          </div>
        </body>
      </html>
    `;

    await exportPdf(html);
  };

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

  const handleReturn = (toolId: string, toolName: string) => {
    Alert.alert("Return Tool", `Return ${toolName} to warehouse?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Return",
        onPress: () => returnTool(toolId),
      },
    ]);
  };

  const handleReturnAll = () => {
    if (workerTools.length === 0) return;

    Alert.alert(
      "Return All Tools",
      `Return all tools from ${workerNameText}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Return All",
          onPress: () => {
            workerTools.forEach((tool, index) => {
              const realId = tool.id || `old-tool-${index}`;
              returnTool(realId);
            });
          },
        },
      ]
    );
  };

  const startEdit = (toolId: string, quantity: string) => {
    setEditingId(toolId);
    setNewQuantity(quantity || "");
  };

  const saveEdit = (tool: any, realId: string) => {
    updateTool(realId, {
      ...tool,
      id: realId,
      quantity: newQuantity,
    });

    setEditingId(null);
    setNewQuantity("");

    Alert.alert("Saved", "Quantity updated");
  };

  const openAddTools = () => {
    router.push({
      pathname: "/add-tool",
      params: {
        workerName: workerNameText,
        location,
      },
    } as any);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{workerNameText}</Text>

      <Text style={styles.subtitle}>{location}</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Worker Overview</Text>

        <Text style={styles.heroText}>
          Assigned tools and project status
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{workerTools.length}</Text>
          <Text style={styles.statLabel}>Tool Lines</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalQuantity}</Text>
          <Text style={styles.statLabel}>Total Qty</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.problemNumber}>{brokenCount}</Text>
          <Text style={styles.statLabel}>Broken</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.warningNumber}>{missingCount}</Text>
          <Text style={styles.statLabel}>Missing</Text>
        </View>
      </View>

      <View style={styles.mainActions}>
        <TouchableOpacity style={styles.pdfButton} onPress={exportWorkerPdf}>
          <Text style={styles.mainButtonText}>Export PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.returnAllButton}
          onPress={handleReturnAll}
        >
          <Text style={styles.mainButtonText}>Return All</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.addToolsButton} onPress={openAddTools}>
        <Text style={styles.mainButtonText}>+ Add More Tools</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Assigned Tools</Text>

      {workerTools.length === 0 ? (
        <Text style={styles.emptyText}>No assigned tools</Text>
      ) : (
        workerTools.map((tool, index) => {
          const realId = tool.id || `old-tool-${index}`;
          const isEditing = editingId === realId;

          return (
            <View key={realId} style={styles.toolCard}>
              <View style={styles.toolTop}>
                <View style={styles.leftBox}>
                  <Text style={styles.toolEmoji}>{getToolEmoji(tool.name)}</Text>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.toolName}>{tool.name}</Text>

                    <Text style={styles.toolMeta}>
                      {tool.category || "General"} · {tool.brand || "No brand"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: getStatusColor(tool.status),
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {tool.status || "Unknown"}
                  </Text>
                </View>
              </View>

              <View style={styles.middleRow}>
                <Text style={styles.locationText}>
                  {tool.location || "No location"}
                </Text>

                {isEditing ? (
                  <TextInput
                    style={styles.quantityInput}
                    value={newQuantity}
                    onChangeText={setNewQuantity}
                    keyboardType="numeric"
                  />
                ) : (
                  <View style={styles.quantityBadge}>
                    <Text style={styles.quantityText}>
                      x{tool.quantity || "0"}
                    </Text>
                  </View>
                )}
              </View>

              {isEditing ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => saveEdit(tool, realId)}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingId(null);
                      setNewQuantity("");
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => startEdit(realId, tool.quantity || "")}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.returnButton}
                    onPress={() => handleReturn(realId, tool.name)}
                  >
                    <Text style={styles.buttonText}>Return</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(realId, tool.name)}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
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

  heroCard: {
    backgroundColor: "#ff6b00",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  heroTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  heroText: {
    color: "white",
    fontSize: 14,
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#111c34",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  statNumber: {
    color: "#ff6b00",
    fontSize: 28,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  warningNumber: {
    color: "#fbbf24",
    fontSize: 28,
    fontWeight: "bold",
  },

  problemNumber: {
    color: "#f87171",
    fontSize: 28,
    fontWeight: "bold",
  },

  mainActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },

  pdfButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  returnAllButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  addToolsButton: {
    backgroundColor: "#ff6b00",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 22,
  },

  mainButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  sectionTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
  },

  toolCard: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  toolTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  toolEmoji: {
    fontSize: 28,
    marginRight: 10,
  },

  toolName: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  toolMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },

  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  locationText: {
    color: "#d1d5db",
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  statusText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },

  quantityBadge: {
    backgroundColor: "#020b1f",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#374151",
  },

  quantityText: {
    color: "#ff6b00",
    fontSize: 14,
    fontWeight: "bold",
  },

  quantityInput: {
    backgroundColor: "#020b1f",
    color: "white",
    width: 74,
    padding: 9,
    borderRadius: 12,
    fontSize: 16,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  returnButton: {
    flex: 1,
    backgroundColor: "#16a34a",
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

  saveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#374151",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
});