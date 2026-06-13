import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";

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
import { loadLanguage, t } from "./i18n";
import { supabase } from "./supabase";
import toolCatalog from "./toolCatalog";

const professions = Object.keys(toolCatalog || {});

const getToolIcon = (toolName: string) => {
  const name = toolName.toLowerCase();
  if (name.includes("drill")) return "🛠️";
  if (name.includes("screwdriver")) return "🪛";
  if (name.includes("battery")) return "🔋";
  if (name.includes("ladder")) return "🪜";
  if (name.includes("tester")) return "📟";
  if (name.includes("grinder")) return "⚙️";
  if (name.includes("saw")) return "🪚";
  if (name.includes("light")) return "💡";
  return "🔧";
};

const guessCategory = (toolName: string) => {
  const name = toolName.toLowerCase();
  if (name.includes("screwdriver")) return "Screwdrivers";
  if (name.includes("drill") || name.includes("grinder") || name.includes("saw")) return "PowerTools";
  if (name.includes("battery") || name.includes("charger")) return "BatteriesChargers";
  if (name.includes("meter") || name.includes("tester") || name.includes("laser")) return "MeasuringTools";
  return "CustomTools";
};

const getAutoImage = (toolName: string) => {
  const name = toolName.toLowerCase();
  if (name.includes("drill")) return "drill";
  if (name.includes("screwdriver")) return "screwdriver";
  if (name.includes("battery")) return "battery";
  if (name.includes("ladder")) return "ladder";
  if (name.includes("tester")) return "tester";
  if (name.includes("grinder")) return "grinder";
  if (name.includes("saw")) return "saw";
  if (name.includes("light")) return "light";
  return "tool";
};

export default function WarehouseScreen() {
  const warehouseStock = useToolStore((state) => state.warehouseStock || {});
  const setWarehouseQuantity = useToolStore((state) => state.setWarehouseQuantity);
  const tools = useToolStore((state) => state.tools || []);
  const customTools = useToolStore((state) => state.customTools || []);
  const addCustomTool = useToolStore((state) => state.addCustomTool);

  const [profession, setProfession] = useState(professions[0] || "Electrician");
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState("");
  const [draftStock, setDraftStock] = useState<Record<string, string>>({});
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    loadLanguage().then(() => forceUpdate(n => n + 1));
    loadWarehouseStock();
  }, []);

  const loadWarehouseStock = async () => {
    const { data, error } = await supabase.from("warehouse_stock").select("*");
    if (error) { console.log("Warehouse load error:", error.message); return; }
    if (!data) return;
    data.forEach((item: any) => { setWarehouseQuantity(item.tool_name, String(item.quantity ?? 0)); });
  };

  const currentCatalog = toolCatalog[profession as keyof typeof toolCatalog] || {};

  const allTools = useMemo(() => {
    const catalogTools = Object.entries(currentCatalog).flatMap(([sectionName, sectionTools]) => {
      const safeTools = Array.isArray(sectionTools) ? sectionTools : [];
      return safeTools.map((toolName) => ({ name: toolName, section: sectionName }));
    });
    const customProfessionTools = customTools
      .filter((tool) => tool.profession === profession)
      .map((tool) => ({ name: tool.name, section: tool.category || "CustomTools" }));
    return [...catalogTools, ...customProfessionTools];
  }, [currentCatalog, customTools, profession]);

  const searchText = search.trim().toLowerCase();
  const filteredTools = searchText ? allTools.filter((tool) => tool.name.toLowerCase().includes(searchText)) : allTools;

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.section]) acc[tool.section] = [];
    if (!acc[tool.section].includes(tool.name)) acc[tool.section].push(tool.name);
    return acc;
  }, {} as Record<string, string[]>);

  const getWarehouseTotal = (toolName: string) => Number(draftStock[toolName] ?? warehouseStock[toolName] ?? 0);
  const getAssignedQuantity = (toolName: string) => tools.filter((tool) => tool.name === toolName && (tool.status === "In Use" || tool.borrowedBy || tool.holder)).reduce((sum, tool) => sum + Number(tool.quantity || 0), 0);
  const getAvailableQuantity = (toolName: string) => Math.max(getWarehouseTotal(toolName) - getAssignedQuantity(toolName), 0);

  const getToolStatus = (toolName: string) => {
    const available = getAvailableQuantity(toolName);
    if (available <= 0) return { text: "Out Of Stock", color: "#ef4444" };
    if (available <= 2) return { text: "Low Stock", color: "#f59e0b" };
    return { text: "In Stock", color: "#22c55e" };
  };

  const saveQuantity = async (toolName: string) => {
    const value = String(getWarehouseTotal(toolName));
    setWarehouseQuantity(toolName, value);
    const { error } = await supabase.from("warehouse_stock").upsert({ tool_name: toolName, quantity: Number(value) }, { onConflict: "tool_name" });
    if (error) { Alert.alert(t("error"), error.message); return; }
    Alert.alert(t("saved"), `${toolName} stock updated`);
  };

  const saveSmartTool = async () => {
    const toolName = search.trim();
    if (!toolName) { Alert.alert(t("error"), "Enter tool name"); return; }
    if (!quantity.trim()) { Alert.alert(t("error"), "Enter quantity"); return; }

    const existingTool = allTools.find((tool) => tool.name.toLowerCase() === toolName.toLowerCase());
    if (!existingTool) {
      addCustomTool({ id: `${Date.now()}-${toolName}`, name: toolName, profession, category: guessCategory(toolName), image: getAutoImage(toolName) });
    }

    setWarehouseQuantity(toolName, quantity.trim());
    const { error } = await supabase.from("warehouse_stock").upsert({ tool_name: toolName, quantity: Number(quantity.trim()) }, { onConflict: "tool_name" });
    if (error) { Alert.alert(t("error"), error.message); return; }
    Alert.alert(t("saved"), existingTool ? `${toolName} updated` : `${toolName} added`);
    setSearch("");
    setQuantity("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t("warehouse")}</Text>
      <Text style={styles.subtitle}>Smart warehouse management</Text>

      <View style={styles.topCard}>
        <Text style={styles.label}>Profession</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
          {professions.map((item) => (
            <TouchableOpacity key={item} style={[styles.professionButton, profession === item && styles.professionButtonActive]} onPress={() => { setProfession(item); setSearch(""); }}>
              <Text style={[styles.professionText, profession === item && styles.professionTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput placeholder="Search or add tool..." placeholderTextColor="#888" style={styles.input} value={search} onChangeText={setSearch} />
        <TextInput placeholder={t("quantity")} placeholderTextColor="#888" style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
        <TouchableOpacity style={styles.addButton} onPress={saveSmartTool}>
          <Text style={styles.addButtonText}>{t("saveChanges")}</Text>
        </TouchableOpacity>
      </View>

      {Object.entries(groupedTools).map(([sectionName, sectionTools]) => (
        <View key={sectionName} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{sectionName}</Text>
          {sectionTools.map((toolName) => {
            const total = getWarehouseTotal(toolName);
            const assigned = getAssignedQuantity(toolName);
            const available = getAvailableQuantity(toolName);
            const status = getToolStatus(toolName);

            return (
              <View key={toolName} style={styles.toolCard}>
                <View style={styles.leftBox}>
                  <Text style={styles.icon}>{getToolIcon(toolName)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toolName}>{toolName}</Text>
                    <Text style={styles.toolMeta}>Total: {total} · {t("inUse")}: {assigned}</Text>
                    <Text style={styles.availableText}>{t("available")}: {available}</Text>
                    <Text style={{ color: status.color, fontWeight: "bold", marginTop: 4 }}>{status.text}</Text>
                  </View>
                </View>
                <View style={styles.rightBox}>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#888"
                    style={styles.quantityInput}
                    value={String(total)}
                    onChangeText={(value) => setDraftStock((current) => ({ ...current, [toolName]: value }))}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.saveButton} onPress={() => saveQuantity(toolName)}>
                    <Text style={styles.saveButtonText}>{t("saved")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>{t("back")}</Text>
      </TouchableOpacity>

      <View style={{ height: 70 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b1f", padding: 16 },
  title: { color: "white", fontSize: 42, fontWeight: "bold", marginTop: 54 },
  subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 20 },
  topCard: { backgroundColor: "#111c34", borderRadius: 20, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: "#1f2937" },
  label: { color: "white", fontSize: 17, fontWeight: "bold", marginBottom: 10 },
  professionButton: { backgroundColor: "#020b1f", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, marginRight: 10, borderWidth: 1, borderColor: "#374151" },
  professionButtonActive: { backgroundColor: "#ff6b00", borderColor: "#ff6b00" },
  professionText: { color: "#d1d5db", fontSize: 15, fontWeight: "bold" },
  professionTextActive: { color: "white" },
  input: { backgroundColor: "#020b1f", color: "white", padding: 14, borderRadius: 13, fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: "#374151" },
  addButton: { backgroundColor: "#ff6b00", padding: 15, borderRadius: 13, alignItems: "center" },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  sectionCard: { backgroundColor: "#111c34", borderRadius: 20, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#1f2937" },
  sectionTitle: { color: "#ff6b00", fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  toolCard: { backgroundColor: "#020b1f", borderRadius: 16, padding: 12, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  leftBox: { flexDirection: "row", flex: 1, alignItems: "center", paddingRight: 10 },
  icon: { fontSize: 24, marginRight: 10 },
  toolName: { color: "white", fontSize: 16, fontWeight: "bold" },
  toolMeta: { color: "#9ca3af", fontSize: 12, marginTop: 4 },
  availableText: { color: "#86efac", fontSize: 13, fontWeight: "bold", marginTop: 4 },
  rightBox: { alignItems: "center" },
  quantityInput: { backgroundColor: "#111c34", color: "white", width: 75, padding: 10, borderRadius: 12, textAlign: "center", borderWidth: 1, borderColor: "#374151", fontSize: 16 },
  saveButton: { backgroundColor: "#ff6b00", borderRadius: 10, paddingVertical: 7, paddingHorizontal: 14, marginTop: 8 },
  saveButtonText: { color: "white", fontSize: 13, fontWeight: "bold" },
  backButton: { borderWidth: 1, borderColor: "#374151", padding: 16, borderRadius: 14, alignItems: "center", marginTop: 10 },
  backButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});