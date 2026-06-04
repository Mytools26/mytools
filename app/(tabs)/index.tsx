import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useToolStore } from "../../toolStore";
import { cloudDeleteTool, cloudUpdateToolQuantity } from "../cloudSync";
import { supabase } from "../supabase";

const getToolIcon = (image?: string) => {
  switch (image) {
    case "drill": return "🛠️";
    case "screwdriver": return "🪛";
    case "battery": return "🔋";
    case "ladder": return "🪜";
    case "tester": return "📟";
    case "cutter": return "✂️";
    case "grinder": return "⚙️";
    case "saw": return "🪚";
    case "light": return "💡";
    case "safety": return "🦺";
    case "electrical": return "⚡";
    default: return "🔧";
  }
};

const statuses = ["Available", "In Use", "Missing", "Broken"];

export default function InventoryScreen() {
  const tools = useToolStore((state) => state.tools);
  const setTools = useToolStore((state) => state.setTools);
  const updateTool = useToolStore((state) => state.updateTool);
  const deleteTool = useToolStore((state) => state.deleteTool);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState("");

  useEffect(() => {
    loadToolsFromSupabase();
  }, []);

  const loadToolsFromSupabase = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert("Login Required", "Please login first from Settings.");
        return;
      }
      const { data, error } = await supabase
        .from("tools")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        Alert.alert("Load Error", error.message);
        return;
      }
      const loadedTools = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || "",
        profession: item.profession || "",
        category: item.category || "",
        brand: item.brand || "",
        quantity: item.quantity || "0",
        location: item.location || "Warehouse",
        holder: item.holder || "",
        status: item.status || "Available",
        borrowedBy: item.borrowed_by || "",
        returnDate: item.return_date || "",
        notes: item.notes || "",
        image: item.image || "tool",
      }));
      setTools(loadedTools);
    } catch (error) {
      Alert.alert("Error", "Failed to load tools from Supabase.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const text = search.toLowerCase();
    return (
      tool.name?.toLowerCase().includes(text) ||
      tool.profession?.toLowerCase().includes(text) ||
      tool.category?.toLowerCase().includes(text) ||
      tool.location?.toLowerCase().includes(text) ||
      tool.borrowedBy?.toLowerCase().includes(text) ||
      tool.holder?.toLowerCase().includes(text) ||
      tool.status?.toLowerCase().includes(text)
    );
  });

  const openToolModal = (tool: any, toolId: string) => {
    setSelectedTool(tool);
    setSelectedToolId(toolId);
    setNewQuantity(tool.quantity || "");
  };

  const closeToolModal = () => {
    Keyboard.dismiss();
    setSelectedTool(null);
    setSelectedToolId(null);
    setNewQuantity("");
  };

  const grouped = filteredTools.reduce(
    (acc, tool) => {
      const profession = tool.profession || "Other";
      const category = tool.category || "General";
      const brand = tool.brand || "No Brand";
      if (!acc[profession]) acc[profession] = {};
      if (!acc[profession][category]) acc[profession][category] = {};
      if (!acc[profession][category][brand]) acc[profession][category][brand] = [];
      acc[profession][category][brand].push(tool);
      return acc;
    },
    {} as Record<string, Record<string, Record<string, typeof tools>>>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Inventory</Text>

        <TextInput
          placeholder="Search tool, worker, location..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity style={styles.refreshButton} onPress={loadToolsFromSupabase} disabled={loading}>
          <Text style={styles.refreshButtonText}>{loading ? "Loading..." : "Refresh from Cloud"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-tool")}>
          <Text style={styles.addButtonText}>+ Add / Assign Tools</Text>
        </TouchableOpacity>

        {filteredTools.length === 0 ? (
          <Text style={styles.emptyText}>
            {loading ? "Loading tools..." : tools.length === 0 ? "No tools yet" : "No results found"}
          </Text>
        ) : (
          Object.entries(grouped).map(([profession, categories]) => (
            <View key={profession} style={styles.card}>
              <Text style={styles.profession}>{profession}</Text>
              {Object.entries(categories).map(([category, brands]) => (
                <View key={category} style={styles.section}>
                  <Text style={styles.category}>{category}</Text>
                  {Object.entries(brands).map(([brand, brandTools]) => (
                    <View key={brand} style={styles.brandCard}>
                      {brand !== "No Brand" ? <Text style={styles.brand}>{brand}</Text> : null}
                      {brandTools.map((tool, index) => {
                        const realId = tool.id || `old-tool-${index}`;
                        return (
                          <TouchableOpacity key={realId} style={styles.compactToolRow} activeOpacity={0.85} onPress={() => openToolModal(tool, realId)}>
                            <View style={styles.compactLeft}>
                              <Text style={styles.compactIcon}>{getToolIcon(tool.image)}</Text>
                              <View style={styles.compactTextBox}>
                                <Text style={styles.compactToolName}>{tool.name}</Text>
                                <Text style={styles.compactMeta}>{(tool.borrowedBy || tool.holder || "Storage") + " · " + (tool.location || "No location")}</Text>
                                <Text style={[styles.statusText, tool.status === "Missing" && styles.statusMissing, tool.status === "Broken" && styles.statusBroken, tool.status === "Available" && styles.statusAvailable, tool.status === "In Use" && styles.statusInUse]}>
                                  Status: {tool.status || "Unknown"}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.compactRight}>
                              <Text style={styles.compactQty}>x{tool.quantity || "0"}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selectedTool} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>{selectedTool?.name}</Text>
                  <Text style={styles.modalMeta}>
                    {(selectedTool?.borrowedBy || selectedTool?.holder || "Storage") + " · " + (selectedTool?.location || "No location")}
                  </Text>

                  <Text style={styles.modalLabel}>Quantity</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newQuantity}
                    onChangeText={setNewQuantity}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />

                  <Text style={styles.modalLabel}>Status</Text>
                  <View style={styles.statusRow}>
                    {statuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[styles.statusButton, selectedTool?.status === status && styles.statusButtonActive]}
                        onPress={() => {
                          if (!selectedTool || !selectedToolId) return;
                          const updatedTool = { ...selectedTool, id: selectedToolId, status };
                          updateTool(selectedToolId, updatedTool);
                          setSelectedTool(updatedTool);
                        }}
                      >
                        <Text style={styles.statusButtonText}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.saveModalButton}
                    onPress={async () => {
                      if (!selectedTool || !selectedToolId) return;
                      updateTool(selectedToolId, { ...selectedTool, id: selectedToolId, quantity: newQuantity });
                      await cloudUpdateToolQuantity(selectedToolId, newQuantity);
                      closeToolModal();
                    }}
                  >
                    <Text style={styles.modalButtonText}>Save Changes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteModalButton}
                    onPress={() => {
                      if (!selectedToolId) return;
                      Alert.alert("Delete Tool", `Delete ${selectedTool?.name}?`, [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: async () => {
                            deleteTool(selectedToolId);
                            await cloudDeleteTool(selectedToolId);
                            closeToolModal();
                          },
                        },
                      ]);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Delete Tool</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.closeModalButton} onPress={closeToolModal}>
                    <Text style={styles.closeModalText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b1f", padding: 20 },
  title: { color: "white", fontSize: 42, fontWeight: "bold", marginTop: 60, marginBottom: 18 },
  searchInput: { backgroundColor: "#111c34", color: "white", padding: 15, borderRadius: 16, fontSize: 16, marginBottom: 14 },
  refreshButton: { backgroundColor: "#1f2937", padding: 14, borderRadius: 16, alignItems: "center", marginBottom: 12, borderWidth: 1, borderColor: "#374151" },
  refreshButtonText: { color: "white", fontSize: 15, fontWeight: "bold" },
  addButton: { backgroundColor: "#ff6b00", padding: 15, borderRadius: 16, alignItems: "center", marginBottom: 22 },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  emptyText: { color: "#9ca3af", fontSize: 18 },
  card: { backgroundColor: "#111c34", borderRadius: 22, padding: 16, marginBottom: 18 },
  profession: { color: "#ff6b00", fontSize: 28, fontWeight: "bold", marginBottom: 14 },
  section: { marginBottom: 14 },
  category: { color: "#9ca3af", fontSize: 18, fontWeight: "600", marginBottom: 10 },
  brandCard: { backgroundColor: "#1a2747", borderRadius: 16, padding: 10, marginBottom: 12 },
  brand: { color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  compactToolRow: { backgroundColor: "#111c34", borderRadius: 14, padding: 10, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  compactLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  compactIcon: { fontSize: 22, marginRight: 10 },
  compactTextBox: { flex: 1 },
  compactToolName: { color: "white", fontSize: 15, fontWeight: "bold" },
  compactMeta: { color: "#9ca3af", fontSize: 11, marginTop: 3 },
  statusText: { fontSize: 11, fontWeight: "bold", marginTop: 3 },
  statusAvailable: { color: "#86efac" },
  statusInUse: { color: "#60a5fa" },
  statusMissing: { color: "#fbbf24" },
  statusBroken: { color: "#f87171" },
  compactRight: { marginLeft: 12 },
  compactQty: { color: "#ff6b00", fontSize: 18, fontWeight: "bold" },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  statusButton: { backgroundColor: "#020b1f", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: "#374151" },
  statusButtonActive: { backgroundColor: "#ff6b00", borderColor: "#ff6b00" },
  statusButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#111c34", padding: 22, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: "#1f2937" },
  modalTitle: { color: "white", fontSize: 26, fontWeight: "bold", marginBottom: 8 },
  modalMeta: { color: "#9ca3af", fontSize: 15, marginBottom: 18 },
  modalLabel: { color: "white", fontSize: 16, fontWeight: "bold", marginBottom: 8, marginTop: 8 },
  modalInput: { backgroundColor: "#020b1f", color: "white", padding: 14, borderRadius: 14, fontSize: 18, borderWidth: 1, borderColor: "#374151", marginBottom: 12 },
  saveModalButton: { backgroundColor: "#16a34a", padding: 15, borderRadius: 14, alignItems: "center", marginTop: 16 },
  deleteModalButton: { backgroundColor: "#991b1b", padding: 15, borderRadius: 14, alignItems: "center", marginTop: 10 },
  closeModalButton: { borderColor: "#374151", borderWidth: 1, padding: 15, borderRadius: 14, alignItems: "center", marginTop: 10 },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  closeModalText: { color: "white", fontSize: 16, fontWeight: "bold" },
});