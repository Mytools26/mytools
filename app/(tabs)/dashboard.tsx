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
  const tools = useToolStore((state) => state.tools || []);
  const warehouseStock = useToolStore((state) => state.warehouseStock || {});
  const historyLogs = useToolStore((state) => state.historyLogs || []);

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
    tools.map((tool) => tool.borrowedBy || tool.holder).filter(Boolean)
  ).size;

  const lowStockTools = tools.filter((tool) => {
    const quantity = Number(tool.quantity || 0);
    return quantity > 0 && quantity <= 2;
  });

  const problemTools = tools.filter(
    (tool) => tool.status === "Missing" || tool.status === "Broken"
  );

  const recentLogs = historyLogs.slice(0, 5);

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
          <table style="width:100%; border-collapse:collapse;">
            <tr><td><strong>Total Items</strong></td><td>${totalTools}</td></tr>
            <tr><td><strong>Warehouse Items</strong></td><td>${warehouseItems}</td></tr>
            <tr><td><strong>Borrowed</strong></td><td>${borrowedTools}</td></tr>
            <tr><td><strong>Available</strong></td><td>${availableTools}</td></tr>
            <tr><td><strong>Workers</strong></td><td>${workers}</td></tr>
            <tr><td><strong>Missing</strong></td><td>${missingTools}</td></tr>
            <tr><td><strong>Broken</strong></td><td>${brokenTools}</td></tr>
            <tr><td><strong>Logs</strong></td><td>${historyLogs.length}</td></tr>
          </table>

          <h2>Warehouse Stock</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <th style="border:1px solid #333; padding:8px;">#</th>
              <th style="border:1px solid #333; padding:8px;">Tool</th>
              <th style="border:1px solid #333; padding:8px;">Stock</th>
            </tr>
            ${warehouseRows || `<tr><td colspan="3">No warehouse stock</td></tr>`}
          </table>

          <h2>Assigned Tools</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <th style="border:1px solid #333; padding:8px;">#</th>
              <th style="border:1px solid #333; padding:8px;">Tool</th>
              <th style="border:1px solid #333; padding:8px;">Qty</th>
              <th style="border:1px solid #333; padding:8px;">Status</th>
              <th style="border:1px solid #333; padding:8px;">Worker</th>
              <th style="border:1px solid #333; padding:8px;">Location</th>
            </tr>
            ${assignedRows || `<tr><td colspan="6">No assigned tools</td></tr>`}
          </table>

          <h2>Broken / Missing Tools</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <th style="border:1px solid #333; padding:8px;">#</th>
              <th style="border:1px solid #333; padding:8px;">Tool</th>
              <th style="border:1px solid #333; padding:8px;">Qty</th>
              <th style="border:1px solid #333; padding:8px;">Status</th>
              <th style="border:1px solid #333; padding:8px;">Worker</th>
              <th style="border:1px solid #333; padding:8px;">Location</th>
            </tr>
            ${problemRows || `<tr><td colspan="6">No broken or missing tools</td></tr>`}
          </table>
        </body>
      </html>
    `;

    await exportPdf(html);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.logo}>MyTools</Text>

      <Text style={styles.subtitle}>Professional Tool Management</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Company Dashboard</Text>

        <Text style={styles.heroText}>
          Tools, workers, stock and movement tracking
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalTools}</Text>
          <Text style={styles.statLabel}>Items</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{warehouseItems}</Text>
          <Text style={styles.statLabel}>Warehouse</Text>
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
          <Text style={styles.statNumber}>{historyLogs.length}</Text>
          <Text style={styles.statLabel}>Logs</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Needs Attention</Text>

      <View style={styles.attentionCard}>
        {problemTools.length === 0 && lowStockTools.length === 0 ? (
          <Text style={styles.goodText}>Everything looks good.</Text>
        ) : (
          <>
            {problemTools.slice(0, 4).map((tool, index) => (
              <Text key={tool.id || index} style={styles.problemText}>
                {tool.status}: {tool.name}
              </Text>
            ))}

            {lowStockTools.slice(0, 4).map((tool, index) => (
              <Text key={`low-${index}`} style={styles.warningText}>
                Low stock: {tool.name} — Qty {tool.quantity}
              </Text>
            ))}
          </>
        )}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/warehouse")}
        >
          <Text style={styles.actionTitle}>Warehouse</Text>
          <Text style={styles.actionText}>Stock control</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/search")}
        >
          <Text style={styles.actionTitle}>Search</Text>
          <Text style={styles.actionText}>Find anything</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/scan")}
        >
          <Text style={styles.actionTitle}>Scan Tool</Text>
          <Text style={styles.actionText}>QR / Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/history")}
        >
          <Text style={styles.actionTitle}>History</Text>
          <Text style={styles.actionText}>Movements</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push("/borrowed")}
        >
          <Text style={styles.actionTitle}>Workers</Text>
          <Text style={styles.actionText}>Assignments</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/add-tool")}
      >
        <Text style={styles.primaryButtonText}>+ Add / Assign Tools</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={exportCompanyPdf}>
        <Text style={styles.secondaryButtonText}>Export Company PDF</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Activity</Text>

      <View style={styles.activityCard}>
        {recentLogs.length === 0 ? (
          <Text style={styles.activityEmpty}>No recent activity</Text>
        ) : (
          recentLogs.map((log) => (
            <View key={log.id} style={styles.activityRow}>
              <Text style={styles.activityType}>{log.type}</Text>

              <Text style={styles.activityText} numberOfLines={1}>
                {log.message}
              </Text>
            </View>
          ))
        )}
      </View>

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

  logo: {
    color: "white",
    fontSize: 42,
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
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
  },

  heroTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  heroText: {
    color: "white",
    fontSize: 15,
    marginTop: 6,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    backgroundColor: "#111c34",
    borderRadius: 16,
    padding: 14,
    width: "48%",
    marginBottom: 10,
  },

  statNumber: {
    color: "#ff6b00",
    fontSize: 28,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#d1d5db",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },

  sectionTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 4,
  },

  attentionCard: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },

  goodText: {
    color: "#86efac",
    fontSize: 15,
    fontWeight: "bold",
  },

  problemText: {
    color: "#f87171",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
  },

  warningText: {
    color: "#fbbf24",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  actionCard: {
    backgroundColor: "#111c34",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 10,
  },

  actionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },

  actionText: {
    color: "#9ca3af",
    fontSize: 13,
  },

  primaryButton: {
    backgroundColor: "#ff6b00",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: "#111c34",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#374151",
  },

  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  activityCard: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 60,
  },

  activityEmpty: {
    color: "#9ca3af",
    fontSize: 14,
  },

  activityRow: {
    borderBottomColor: "#1f2937",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },

  activityType: {
    color: "#ff6b00",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 3,
  },

  activityText: {
    color: "#d1d5db",
    fontSize: 14,
  },
});