import { router, useLocalSearchParams } from "expo-router";
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

type SelectedTools = {
  [toolName: string]: string;
};

const getAutoImage = (toolName: string) => {
  const name = toolName.toLowerCase();

  if (name.includes("drill")) return "drill";
  if (name.includes("screwdriver")) return "screwdriver";
  if (name.includes("voltage") || name.includes("tester") || name.includes("meter")) return "tester";
  if (name.includes("battery")) return "battery";
  if (name.includes("ladder")) return "ladder";
  if (name.includes("cutter")) return "cutter";
  if (name.includes("grinder")) return "grinder";
  if (name.includes("saw")) return "saw";
  if (name.includes("light")) return "light";
  if (name.includes("wrench")) return "wrench";
  if (name.includes("pliers")) return "pliers";
  if (name.includes("hammer")) return "hammer";
  if (
    name.includes("terminal") ||
    name.includes("cable") ||
    name.includes("junction") ||
    name.includes("breaker") ||
    name.includes("fuse") ||
    name.includes("relay") ||
    name.includes("contactor")
  ) return "electrical";
  if (name.includes("glove") || name.includes("helmet") || name.includes("glasses")) return "safety";

  return "tool";
};

const getToolIcon = (toolName: string) => {
  const image = getAutoImage(toolName);

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
    case "wrench": return "🔧";
    case "pliers": return "🗜️";
    case "hammer": return "🔨";
    case "electrical": return "⚡";
    case "safety": return "🦺";
    default: return "🔧";
  }
};

const normalizeCustomName = (value: string) => {
  const clean = value.trim();
  if (!clean) return "";

  const lower = clean.toLowerCase();

  if (
    lower.includes("highlighter") ||
    lower.includes("marker") ||
    lower.includes("pen") ||
    lower.includes("voltage") ||
    lower.includes("tester") ||
    lower.includes("phase tester") ||
    lower.includes("neon tester")
  ) {
    return "Voltage Tester";
  }

  return clean
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function AddToolScreen() {
  const params = useLocalSearchParams();

  const prefillWorkerName = String(params.workerName || "");
  const prefillLocation = String(params.location || "");
  const prefillToolName = String(params.prefillName || "");
  const prefillCategory = String(params.prefillCategory || "");

  const addTool = useToolStore((state) => state.addTool);
  const tools = useToolStore((state) => state.tools || []);
  const warehouseStock = useToolStore((state) => state.warehouseStock || {});

  const [workerName, setWorkerName] = useState(prefillWorkerName);
  const [profession, setProfession] = useState(professions[0] || "Electrician");
  const [location, setLocation] = useState(prefillLocation || "Warehouse");
  const [selectedTools, setSelectedTools] = useState<SelectedTools>({});
  const [saving, setSaving] = useState(false);
  const [toolSearch, setToolSearch] = useState("");
  const [customToolName, setCustomToolName] = useState("");
  const [customQuantity, setCustomQuantity] = useState("1");
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    loadLanguage().then(() => forceUpdate((n) => n + 1));

    if (prefillWorkerName) setWorkerName(prefillWorkerName);
    if (prefillLocation) setLocation(prefillLocation);

    if (prefillToolName) {
      setSelectedTools({ [prefillToolName]: "1" });
      setToolSearch(prefillToolName);
    }
  }, [prefillWorkerName, prefillLocation, prefillToolName]);

  const currentCatalog = toolCatalog[profession as keyof typeof toolCatalog] || {};

  const flatCatalogTools = useMemo(() => {
    const rows: { sectionName: string; toolName: string }[] = [];

    Object.entries(currentCatalog).forEach(([sectionName, sectionTools]) => {
      const safeTools = Array.isArray(sectionTools) ? sectionTools : [];
      safeTools.forEach((toolName) => rows.push({ sectionName, toolName }));
    });

    return rows;
  }, [currentCatalog]);

  const filteredCatalogTools = useMemo(() => {
    const query = toolSearch.trim().toLowerCase();

    if (!query) return flatCatalogTools;

    return flatCatalogTools.filter((item) => {
      return (
        item.toolName.toLowerCase().includes(query) ||
        item.sectionName.toLowerCase().includes(query)
      );
    });
  }, [flatCatalogTools, toolSearch]);

  const selectProfession = (selectedProfession: string) => {
    setProfession(selectedProfession);

    if (prefillToolName) {
      setSelectedTools({ [prefillToolName]: "1" });
    } else {
      setSelectedTools({});
    }
  };

  const getAssignedQuantity = (toolName: string) => {
    return tools
      .filter(
        (tool) =>
          tool.name === toolName &&
          (tool.status === "In Use" || tool.borrowedBy || tool.holder)
      )
      .reduce((sum, tool) => sum + Number(tool.quantity || 0), 0);
  };

  const getAvailableQuantity = (toolName: string) => {
    const total = Number(warehouseStock[toolName] || 0);
    const assigned = getAssignedQuantity(toolName);

    if (prefillToolName && toolName === prefillToolName && total === 0) return 0;

    return total - assigned;
  };

  const updateQuantity = (toolName: string, quantity: string) => {
    setSelectedTools((current) => {
      const updated = { ...current };

      if (!quantity || quantity === "0") {
        delete updated[toolName];
      } else {
        updated[toolName] = quantity;
      }

      return updated;
    });
  };

  const findCategory = (toolName: string) => {
    if (prefillCategory && toolName === prefillToolName) return prefillCategory;

    for (const [sectionName, sectionTools] of Object.entries(currentCatalog)) {
      const safeTools = Array.isArray(sectionTools) ? sectionTools : [];
      if (safeTools.includes(toolName)) return sectionName;
    }

    if (toolName.toLowerCase().includes("tester") || toolName.toLowerCase().includes("meter")) {
      return "MeasuringTools";
    }

    return "General";
  };

  const addCustomToolToSelection = () => {
    const normalizedName = normalizeCustomName(customToolName);

    if (!normalizedName) {
      Alert.alert(t("error"), "Write a custom tool name first.");
      return;
    }

    setSelectedTools((current) => ({
      ...current,
      [normalizedName]: customQuantity || "1",
    }));

    setToolSearch(normalizedName);
    setCustomToolName("");
    setCustomQuantity("1");
  };

  const saveTools = async () => {
    if (saving) return;

    const assignedWorker = workerName.trim();
    const toolsToSave = Object.entries(selectedTools).filter(
      ([, quantity]) => quantity && quantity !== "0"
    );

    if (toolsToSave.length === 0) {
      Alert.alert(t("error"), "Select at least one tool with quantity");
      return;
    }

    try {
      setSaving(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        Alert.alert(t("error"), userError.message);
        return;
      }

      const localTools = toolsToSave.map(([toolName, quantity]) => ({
        id: `${Date.now()}-${toolName}-${Math.random()}`,
        name: toolName,
        profession,
        category: findCategory(toolName),
        brand: "",
        quantity,
        status: assignedWorker ? "In Use" : "Available",
        location: location || "Warehouse",
        holder: assignedWorker,
        borrowedBy: assignedWorker,
        returnDate: "",
        notes: "",
        image: getAutoImage(toolName),
      }));

      if (user) {
        const cloudTools = localTools.map((tool) => ({
          user_id: user.id,
          name: tool.name,
          profession: tool.profession,
          category: tool.category,
          brand: tool.brand,
          quantity: tool.quantity,
          location: tool.location,
          holder: tool.holder,
          status: tool.status,
          borrowed_by: tool.borrowedBy,
          return_date: null,
          notes: tool.notes,
          image: tool.image,
        }));

        const { data: insertedTools, error: insertError } = await supabase
          .from("tools")
          .insert(cloudTools)
          .select("*");

        if (insertError) {
          Alert.alert(t("error"), insertError.message);
          return;
        }

        const toolsWithCloudIds = (insertedTools || []).map((item: any) => ({
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

        toolsWithCloudIds.forEach((tool) => addTool(tool));
      } else {
        localTools.forEach((tool) => addTool(tool));
      }

      Alert.alert(
        t("success"),
        assignedWorker
          ? `${toolsToSave.length} tool(s) assigned to ${assignedWorker}`
          : `${toolsToSave.length} tool(s) added to inventory`
      );

      if (assignedWorker) {
        router.replace({
          pathname: "/worker-details",
          params: { workerName: assignedWorker },
        } as any);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert(t("error"), "Failed to save tools");
    } finally {
      setSaving(false);
    }
  };

  const renderOptions = (
    items: string[],
    selected: string,
    setSelected: (value: string) => void
  ) => (
    <View style={styles.optionsWrap}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.optionButton, selected === item && styles.optionButtonActive]}
          onPress={() => setSelected(item)}
        >
          <Text style={[styles.optionText, selected === item && styles.optionTextActive]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPrefilledTool = () => {
    if (!prefillToolName) return null;

    return (
      <View style={styles.prefillCard}>
        <Text style={styles.prefillLabel}>AI detected tool</Text>

        <View style={styles.prefillRow}>
          <Text style={styles.prefillIcon}>{getToolIcon(prefillToolName)}</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.prefillName}>{prefillToolName}</Text>
            <Text style={styles.prefillCategory}>{prefillCategory || "General"}</Text>
          </View>

          <TextInput
            placeholder="1"
            placeholderTextColor="#888"
            style={styles.quantityInput}
            value={selectedTools[prefillToolName] || "1"}
            onChangeText={(value) => updateQuantity(prefillToolName, value)}
            keyboardType="numeric"
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t("addAssignTools")}</Text>

      {prefillWorkerName ? (
        <View style={styles.workerNotice}>
          <Text style={styles.workerNoticeTitle}>Adding tools to</Text>
          <Text style={styles.workerNoticeName}>{prefillWorkerName}</Text>
        </View>
      ) : null}

      {renderPrefilledTool()}

      <Text style={styles.label}>👷 Worker / Team</Text>
      <TextInput
        placeholder="e.g. Ali, Mehmet, Team A"
        placeholderTextColor="#888"
        style={styles.input}
        value={workerName}
        onChangeText={setWorkerName}
      />

      <Text style={styles.label}>📍 Location</Text>
      <TextInput
        placeholder="e.g. Warehouse, Site A, Van 1"
        placeholderTextColor="#888"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>🔧 Profession</Text>
      {renderOptions(professions, profession, selectProfession)}

      {!prefillToolName ? (
        <>
          <Text style={styles.label}>🔎 Search Tool</Text>
          <TextInput
            placeholder="Search drill, tester, screwdriver..."
            placeholderTextColor="#888"
            style={styles.input}
            value={toolSearch}
            onChangeText={setToolSearch}
            autoCorrect={false}
          />

          <View style={styles.customCard}>
            <Text style={styles.customTitle}>+ Custom Tool</Text>

            <TextInput
              placeholder="e.g. Voltage Tester, Laser Level, Makita Battery"
              placeholderTextColor="#888"
              style={styles.input}
              value={customToolName}
              onChangeText={setCustomToolName}
              autoCorrect={false}
            />

            <TextInput
              placeholder="Qty"
              placeholderTextColor="#888"
              style={styles.customQtyInput}
              value={customQuantity}
              onChangeText={setCustomQuantity}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.customButton} onPress={addCustomToolToSelection}>
              <Text style={styles.customButtonText}>Add Custom Tool</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>📦 Tools & Quantity</Text>

          {filteredCatalogTools.length === 0 ? (
            <Text style={styles.emptyText}>No catalog tool found. Use Custom Tool above.</Text>
          ) : (
            <View style={styles.sectionCard}>
              {filteredCatalogTools.map(({ sectionName, toolName }) => {
                const available = getAvailableQuantity(toolName);
                const selectedQuantity = Number(selectedTools[toolName] || 0);
                const isOverStock = !!workerName.trim() && selectedQuantity > available;

                return (
                  <View key={`${sectionName}-${toolName}`} style={styles.toolRow}>
                    <View style={styles.toolNameWrap}>
                      <Text style={styles.toolIcon}>{getToolIcon(toolName)}</Text>

                      <View style={styles.toolTextBox}>
                        <Text style={styles.toolName}>{toolName}</Text>
                        <Text style={styles.toolSection}>{sectionName}</Text>
                        <Text style={[styles.availableText, available <= 0 && styles.noStockText]}>
                          {t("available")}: {available}
                        </Text>
                      </View>
                    </View>

                    <TextInput
                      placeholder="0"
                      placeholderTextColor="#888"
                      style={[styles.quantityInput, isOverStock && styles.quantityInputError]}
                      value={selectedTools[toolName] || ""}
                      onChangeText={(value) => updateQuantity(toolName, value)}
                      keyboardType="numeric"
                    />
                  </View>
                );
              })}
            </View>
          )}
        </>
      ) : null}

      {Object.keys(selectedTools).length > 0 ? (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedTitle}>Selected Tools</Text>
          {Object.entries(selectedTools).map(([toolName, qty]) => (
            <View key={toolName} style={styles.selectedRow}>
              <Text style={styles.selectedText}>
                {getToolIcon(toolName)} {toolName}
              </Text>
              <Text style={styles.selectedQty}>x{qty}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, saving && styles.disabledButton]}
        onPress={saveTools}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? t("loading") : workerName.trim() ? "Assign Tool" : "Add to Inventory"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (prefillWorkerName) {
            router.replace({
              pathname: "/worker-details",
              params: { workerName: prefillWorkerName },
            } as any);
          } else {
            router.replace("/(tabs)");
          }
        }}
      >
        <Text style={styles.backButtonText}>{t("back")}</Text>
      </TouchableOpacity>

      <View style={{ height: 70 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020b1f", padding: 20 },
  title: {
    color: "white",
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 22,
  },
  workerNotice: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  workerNoticeTitle: { color: "#9ca3af", fontSize: 14, marginBottom: 4 },
  workerNoticeName: { color: "#ff6b00", fontSize: 24, fontWeight: "bold" },
  prefillCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ff6b00",
  },
  prefillLabel: {
    color: "#ff6b00",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },
  prefillRow: { flexDirection: "row", alignItems: "center" },
  prefillIcon: { fontSize: 34, marginRight: 14 },
  prefillName: { color: "white", fontSize: 22, fontWeight: "bold" },
  prefillCategory: { color: "#9ca3af", fontSize: 14, marginTop: 3 },

  label: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#111c34",
    color: "white",
    padding: 18,
    borderRadius: 16,
    fontSize: 18,
    marginBottom: 18,
  },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  optionButton: {
    backgroundColor: "#111c34",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  optionButtonActive: {
    backgroundColor: "#ff6b00",
    borderColor: "#ff6b00",
  },
  optionText: { color: "#d1d5db", fontSize: 16, fontWeight: "bold" },
  optionTextActive: { color: "white" },

  customCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  customTitle: {
    color: "#ff6b00",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  customQtyInput: {
    backgroundColor: "#020b1f",
    color: "white",
    width: 110,
    padding: 14,
    borderRadius: 12,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#374151",
    marginBottom: 12,
  },
  customButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  customButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },

  sectionCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },
  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#1f2937",
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  toolNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  toolIcon: { fontSize: 24, marginRight: 10 },
  toolTextBox: { flex: 1 },
  toolName: { color: "white", fontSize: 17, fontWeight: "bold" },
  toolSection: { color: "#9ca3af", fontSize: 12, marginTop: 3 },
  availableText: {
    color: "#86efac",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
  },
  noStockText: { color: "#f87171" },
  quantityInput: {
    backgroundColor: "#020b1f",
    color: "white",
    width: 80,
    padding: 12,
    borderRadius: 12,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  quantityInputError: { borderColor: "#ef4444", borderWidth: 2 },

  selectedCard: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  selectedTitle: {
    color: "#ff6b00",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  selectedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    paddingVertical: 8,
  },
  selectedText: { color: "white", fontSize: 15, fontWeight: "bold" },
  selectedQty: { color: "#ff6b00", fontSize: 15, fontWeight: "bold" },

  button: {
    backgroundColor: "#ff6b00",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20,
  },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: "white", fontSize: 22, fontWeight: "bold" },
  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 60,
  },
  backButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  emptyText: { color: "#9ca3af", fontSize: 16, marginBottom: 18 },
});