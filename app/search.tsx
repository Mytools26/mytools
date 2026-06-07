import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useToolStore } from "../toolStore";
import { supabase } from "./supabase";

const getStatusColor = (status?: string) => {
  switch (status) {
    case "Available": return "#16a34a";
    case "In Use": return "#2563eb";
    case "Missing": return "#f59e0b";
    case "Broken": return "#7f1d1d";
    default: return "#374151";
  }
};

export default function GlobalSearchScreen() {
  const tools = useToolStore((state) => state.tools || []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [cloudResults, setCloudResults] = useState<any[]>([]);

  const text = search.toLowerCase().trim();

  // Local search από Zustand
  const localResults = text
    ? tools.filter((tool) =>
        tool.name?.toLowerCase().includes(text) ||
        tool.profession?.toLowerCase().includes(text) ||
        tool.location?.toLowerCase().includes(text) ||
        tool.borrowedBy?.toLowerCase().includes(text) ||
        tool.holder?.toLowerCase().includes(text) ||
        tool.status?.toLowerCase().includes(text)
      )
    : [];

  // Workers από local tools
  const workerResults = text
    ? Array.from(
        new Set(
          tools.map((t) => t.borrowedBy || t.holder).filter(Boolean)
        )
      ).filter((w) => w.toLowerCase().includes(text))
    : [];

  // Cloud search από Supabase
  useEffect(() => {
    if (!text || text.length < 2) {
      setCloudResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("tools")
          .select("*")
          .eq("user_id", user.id)
          .or(
            `name.ilike.%${text}%,profession.ilike.%${text}%,location.ilike.%${text}%,holder.ilike.%${text}%,borrowed_by.ilike.%${text}%,status.ilike.%${text}%`
          )
          .limit(20);

        setCloudResults(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [text]);

  // Merge local + cloud (αφαιρούμε duplicates)
  const localIds = new Set(localResults.map((t) => t.id));
  const extraCloudResults = cloudResults.filter((t) => !localIds.has(t.id));

  const allResults = [
    ...localResults,
    ...extraCloudResults.map((item) => ({
      id: item.id,
      name: item.name || "",
      profession: item.profession || "",
      category: item.category || "",
      quantity: item.quantity || "0",
      location: item.location || "Warehouse",
      holder: item.holder || "",
      status: item.status || "Available",
      borrowedBy: item.borrowed_by || "",
    })),
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <Text style={styles.subtitle}>Find tools, workers and locations</Text>

      <TextInput
        placeholder="Search tool, worker, location, status..."
        placeholderTextColor="#888"
        style={styles.input}
        value={search}
        onChangeText={setSearch}
        autoFocus
      />

      {loading && (
        <ActivityIndicator color="#ff6b00" style={{ marginBottom: 14 }} />
      )}

      {!search.trim() ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Start typing</Text>
          <Text style={styles.emptyText}>
            Search by tool name, worker, location or status.
          </Text>
        </View>
      ) : (
        <>
          {/* Summary */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNumber}>{allResults.length}</Text>
              <Text style={styles.summaryLabel}>Tools</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNumber}>{workerResults.length}</Text>
              <Text style={styles.summaryLabel}>Workers</Text>
            </View>
          </View>

          {allResults.length === 0 && workerResults.length === 0 && !loading && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptyText}>
                Nothing found for "{search}".
              </Text>
            </View>
          )}

          {/* Tools */}
          {allResults.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Tools</Text>
              {allResults.map((tool, index) => {
                const realId = tool.id || `tool-${index}`;
                return (
                  <TouchableOpacity
                    key={realId}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/worker-details",
                        params: { workerName: tool.borrowedBy || tool.holder },
                      } as any)
                    }
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardTextBox}>
                        <Text style={styles.cardTitle}>{tool.name}</Text>
                        <Text style={styles.text}>
                          {(tool.borrowedBy || tool.holder || "Warehouse") + " · " + (tool.location || "No location")}
                        </Text>
                        <Text style={styles.text}>
                          {tool.profession} · Qty: {tool.quantity}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tool.status) }]}>
                        <Text style={styles.badgeText}>{tool.status || "Unknown"}</Text>
                      </View>
                    </View>
                    {(tool.borrowedBy || tool.holder) ? (
                      <Text style={styles.linkText}>Tap to open worker →</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* Workers */}
          {workerResults.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Workers</Text>
              {workerResults.map((workerName) => {
                const workerTools = tools.filter(
                  (t) => t.borrowedBy === workerName || t.holder === workerName
                );
                return (
                  <TouchableOpacity
                    key={workerName}
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/worker-details",
                        params: { workerName },
                      } as any)
                    }
                  >
                    <Text style={styles.cardTitle}>👷 {workerName}</Text>
                    <Text style={styles.text}>Tools: {workerTools.length}</Text>
                    <Text style={styles.linkText}>Open worker details →</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </>
      )}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b1f", padding: 16 },
  title: { color: "white", fontSize: 40, fontWeight: "bold", marginTop: 54 },
  subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 18 },
  input: { backgroundColor: "#111c34", color: "white", padding: 15, borderRadius: 16, fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: "#1f2937" },
  emptyBox: { backgroundColor: "#111c34", borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#1f2937" },
  emptyTitle: { color: "white", fontSize: 19, fontWeight: "bold", marginBottom: 6 },
  emptyText: { color: "#9ca3af", fontSize: 14 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryBox: { flex: 1, backgroundColor: "#111c34", borderRadius: 15, padding: 12, borderWidth: 1, borderColor: "#1f2937" },
  summaryNumber: { color: "#ff6b00", fontSize: 24, fontWeight: "bold" },
  summaryLabel: { color: "#9ca3af", fontSize: 12, marginTop: 3 },
  sectionTitle: { color: "#ff6b00", fontSize: 22, fontWeight: "bold", marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: "#111c34", borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1f2937" },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 },
  cardTextBox: { flex: 1 },
  cardTitle: { color: "white", fontSize: 17, fontWeight: "bold", marginBottom: 6, flex: 1 },
  text: { color: "#d1d5db", fontSize: 13, marginBottom: 3 },
  linkText: { color: "#60a5fa", fontSize: 13, fontWeight: "bold", marginTop: 6 },
  statusBadge: { borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9 },
  badgeText: { color: "white", fontSize: 11, fontWeight: "bold" },
});