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
import { cloudReturnTool } from "../cloudSync";
import { t } from "../i18n";

export default function BorrowedScreen() {
  const tools = useToolStore((state) => state.tools || []);
  const deleteTool = useToolStore((state) => state.deleteTool);
  const returnTool = useToolStore((state) => state.returnTool);
  const duplicateWorkerGroup = useToolStore((state) => state.duplicateWorkerGroup);
  const language = useToolStore((state) => state.language); // auto re-render on language change

  const [copyingWorker, setCopyingWorker] = useState<string | null>(null);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const borrowedTools = tools.filter((tool) => tool.status === "In Use" || tool.holder || tool.borrowedBy);

  const groupedByWorker = borrowedTools.reduce((acc, tool) => {
    const workerName = tool.borrowedBy || tool.holder || "Unknown Worker";
    if (!acc[workerName]) acc[workerName] = [];
    acc[workerName].push(tool);
    return acc;
  }, {} as Record<string, typeof borrowedTools>);

  const getWorkerLocation = (workerTools: typeof borrowedTools) =>
    workerTools.find((tool) => tool.location)?.location || "No location";

  const getTotalQuantity = (workerTools: typeof borrowedTools) =>
    workerTools.reduce((sum, tool) => sum + Number(tool.quantity || 0), 0);

  const getBrokenCount = (workerTools: typeof borrowedTools) =>
    workerTools.filter((tool) => tool.status === "Broken").length;

  const getMissingCount = (workerTools: typeof borrowedTools) =>
    workerTools.filter((tool) => tool.status === "Missing").length;

  const handleReturnAll = (workerName: string, workerTools: typeof borrowedTools) => {
    Alert.alert(t("returnTool"), `Return all tools from ${workerName} to warehouse?`, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("returnAll"),
        onPress: async () => {
          for (const [index, tool] of workerTools.entries()) {
            const realId = tool.id || `old-tool-${index}`;
            returnTool(realId);
            await cloudReturnTool(realId);
          }
        },
      },
    ]);
  };

  const deleteWorkerGroup = (workerName: string, workerTools: typeof borrowedTools) => {
    Alert.alert(t("delete"), `Delete ${workerName} and all assigned tools?`, [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("delete"),
        style: "destructive",
        onPress: () => {
          workerTools.forEach((tool, index) => {
            const realId = tool.id || `old-tool-${index}`;
            deleteTool(realId);
          });
        },
      },
    ]);
  };

  const copyGroup = (workerName: string) => {
    if (!newWorkerName.trim()) { Alert.alert(t("error"), "Enter worker name"); return; }
    duplicateWorkerGroup(workerName, newWorkerName.trim(), newLocation.trim());
    setCopyingWorker(null);
    setNewWorkerName("");
    setNewLocation("");
    Alert.alert(t("success"), "Worker group copied");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("workers")}</Text>
      <Text style={styles.subtitle}>{t("workerAssignments")}</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>{Object.keys(groupedByWorker).length}</Text>
          <Text style={styles.summaryLabel}>{t("workers")}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>{borrowedTools.length}</Text>
          <Text style={styles.summaryLabel}>{t("toolLines")}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryNumber}>{getTotalQuantity(borrowedTools)}</Text>
          <Text style={styles.summaryLabel}>{t("totalQty")}</Text>
        </View>
      </View>

      {borrowedTools.length === 0 ? (
        <Text style={styles.emptyText}>{t("noBorrowedTools")}</Text>
      ) : (
        Object.entries(groupedByWorker).map(([workerName, workerTools]) => {
          const location = getWorkerLocation(workerTools);
          const totalQuantity = getTotalQuantity(workerTools);
          const brokenCount = getBrokenCount(workerTools);
          const missingCount = getMissingCount(workerTools);

          return (
            <View key={workerName} style={styles.workerCard}>
              <TouchableOpacity activeOpacity={0.85} onPress={() => router.push({ pathname: "/worker-details", params: { workerName } } as any)}>
                <View style={styles.topRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workerName}>{workerName}</Text>
                    <Text style={styles.locationText}>📍 {location}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>OPEN</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.smallStat}>
                    <Text style={styles.smallStatNumber}>{workerTools.length}</Text>
                    <Text style={styles.smallStatLabel}>Lines</Text>
                  </View>
                  <View style={styles.smallStat}>
                    <Text style={styles.smallStatNumber}>{totalQuantity}</Text>
                    <Text style={styles.smallStatLabel}>{t("qty")}</Text>
                  </View>
                  <View style={styles.smallStat}>
                    <Text style={styles.problemNumber}>{brokenCount}</Text>
                    <Text style={styles.smallStatLabel}>{t("broken")}</Text>
                  </View>
                  <View style={styles.smallStat}>
                    <Text style={styles.warningNumber}>{missingCount}</Text>
                    <Text style={styles.smallStatLabel}>{t("missing")}</Text>
                  </View>
                </View>

                <Text style={styles.previewText}>
                  {workerTools.slice(0, 3).map((tool) => `${tool.quantity || "0"}x ${tool.name}`).join(" · ")}
                  {workerTools.length > 3 ? " · ..." : ""}
                </Text>
              </TouchableOpacity>

              {copyingWorker === workerName ? (
                <View style={styles.copyBox}>
                  <TextInput placeholder="New worker name" placeholderTextColor="#888" style={styles.input} value={newWorkerName} onChangeText={setNewWorkerName} />
                  <TextInput placeholder="New location / project" placeholderTextColor="#888" style={styles.input} value={newLocation} onChangeText={setNewLocation} />
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.saveButton} onPress={() => copyGroup(workerName)}>
                      <Text style={styles.buttonText}>{t("saved")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => { setCopyingWorker(null); setNewWorkerName(""); setNewLocation(""); }}>
                      <Text style={styles.buttonText}>{t("cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.returnAllButton} onPress={() => handleReturnAll(workerName, workerTools)}>
                    <Text style={styles.buttonText}>{t("returnAll")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.copyButton} onPress={() => setCopyingWorker(workerName)}>
                    <Text style={styles.buttonText}>{t("copy")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteWorkerGroup(workerName, workerTools)}>
                    <Text style={styles.buttonText}>{t("delete")}</Text>
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
  container: { flex: 1, backgroundColor: "#020b1f", padding: 16 },
  title: { color: "white", fontSize: 40, fontWeight: "bold", marginTop: 54 },
  subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 18 },
  summaryCard: { backgroundColor: "#111c34", borderRadius: 18, padding: 14, marginBottom: 16, flexDirection: "row", gap: 8, borderWidth: 1, borderColor: "#1f2937" },
  summaryBox: { flex: 1, backgroundColor: "#020b1f", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#374151" },
  summaryNumber: { color: "#ff6b00", fontSize: 24, fontWeight: "bold" },
  summaryLabel: { color: "#9ca3af", fontSize: 11, marginTop: 3 },
  emptyText: { color: "#9ca3af", fontSize: 16, marginTop: 30 },
  workerCard: { backgroundColor: "#111c34", borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#1f2937" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  workerName: { color: "#ff6b00", fontSize: 24, fontWeight: "bold" },
  locationText: { color: "#d1d5db", fontSize: 13, marginTop: 4 },
  badge: { backgroundColor: "#1e293b", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, marginLeft: 10 },
  badgeText: { color: "#60a5fa", fontSize: 11, fontWeight: "bold" },
  statsRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  smallStat: { flex: 1, backgroundColor: "#020b1f", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#1f2937" },
  smallStatNumber: { color: "white", fontSize: 18, fontWeight: "bold" },
  smallStatLabel: { color: "#9ca3af", fontSize: 11, marginTop: 3 },
  problemNumber: { color: "#f87171", fontSize: 18, fontWeight: "bold" },
  warningNumber: { color: "#fbbf24", fontSize: 18, fontWeight: "bold" },
  previewText: { color: "#d1d5db", fontSize: 13, marginTop: 14, marginBottom: 4 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  returnAllButton: { flex: 2, backgroundColor: "#16a34a", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  copyButton: { flex: 1, backgroundColor: "#2563eb", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  deleteButton: { flex: 1, backgroundColor: "#7f1d1d", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  copyBox: { marginTop: 14 },
  input: { backgroundColor: "#020b1f", color: "white", padding: 14, borderRadius: 12, fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: "#374151" },
  saveButton: { flex: 1, backgroundColor: "#16a34a", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  cancelButton: { flex: 1, backgroundColor: "#374151", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "white", fontSize: 14, fontWeight: "bold" },
});