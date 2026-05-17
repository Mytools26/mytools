import { router } from "expo-router";
import React, { useMemo, useState } from "react";

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
import toolCatalog from "./toolCatalog";

const professions = Object.keys(toolCatalog || {});

const guessCategory = (toolName: string) => {
  const name = toolName.toLowerCase();

  if (name.includes("screwdriver")) return "Screwdrivers";
  if (name.includes("drill") || name.includes("grinder") || name.includes("saw")) return "PowerTools";
  if (name.includes("battery") || name.includes("charger")) return "BatteriesChargers";
  if (name.includes("meter") || name.includes("tester") || name.includes("laser")) return "MeasuringTools";
  if (name.includes("cable") || name.includes("wire") || name.includes("crimp")) return "CableTools";
  if (name.includes("glove") || name.includes("helmet") || name.includes("glasses")) return "SafetyEquipment";
  if (name.includes("light")) return "Lighting";

  return "CustomTools";
};

const getAutoImage = (toolName: string) => {
  const name = toolName.toLowerCase();

  if (name.includes("drill")) return "drill";
  if (name.includes("screwdriver")) return "screwdriver";
  if (name.includes("battery")) return "battery";
  if (name.includes("ladder")) return "ladder";
  if (name.includes("meter") || name.includes("tester")) return "tester";
  if (name.includes("cutter")) return "cutter";
  if (name.includes("grinder")) return "grinder";
  if (name.includes("saw")) return "saw";
  if (name.includes("light")) return "light";

  if (
    name.includes("terminal") ||
    name.includes("cable") ||
    name.includes("junction") ||
    name.includes("breaker") ||
    name.includes("relay") ||
    name.includes("contactor")
  ) {
    return "electrical";
  }

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

  const currentCatalog =
    toolCatalog[profession as keyof typeof toolCatalog] || {};

  const allTools = useMemo(() => {
    const catalogTools = Object.entries(currentCatalog).flatMap(
      ([sectionName, sectionTools]) => {
        const safeTools = Array.isArray(sectionTools) ? sectionTools : [];

        return safeTools.map((toolName) => ({
          name: toolName,
          section: sectionName,
          isCustom: false,
        }));
      }
    );

    const customProfessionTools = customTools
      .filter((tool) => tool.profession === profession)
      .map((tool) => ({
        name: tool.name,
        section: tool.category || "CustomTools",
        isCustom: true,
      }));

    return [...catalogTools, ...customProfessionTools];
  }, [currentCatalog, customTools, profession]);

  const searchText = search.trim().toLowerCase();

  const exactTool = allTools.find(
    (tool) => tool.name.toLowerCase() === searchText
  );

  const filteredTools = searchText
    ? allTools.filter((tool) => tool.name.toLowerCase().includes(searchText))
    : allTools;

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.section]) {
      acc[tool.section] = [];
    }

    acc[tool.section].push(tool.name);

    return acc;
  }, {} as Record<string, string[]>);

  const getCurrentValue = (toolName: string) => {
    return draftStock[toolName] ?? warehouseStock[toolName] ?? "";
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
    const total = Number(getCurrentValue(toolName) || 0);
    const assigned = getAssignedQuantity(toolName);

    return total - assigned;
  };

  const saveQuantity = (toolName: string) => {
    const savedQuantity = getCurrentValue(toolName);
    setWarehouseQuantity(toolName, savedQuantity);
    Alert.alert("Saved", `${toolName} stock saved.`);
  };

  const saveSmartTool = () => {
    const name = search.trim();

    if (!name) {
      Alert.alert("Error", "Type a tool name first.");
      return;
    }

    if (!quantity.trim()) {
      Alert.alert("Error", "Enter quantity.");
      return;
    }

    const category = exactTool?.section || guessCategory(name);

    if (!exactTool) {
      addCustomTool({
        id: `${Date.now()}-${name}`,
        name,
        profession,
        category,
        image: getAutoImage(name),
      });
    }

    setWarehouseQuantity(name, quantity.trim());

    setDraftStock((current) => ({
      ...current,
      [name]: quantity.trim(),
    }));

    Alert.alert(
      "Saved",
      exactTool ? `${name} quantity updated.` : `${name} added as custom tool.`
    );

    setSearch("");
    setQuantity("");
  };

  const renderProfessionButton = (item: string) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.optionButton,
        profession === item && styles.optionButtonActive,
      ]}
      onPress={() => {
        setProfession(item);
        setSearch("");
        setQuantity("");
      }}
    >
      <Text
        style={[
          styles.optionText,
          profession === item && styles.optionTextActive,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Warehouse Stock</Text>

      <Text style={styles.subtitle}>
        Search a tool, set quantity, or add it if it does not exist
      </Text>

      <Text style={styles.label}>Profession</Text>

      <View style={styles.optionsWrap}>
        {professions.map(renderProfessionButton)}
      </View>

      <View style={styles.smartCard}>
        <Text style={styles.sectionTitle}>Smart Tool Search</Text>

        <TextInput
          placeholder="Type tool name..."
          placeholderTextColor="#888"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />

        {search.trim() ? (
          <Text style={exactTool ? styles.foundText : styles.notFoundText}>
            {exactTool
              ? `Tool found in ${exactTool.section}`
              : "Tool not found. It will be added as a new custom tool."}
          </Text>
        ) : null}

        <TextInput
          placeholder="Quantity"
          placeholderTextColor="#888"
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.addButton} onPress={saveSmartTool}>
          <Text style={styles.addButtonText}>
            {exactTool ? "Save Quantity" : "Add / Save Tool"}
          </Text>
        </TouchableOpacity>
      </View>

      {Object.entries(groupedTools).map(([sectionName, sectionTools]) => (
        <View key={sectionName} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{sectionName}</Text>

          {sectionTools.map((toolName) => {
            const total = getCurrentValue(toolName);
            const assigned = getAssignedQuantity(toolName);
            const available = getAvailableQuantity(toolName);
            const isNegative = available < 0;

            return (
              <View key={toolName} style={styles.toolRow}>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolName}>{toolName}</Text>

                  <Text style={styles.toolMeta}>
                    Total: {total || "0"} · Assigned: {assigned}
                  </Text>

                  <Text
                    style={[
                      styles.availableText,
                      isNegative && styles.negativeText,
                    ]}
                  >
                    Available: {available}
                  </Text>
                </View>

                <View style={styles.rightBox}>
                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#888"
                    style={styles.quantityInput}
                    value={total}
                    onChangeText={(value) =>
                      setDraftStock((current) => ({
                        ...current,
                        [toolName]: value,
                      }))
                    }
                    keyboardType="numeric"
                  />

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => saveQuantity(toolName)}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
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

  title: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 60,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 24,
  },

  label: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#020b1f",
    color: "white",
    padding: 16,
    borderRadius: 14,
    fontSize: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },

  smartCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },

  foundText: {
    color: "#86efac",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },

  notFoundText: {
    color: "#fbbf24",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 12,
  },

  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
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

  optionText: {
    color: "#d1d5db",
    fontSize: 16,
    fontWeight: "bold",
  },

  optionTextActive: {
    color: "white",
  },

  addButton: {
    backgroundColor: "#ff6b00",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  sectionCard: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },

  sectionTitle: {
    color: "#ff6b00",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },

  toolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomColor: "#1f2937",
    borderBottomWidth: 1,
    paddingVertical: 14,
  },

  toolInfo: {
    flex: 1,
    paddingRight: 12,
  },

  toolName: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  toolMeta: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 4,
  },

  availableText: {
    color: "#86efac",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
  },

  negativeText: {
    color: "#f87171",
  },

  rightBox: {
    alignItems: "center",
  },

  quantityInput: {
    backgroundColor: "#020b1f",
    color: "white",
    width: 85,
    padding: 12,
    borderRadius: 12,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },

  saveButton: {
    backgroundColor: "#ff6b00",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },

  saveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 60,
  },

  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});