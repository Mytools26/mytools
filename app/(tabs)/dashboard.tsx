import { router } from "expo-router";
import React from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useToolStore } from "../../toolStore";
import { exportPdf } from "../utils/pdf";

export default function DashboardScreen() {
  const tools = useToolStore((state) => state.tools);
  const warehouseStock = useToolStore((state) => state.warehouseStock);
  const historyLogs = useToolStore((state) => state.historyLogs);

  const totalTools = tools.length;

  const warehouseItems = Object.keys(warehouseStock).filter(
    (toolName) => Number(warehouseStock[toolName] || 0) > 0
  ).length;

  const borrowedTools = tools.filter(
    (tool) => tool.status === "In Use" || tool.borrowedBy || tool.holder
  ).length;

  const availableTools = tools.filter(
    (tool) => tool.status === "Available"
  ).length;

  const missingTools = tools.filter(
    (tool) => tool.status === "Missing"
  ).length;

  const brokenTools = tools.filter(
    (tool) => tool.status === "Broken"
  ).length;

  const workers = new Set(
    tools
      .map((tool) => tool.borrowedBy || tool.holder)
      .filter(Boolean)
  ).size;

  const lowStockTools = tools.filter((tool) => {
    const quantity = Number(tool.quantity || 0);
    return quantity > 0 && quantity <= 2;
  });

  const problemTools = tools.filter(
    (tool) => tool.status === "Missing" || tool.status === "Broken"
  );

  const exportCompanyPdf = async () => {
    const warehouseRows = Object.entries(warehouseStock)
      .filter(([, quantity]) => Number(quantity || 0) > 0)
      .map(
        ([toolName, quantity], index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${toolName}</td>
            <td>${quantity}</td>
          </tr>
        `
      )
      .join("");

    const assignedRows = tools
      .map(
        (tool, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${tool.name}</td>
            <td>${tool.quantity || "0"}</td>
            <td>${tool.status || ""}</td>
            <td>${tool.borrowedBy || tool.holder || "Storage"}</td>
            <td>${tool.location || ""}</td>
          </tr>
        `
      )
      .join("");

    const problemRows = problemTools
      .map(
        (tool, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${tool.name}</td>
            <td>${tool.quantity || "0"}</td>
            <td>${tool.status}</td>
            <td>${tool.borrowedBy || tool.holder || ""}</td>
            <td>${tool.location || ""}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h1>MyTools - Company Inventory Report</h1>

          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>

          <h2>Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td><strong>Assigned Items</strong></td><td>${totalTools}</td></tr>
            <tr><td><strong>Warehouse Items</strong></td><td>${warehouseItems}</td></tr>
            <tr><td><strong>Borrowed</strong></td><td>${borrowedTools}</td></tr>
            <tr><td><strong>Available</strong></td><td>${availableTools}</td></tr>
            <tr><td><strong>Workers</strong></td><td>${workers}</td></tr>
            <tr><td><strong>Missing</strong></td><td>${missingTools}</td></tr>
            <tr><td><strong>Broken</strong></td><td>${brokenTools}</td></tr>
            <tr><td><strong>History Logs</strong></td><td>${historyLogs.length}</td></tr>
          </table>

          <h2>Warehouse Stock</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #333; padding: 8px;">#</th>
              <th style="border: 1px solid #333; padding: 8px;">Tool</th>
              <th style="border: 1px solid #333; padding: 8px;">Total Stock</th>
            </tr>
            ${warehouseRows || `<tr><td colspan="3">No warehouse stock</td></tr>`}
          </table>

          <h2>Assigned / Inventory Tools</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #333; padding: 8px;">#</th>
              <th style="border: 1px solid #333; padding: 8px;">Tool</th>
              <th style="border: 1px solid #333; padding: 8px;">Qty</th>
              <th style="border: 1px solid #333; padding: 8px;">Status</th>
              <th style="border: 1px solid #333; padding: 8px;">Worker</th>
              <th style="border: 1px solid #333; padding: 8px;">Location</th>
            </tr>
            ${assignedRows || `<tr><td colspan="6">No assigned tools</td></tr>`}
          </table>

          <h2>Missing / Broken Tools</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="border: 1px solid #333; padding: 8px;">#</th>
              <th style="border: 1px solid #333; padding: 8px;">Tool</th>
              <th style="border: 1px solid #333; padding: 8px;">Qty</th>
              <th style="border: 1px solid #333; padding: 8px;">Status</th>
              <th style="border: 1px solid #333; padding: 8px;">Worker</th>
              <th style="border: 1px solid #333; padding: 8px;">Location</th>
            </tr>
            ${problemRows || `<tr><td colspan="6">No missing or broken tools</td></tr>`}
          </table>
        </body>
      </html>
    `;

    await exportPdf(html);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.logo}>MyTools</Text>

      <Text style={styles.subtitle}>
        Professional Tool Management
      </Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Company Dashboard</Text>

        <Text style={styles.heroText}>
          Manage workers, tools, assignments, warehouse stock and history
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalTools}</Text>
          <Text style={styles.statLabel}>Assigned Items</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{warehouseItems}</Text>
          <Text style={styles.statLabel}>Warehouse Items</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{borrowedTools}</Text>
          <Text style={styles.statLabel}>Borrowed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{availableTools}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{workers}</Text>
          <Text style={styles.statLabel}>Workers</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{missingTools}</Text>
          <Text style={styles.statLabel}>Missing</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{brokenTools}</Text>
          <Text style={styles.statLabel}>Broken</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{historyLogs.length}</Text>
          <Text style={styles.statLabel}>History Logs</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Needs Attention</Text>

      <View style={styles.attentionCard}>
        {problemTools.length === 0 && lowStockTools.length === 0 ? (
          <Text style={styles.goodText}>
            Everything looks good. No missing, broken or low stock tools.
          </Text>
        ) : (
          <>
            {problemTools.map((tool, index) => (
              <Text key={tool.id || index} style={styles.problemText}>
                {tool.status}: {tool.name}
              </Text>
            ))}

            {lowStockTools.map((tool, index) => (
              <Text key={tool.id || `low-${index}`} style={styles.warningText}>
                Low stock: {tool.name} — Qty {tool.quantity}
              </Text>
            ))}
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/warehouse")}
      >
        <Text style={styles.cardTitle}>Warehouse Stock</Text>
        <Text style={styles.cardText}>
          Set total quantities for all tools in storage
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/search")}
      >
        <Text style={styles.cardTitle}>Global Search</Text>
        <Text style={styles.cardText}>
          Search tools, workers, locations, stock and history
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/history")}
      >
        <Text style={styles.cardTitle}>History</Text>
        <Text style={styles.cardText}>
          View assignments, returns, updates and warehouse changes
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/(tabs)")}
      >
        <Text style={styles.cardTitle}>Inventory</Text>
        <Text style={styles.cardText}>Browse and edit all tools</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/borrowed")}
      >
        <Text style={styles.cardTitle}>Assignments</Text>
        <Text style={styles.cardText}>
          See worker groups and borrowed tools
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/add-tool")}
      >
        <Text style={styles.cardTitle}>Add / Assign Tools</Text>
        <Text style={styles.cardText}>
          Add multiple tools and quantities at once
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={exportCompanyPdf}>
        <Text style={styles.cardTitle}>PDF Export</Text>
        <Text style={styles.cardText}>
          Export full company inventory report
        </Text>
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

  logo: {
    color: "white",
    fontSize: 52,
    fontWeight: "bold",
    marginTop: 60,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 20,
    marginBottom: 30,
  },

  heroCard: {
    backgroundColor: "#ff6b00",
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
  },

  heroTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },

  heroText: {
    color: "white",
    fontSize: 18,
    marginTop: 10,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },

  statCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 18,
    width: "48%",
  },

  statNumber: {
    color: "#ff6b00",
    fontSize: 34,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#d1d5db",
    fontSize: 16,
    marginTop: 6,
  },

  sectionTitle: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },

  attentionCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 20,
    marginBottom: 22,
  },

  goodText: {
    color: "#86efac",
    fontSize: 17,
    fontWeight: "bold",
  },

  problemText: {
    color: "#f87171",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  warningText: {
    color: "#fbbf24",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },

  cardTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },

  cardText: {
    color: "#d1d5db",
    fontSize: 17,
  },
});