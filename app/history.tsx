import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useToolStore } from "../toolStore";
import { t } from "./i18n";
import { supabase } from "./supabase";

const getTypeColor = (type: string) => {
  switch (type) {
    case "ASSIGN": return "#2563eb";
    case "RETURN": return "#16a34a";
    case "DELETE": return "#7f1d1d";
    case "UPDATE": return "#f59e0b";
    case "WAREHOUSE": return "#ff6b00";
    case "CUSTOM_TOOL": return "#7c3aed";
    case "ADD": return "#0f766e";
    default: return "#374151";
  }
};

export default function History() {
  const historyLogs = useToolStore((state) => state.historyLogs || []);
  const deleteLog = useToolStore((state) => state.deleteHistoryLog);
  const clearLogs = useToolStore((state) => state.clearHistoryLogs);
  const language = useToolStore((state) => state.language); // auto re-render

  const [cloudLogs, setCloudLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCloudHistory();
  }, []);

  const loadCloudHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("history_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setCloudLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const localIds = new Set(historyLogs.map((l) => l.id));
  const extraCloudLogs = cloudLogs
    .filter((l) => !localIds.has(l.id))
    .map((l) => ({
      id: l.id, type: l.type || "ADD", toolName: l.tool_name || "",
      quantity: l.quantity || "", workerName: l.worker_name || "",
      location: l.location || "", message: l.message || "", createdAt: l.created_at || "",
    }));

  const allLogs = [...historyLogs, ...extraCloudLogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleString();
  };

  const handleDelete = (id: string) => {
    Alert.alert(t("delete"), "Delete this history entry?", [
      { text: t("cancel"), style: "cancel" },
      { text: t("delete"), style: "destructive", onPress: () => deleteLog(id) },
    ]);
  };

  const handleClearAll = () => {
    if (allLogs.length === 0) return;
    Alert.alert(t("history"), "Delete all history entries?", [
      { text: t("cancel"), style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: clearLogs },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("history")}</Text>
      <Text style={styles.subtitle}>Tool movements and activity</Text>

      {loading && <ActivityIndicator color="#ff6b00" style={{ marginBottom: 14 }} />}

      {allLogs.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
          <Text style={styles.clearButtonText}>Clear All History</Text>
        </TouchableOpacity>
      )}

      {allLogs.length === 0 && !loading ? (
        <Text style={styles.emptyText}>{t("noToolsYet")}</Text>
      ) : (
        allLogs.map((log) => (
          <View key={log.id} style={styles.card}>
            <View style={styles.topRow}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(log.type) }]}>
                <Text style={styles.typeText}>{log.type}</Text>
              </View>
              <TouchableOpacity style={styles.deleteSmallButton} onPress={() => handleDelete(log.id)}>
                <Text style={styles.deleteSmallButtonText}>{t("delete")}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.message}>{log.message}</Text>
            <View style={styles.metaBox}>
              <Text style={styles.meta}>Tool: {log.toolName || "Unknown"}</Text>
              {log.quantity ? <Text style={styles.meta}>{t("quantity")}: {log.quantity}</Text> : null}
              {log.workerName ? <Text style={styles.meta}>Worker: {log.workerName}</Text> : null}
              {log.location ? <Text style={styles.meta}>Location: {log.location}</Text> : null}
              <Text style={styles.date}>{formatDate(log.createdAt)}</Text>
            </View>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>{t("back")}</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b1f", padding: 16 },
  title: { color: "white", fontSize: 40, fontWeight: "bold", marginTop: 54 },
  subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 18 },
  clearButton: { backgroundColor: "#7f1d1d", borderRadius: 14, padding: 14, alignItems: "center", marginBottom: 14 },
  clearButtonText: { color: "white", fontSize: 15, fontWeight: "bold" },
  emptyText: { color: "#9ca3af", fontSize: 16 },
  card: { backgroundColor: "#111c34", borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#1f2937" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  typeBadge: { borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  typeText: { color: "white", fontSize: 12, fontWeight: "bold" },
  deleteSmallButton: { backgroundColor: "#020b1f", borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "#7f1d1d" },
  deleteSmallButtonText: { color: "#fca5a5", fontSize: 12, fontWeight: "bold" },
  message: { color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  metaBox: { backgroundColor: "#020b1f", borderRadius: 14, padding: 10, borderWidth: 1, borderColor: "#1f2937" },
  meta: { color: "#d1d5db", fontSize: 13, marginBottom: 4 },
  date: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  backButton: { borderColor: "#374151", borderWidth: 1, padding: 15, borderRadius: 14, alignItems: "center", marginTop: 14 },
  backButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});