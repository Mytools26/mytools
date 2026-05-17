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
    (tool) =>
      tool.borrowedBy === workerName ||
      tool.holder === workerName
  );

  const location =
    workerTools.find((tool) => tool.location)?.location ||
    "No location";

  const exportWorkerPdf = async () => {
    if (workerTools.length === 0) {
      Alert.alert(
        "No tools",
        "This worker has no assigned tools."
      );
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
            <p>
              <strong>Worker Signature:</strong>
              __________________________
            </p>

            <p>
              <strong>Manager Signature:</strong>
              _________________________
            </p>
          </div>
        </body>
      </html>
    `;

    await exportPdf(html);
  };

  const handleDelete = (
    toolId?: string,
    toolName?: string
  ) => {
    if (!toolId) return;

    Alert.alert(
      "Delete Tool",
      `Remove ${toolName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTool(toolId),
        },
      ]
    );
  };

  const handleReturn = (
    toolId: string,
    toolName: string
  ) => {
    Alert.alert(
      "Return Tool",
      `Return ${toolName} to warehouse?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Return",
          onPress: () => returnTool(toolId),
        },
      ]
    );
  };

  const handleReturnAll = () => {
    if (workerTools.length === 0) return;

    Alert.alert(
      "Return All Tools",
      `Return all tools from ${workerNameText} to warehouse?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Return All",
          onPress: () => {
            workerTools.forEach((tool, index) => {
              const realId =
                tool.id || `old-tool-${index}`;

              returnTool(realId);
            });
          },
        },
      ]
    );
  };

  const startEdit = (
    toolId: string,
    quantity: string
  ) => {
    setEditingId(toolId);
    setNewQuantity(quantity || "");
  };

  const saveEdit = (tool: any) => {
    if (!editingId) return;

    updateTool(editingId, {
      ...tool,
      quantity: newQuantity,
    });

    setEditingId(null);
    setNewQuantity("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {workerNameText}
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>
          Project / Location
        </Text>

        <Text style={styles.summaryValue}>
          {location}
        </Text>

        <Text style={styles.summaryLabel}>
          Assigned tools
        </Text>

        <Text style={styles.summaryValue}>
          {workerTools.length}
        </Text>

        <TouchableOpacity
          style={styles.pdfButton}
          onPress={exportWorkerPdf}
        >
          <Text style={styles.pdfButtonText}>
            Export PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.returnAllButton}
          onPress={handleReturnAll}
        >
          <Text style={styles.pdfButtonText}>
            Return All Tools
          </Text>
        </TouchableOpacity>
      </View>

      {workerTools.length === 0 ? (
        <Text style={styles.emptyText}>
          No tools assigned
        </Text>
      ) : (
        <View style={styles.listCard}>
          {workerTools.map((tool, index) => {
            const realId =
              tool.id || `old-tool-${index}`;

            const isEditing =
              editingId === realId;

            return (
              <View
                key={realId}
                style={styles.toolCard}
              >
                <View style={styles.toolRow}>
                  <Text style={styles.toolName}>
                    {tool.name}
                  </Text>

                  {isEditing ? (
                    <TextInput
                      style={styles.quantityInput}
                      value={newQuantity}
                      onChangeText={setNewQuantity}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.quantity}>
                      x{tool.quantity || "0"}
                    </Text>
                  )}
                </View>

                {isEditing ? (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() =>
                        saveEdit({
                          ...tool,
                          id: realId,
                        })
                      }
                    >
                      <Text style={styles.actionText}>
                        Save
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditingId(null);
                        setNewQuantity("");
                      }}
                    >
                      <Text style={styles.actionText}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        startEdit(
                          realId,
                          tool.quantity || ""
                        )
                      }
                    >
                      <Text style={styles.actionText}>
                        Edit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.returnButton}
                      onPress={() =>
                        handleReturn(
                          realId,
                          tool.name
                        )
                      }
                    >
                      <Text style={styles.actionText}>
                        Return
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDelete(
                          realId,
                          tool.name
                        )
                      }
                    >
                      <Text style={styles.actionText}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
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
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 18,
  },

  summaryCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },

  summaryLabel: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 6,
  },

  summaryValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  pdfButton: {
    backgroundColor: "#ff6b00",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },

  returnAllButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 12,
  },

  pdfButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  listCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 18,
    marginBottom: 60,
  },

  toolCard: {
    borderBottomColor: "#1f2937",
    borderBottomWidth: 1,
    paddingVertical: 14,
  },

  toolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  toolName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },

  quantity: {
    color: "#f97316",
    fontSize: 20,
    fontWeight: "bold",
  },

  quantityInput: {
    backgroundColor: "#020b1f",
    color: "white",
    width: 80,
    padding: 10,
    borderRadius: 12,
    fontSize: 18,
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

  actionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
  },
});