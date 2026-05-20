import { useLocalSearchParams } from "expo-router";
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
import { exportPdf } from "./utils/pdf";

export default function WorkerDetailsScreen() {
  const { workerName } = useLocalSearchParams();

  const tools = useToolStore((state) => state.tools || []);
  const deleteTool = useToolStore((state) => state.deleteTool);
  const updateTool = useToolStore((state) => state.updateTool);
  const returnTool = useToolStore((state) => state.returnTool);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState("");

  const workerNameText = String(workerName || "Unknown worker");

  const workerTools = tools.filter(
    (tool) => tool.borrowedBy === workerName || tool.holder === workerName
  );

  const location =
    workerTools.find((tool) => tool.location)?.location || "No location";

  const totalQuantity = workerTools.reduce(
    (sum, tool) => sum + Number(tool.quantity || 0),
    0
  );

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
          </tr>
        `
      )
      .join("");

    const html = `
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h1>MyTools - Worker Tool Report</h1>
          <p><strong>Worker:</strong> ${workerNameText}</p>
          <p><strong>Location / Project:</strong> ${location}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 24px;">
            <tr>
              <th style="border: 1px solid #333; padding: 8px;">#</th>
              <th style="border: 1px solid #333; padding: 8px;">Tool</th>
              <th style="border: 1px solid #333; padding: 8px;">Qty</th>
              <th style="border: 1px solid #333; padding: 8px;">Status</th>
            </tr>
            ${rows}
          </table>

          <div style="margin-top: 60px;">
            <p><strong>Worker Signature:</strong> __________________________</p>
            <p><strong>Manager Signature:</strong> _________________________</p>
          </div>
        </body>
      </html>
    `;

    await exportPdf(html);
  };

  const handleDelete = (toolId?: string, toolName?: string) => {
    if (!toolId) return;

    Alert.alert("Delete Tool", `Remove ${toolName}?`, [
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
      `Return all tools from ${workerNameText} to warehouse?`,
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
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{workerNameText}</Text>

      <Text style={styles.subtitle}>{location}</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{workerTools.length}</Text>
            <Text style={styles.summaryLabel}>Items</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>{totalQuantity}</Text>
            <Text style={styles.summaryLabel}>Total Qty</Text>
          </View>
        </View>

        <View style={styles.mainActions}>
          <TouchableOpacity style={styles.pdfButton} onPress={exportWorkerPdf}>
            <Text style={styles.mainActionText}>Export PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.returnAllButton}
            onPress={handleReturnAll}
          >
            <Text style={styles.mainActionText}>Return All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Assigned Tools</Text>

      {workerTools.length === 0 ? (
        <Text style={styles.emptyText}>No tools assigned</Text>
      ) : (
        <View style={styles.listCard}>
          {workerTools.map((tool, index) => {
            const realId = tool.id || `old-tool-${index}`;
            const isEditing = editingId === realId;

            return (
              <View key={realId} style={styles.toolCard}>
                <View style={styles.toolTopRow}>
                  <View style={styles.toolInfo}>
                    <Text style={styles.toolName}>{tool.name}</Text>

                    <Text style={styles.toolMeta}>
                      {tool.category || "General"} · {tool.status || "Unknown"}
                    </Text>
                  </View>

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
                      <Text style={styles.actionText}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditingId(null);
                        setNewQuantity("");
                      }}
                    >
                      <Text style={styles.actionText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => startEdit(realId, tool.quantity || "")}
                    >
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.returnButton}
                      onPress={() => handleReturn(realId, tool.name)}
                    >
                      <Text style={styles.actionText}>Return</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(realId, tool.name)}
                    >
                      <Text style={styles.actionText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
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
    marginTop: 4,
    marginBottom: 18,
  },

  summaryCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  summaryBox: {
    flex: 1,
    backgroundColor: "#020b1f",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#374151",
  },

  summaryNumber: {
    color: "#ff6b00",
    fontSize: 28,
    fontWeight: "bold",
  },

  summaryLabel: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 3,
  },

  mainActions: {
    flexDirection: "row",
    gap: 10,
  },

  pdfButton: {
    flex: 1,
    backgroundColor: "#ff6b00",
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
  },

  returnAllButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
  },

  mainActionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  sectionTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  listCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  toolCard: {
    backgroundColor: "#020b1f",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  toolTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toolInfo: {
    flex: 1,
    marginRight: 10,
  },

  toolName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  toolMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 3,
  },

  quantityBadge: {
    backgroundColor: "#111c34",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },

  quantityText: {
    color: "#ff6b00",
    fontSize: 15,
    fontWeight: "bold",
  },

  quantityInput: {
    backgroundColor: "#111c34",
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
    marginTop: 10,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
  },

  returnButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#7f1d1d",
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#374151",
    paddingVertical: 9,
    borderRadius: 11,
    alignItems: "center",
  },

  actionText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
  },
});