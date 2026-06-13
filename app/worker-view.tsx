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
import { cloudReturnTool } from "./cloudSync";
import { t } from "./i18n";
import { supabase } from "./supabase";

export default function WorkerViewScreen() {
  const returnTool = useToolStore((state) => state.returnTool);
  const language = useToolStore((state) => state.language); // auto re-render
  const [myTools, setMyTools] = useState<any[]>([]);
  const [workerName, setWorkerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyTools();
  }, []);

  const loadMyTools = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setWorkerName(user.email || "Worker");
      const { data } = await supabase.from("tools").select("*").eq("user_id", user.id).eq("status", "In Use");
      setMyTools(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = (tool: any) => {
    Alert.alert(t("returnTool"), `Return ${tool.name} to warehouse?`, [
      { text: t("cancel"), style: "cancel" },
      { text: t("return"), onPress: async () => { returnTool(tool.id); await cloudReturnTool(tool.id); loadMyTools(); } },
    ]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Tools</Text>
      <Text style={styles.subtitle}>{workerName}</Text>

      {loading ? (
        <ActivityIndicator color="#ff6b00" size="large" />
      ) : myTools.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>{t("noToolsYet")}</Text>
          <Text style={styles.emptyText}>Your manager hasn't assigned any tools yet.</Text>
        </View>
      ) : (
        myTools.map((tool) => (
          <View key={tool.id} style={styles.toolCard}>
            <View style={styles.toolInfo}>
              <Text style={styles.toolName}>{tool.name}</Text>
              <Text style={styles.toolMeta}>{tool.location || "No location"} · x{tool.quantity || "1"}</Text>
            </View>
            <TouchableOpacity style={styles.returnButton} onPress={() => handleReturn(tool)}>
              <Text style={styles.returnButtonText}>{t("return")}</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={loadMyTools}>
        <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>{t("logout")}</Text>
      </TouchableOpacity>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b1f", padding: 16 },
  title: { color: "white", fontSize: 40, fontWeight: "bold", marginTop: 54 },
  subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 22 },
  emptyBox: { backgroundColor: "#111c34", borderRadius: 18, padding: 20, alignItems: "center" },
  emptyTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  emptyText: { color: "#9ca3af", fontSize: 14, textAlign: "center" },
  toolCard: { backgroundColor: "#111c34", borderRadius: 18, padding: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#1f2937" },
  toolInfo: { flex: 1 },
  toolName: { color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  toolMeta: { color: "#9ca3af", fontSize: 13 },
  returnButton: { backgroundColor: "#16a34a", padding: 12, borderRadius: 12, minWidth: 80, alignItems: "center" },
  returnButtonText: { color: "white", fontSize: 14, fontWeight: "bold" },
  refreshButton: { backgroundColor: "#1f2937", padding: 14, borderRadius: 14, alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: "#374151" },
  refreshButtonText: { color: "white", fontSize: 15, fontWeight: "bold" },
  logoutButton: { backgroundColor: "#7f1d1d", padding: 14, borderRadius: 14, alignItems: "center" },
  logoutButtonText: { color: "white", fontSize: 15, fontWeight: "bold" },
});