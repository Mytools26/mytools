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
import { t } from "../i18n";
import { exportPdf } from "../utils/pdf";

export default function DashboardScreen() {
  const tools = useToolStore((state) => state.tools || []);
  // Αυτό κάνει re-render όταν αλλάζει γλώσσα!
  const language = useToolStore((state) => state.language);

  const totalTools = tools.length;
  const borrowedTools = tools.filter((tool) => tool.status === "In Use" || tool.borrowedBy || tool.holder).length;
  const availableTools = tools.filter((tool) => tool.status === "Available").length;
  const workers = new Set(tools.map((tool) => tool.borrowedBy || tool.holder).filter(Boolean)).size;

  const problemTools = tools.filter((tool) => tool.status === "Missing" || tool.status === "Broken");
  const lowStockTools = tools.filter((tool) => Number(tool.quantity || 0) > 0 && Number(tool.quantity || 0) <= 2);

  const exportCompanyPdf = async () => {
    const assignedRows = tools.map((tool, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${tool.name}</td>
        <td>${tool.quantity || "0"}</td>
        <td>${tool.status || ""}</td>
        <td>${tool.borrowedBy || tool.holder || "Storage"}</td>
        <td>${tool.location || ""}</td>
      </tr>
    `).join("");

    const html = `
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h1>${t("appName")} - Company Report</h1>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          <h2>Summary</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr><td><strong>${t("items")}</strong></td><td>${totalTools}</td></tr>
            <tr><td><strong>${t("inUse")}</strong></td><td>${borrowedTools}</td></tr>
            <tr><td><strong>${t("available")}</strong></td><td>${availableTools}</td></tr>
            <tr><td><strong>${t("workers")}</strong></td><td>${workers}</td></tr>
          </table>
          <h2>All Tools</h2>
          <table style="width:100%; border-collapse:collapse;">
            <tr>
              <th style="border:1px solid #333;padding:8px;">#</th>
              <th style="border:1px solid #333;padding:8px;">Tool</th>
              <th style="border:1px solid #333;padding:8px;">${t("qty")}</th>
              <th style="border:1px solid #333;padding:8px;">${t("status")}</th>
              <th style="border:1px solid #333;padding:8px;">Worker</th>
              <th style="border:1px solid #333;padding:8px;">Location</th>
            </tr>
            ${assignedRows || `<tr><td colspan="6">No tools</td></tr>`}
          </table>
        </body>
      </html>
    `;
    await exportPdf(html);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.logo}>{t("appName")}</Text>
      <Text style={styles.subtitle}>{t("appSubtitle")}</Text>

      <View style={styles.mainActions}>
        <TouchableOpacity style={styles.mainButtonOrange} onPress={() => router.push("/add-tool")}>
          <Text style={styles.mainButtonIcon}>🔧</Text>
          <Text style={styles.mainButtonText}>{t("assignTool")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainButtonGreen} onPress={() => router.push("/(tabs)/borrowed")}>
          <Text style={styles.mainButtonIcon}>↩️</Text>
          <Text style={styles.mainButtonText}>{t("returnTool")}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.mainButtonBlue} onPress={() => router.push("/search")}>
        <Text style={styles.mainButtonIcon}>🔍</Text>
        <Text style={styles.mainButtonText}>{t("findTool")}</Text>
      </TouchableOpacity>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalTools}</Text>
          <Text style={styles.statLabel}>{t("items")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{borrowedTools}</Text>
          <Text style={styles.statLabel}>{t("inUse")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{availableTools}</Text>
          <Text style={styles.statLabel}>{t("available")}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{workers}</Text>
          <Text style={styles.statLabel}>{t("workers")}</Text>
        </View>
      </View>

      {(problemTools.length > 0 || lowStockTools.length > 0) && (
        <>
          <Text style={styles.sectionTitle}>{t("needsAttention")}</Text>
          <View style={styles.attentionCard}>
            {problemTools.slice(0, 4).map((tool, index) => (
              <Text key={tool.id || index} style={styles.problemText}>
                {tool.status}: {tool.name}
              </Text>
            ))}
            {lowStockTools.slice(0, 4).map((tool, index) => (
              <Text key={`low-${index}`} style={styles.warningText}>
                {t("lowStock")}: {tool.name} — {t("qty")} {tool.quantity}
              </Text>
            ))}
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>{t("more")}</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/warehouse")}>
          <Text style={styles.actionTitle}>📦 {t("warehouse")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/scan")}>
          <Text style={styles.actionTitle}>📷 {t("scan")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/history")}>
          <Text style={styles.actionTitle}>📋 {t("history")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={exportCompanyPdf}>
          <Text style={styles.actionTitle}>📄 {t("exportPdf")}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 70 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b1f", padding: 16 },
  logo: { color: "white", fontSize: 42, fontWeight: "bold", marginTop: 54 },
  subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 22 },
  mainActions: { flexDirection: "row", gap: 10, marginBottom: 10 },
  mainButtonOrange: { flex: 1, backgroundColor: "#ff6b00", borderRadius: 20, padding: 22, alignItems: "center" },
  mainButtonGreen: { flex: 1, backgroundColor: "#16a34a", borderRadius: 20, padding: 22, alignItems: "center" },
  mainButtonBlue: { backgroundColor: "#2563eb", borderRadius: 20, padding: 22, alignItems: "center", marginBottom: 22 },
  mainButtonIcon: { fontSize: 32, marginBottom: 8 },
  mainButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 20 },
  statCard: { backgroundColor: "#111c34", borderRadius: 16, padding: 14, width: "48%", marginBottom: 10 },
  statNumber: { color: "#ff6b00", fontSize: 28, fontWeight: "bold" },
  statLabel: { color: "#d1d5db", fontSize: 13, marginTop: 4, fontWeight: "600" },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  attentionCard: { backgroundColor: "#111c34", borderRadius: 18, padding: 16, marginBottom: 18 },
  problemText: { color: "#f87171", fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  warningText: { color: "#fbbf24", fontSize: 15, fontWeight: "bold", marginBottom: 6 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  actionCard: { backgroundColor: "#111c34", borderRadius: 16, padding: 18, width: "48%", marginBottom: 10, alignItems: "center" },
  actionTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
});