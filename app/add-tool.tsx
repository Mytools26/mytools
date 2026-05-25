import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";

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

type SelectedTools = {
  [toolName: string]: string;
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
    name.includes("distribution") ||
    name.includes("breaker") ||
    name.includes("fuse") ||
    name.includes("relay") ||
    name.includes("contactor") ||
    name.includes("push button") ||
    name.includes("emergency")
  ) {
    return "electrical";
  }

  if (
    name.includes("glove") ||
    name.includes("helmet") ||
    name.includes("glasses")
  ) {
    return "safety";
  }

  return "tool";
};

const getToolIcon = (toolName: string) => {
  const image = getAutoImage(toolName);

  switch (image) {
    case "drill":
      return "🛠️";
    case "screwdriver":
      return "🪛";
    case "battery":
      return "🔋";
    case "ladder":
      return "🪜";
    case "tester":
      return "📟";
    case "cutter":
      return "✂️";
    case "grinder":
      return "⚙️";
    case "saw":
      return "🪚";
    case "light":
      return "💡";
    case "electrical":
      return "⚡";
    case "safety":
      return "🦺";
    default:
      return "🔧";
  }
};

export default function AddToolScreen() {
  const params = useLocalSearchParams();

  const prefillWorkerName = String(params.workerName || "");
  const prefillLocation = String(params.location || "");

  const addTool = useToolStore((state) => state.addTool);
  const tools = useToolStore((state) => state.tools || []);
  const warehouseStock = useToolStore((state) => state.warehouseStock || {});

  const [workerName, setWorkerName] = useState(prefillWorkerName);
  const [profession, setProfession] = useState(professions[0] || "Electrician");
  const [location, setLocation] = useState(prefillLocation);
  const [selectedTools, setSelectedTools] = useState<SelectedTools>({});

  useEffect(() => {
    if (prefillWorkerName) {
      setWorkerName(prefillWorkerName);
    }

    if (prefillLocation) {
      setLocation(prefillLocation);
    }
  }, [prefillWorkerName, prefillLocation]);

  const currentCatalog =
    toolCatalog[profession as keyof typeof toolCatalog] || {};

  const selectProfession = (selectedProfession: string) => {
    setProfession(selectedProfession);
    setSelectedTools({});
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
    for (const [sectionName, sectionTools] of Object.entries(currentCatalog)) {
      const safeTools = Array.isArray(sectionTools) ? sectionTools : [];

      if (safeTools.includes(toolName)) {
        return sectionName;
      }
    }

    return "General";
  };

  const saveTools = () => {
    const assignedWorker = workerName.trim();

    const toolsToSave = Object.entries(selectedTools).filter(
      ([, quantity]) => quantity && quantity !== "0"
    );

    if (toolsToSave.length === 0) {
      Alert.alert("Error", "Select at least one tool with quantity");
      return;
    }

    if (assignedWorker) {
      for (const [toolName, quantity] of toolsToSave) {
        const requested = Number(quantity || 0);
        const available = getAvailableQuantity(toolName);

        if (available <= 0) {
          Alert.alert("No stock available", `${toolName} has no available stock.`);
          return;
        }

        if (requested > available) {
          Alert.alert(
            "Not enough stock",
            `${toolName}: only ${available} available, but you selected ${requested}.`
          );
          return;
        }
      }
    }

    toolsToSave.forEach(([toolName, quantity]) => {
      addTool({
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
      });
    });

    Alert.alert(
      "Success",
      assignedWorker
        ? `${toolsToSave.length} tools assigned to ${assignedWorker}`
        : `${toolsToSave.length} tools added to inventory`
    );

    if (assignedWorker) {
      router.replace({
        pathname: "/worker-details",
        params: {
          workerName: assignedWorker,
        },
      } as any);
    } else {
      router.replace("/(tabs)");
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
          style={[
            styles.optionButton,
            selected === item && styles.optionButtonActive,
          ]}
          onPress={() => setSelected(item)}
        >
          <Text
            style={[
              styles.optionText,
              selected === item && styles.optionTextActive,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add / Assign Tools</Text>

      {prefillWorkerName ? (
        <View style={styles.workerNotice}>
          <Text style={styles.workerNoticeTitle}>Adding tools to</Text>
          <Text style={styles.workerNoticeName}>{prefillWorkerName}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Worker Name</Text>

      <TextInput
        placeholder="e.g. Ali, Mehmet, Team A"
        placeholderTextColor="#888"
        style={styles.input}
        value={workerName}
        onChangeText={setWorkerName}
      />

      <Text style={styles.label}>Location / Project</Text>

      <TextInput
        placeholder="e.g. Site A, Van 1, Warehouse"
        placeholderTextColor="#888"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Profession</Text>

      {renderOptions(professions, profession, selectProfession)}

      <Text style={styles.label}>Tools & Quantity</Text>

      {Object.entries(currentCatalog).map(([sectionName, sectionTools]) => {
        const safeTools = Array.isArray(sectionTools) ? sectionTools : [];

        return (
          <View key={sectionName} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{sectionName}</Text>

            {safeTools.map((toolName) => {
              const available = getAvailableQuantity(toolName);
              const selectedQuantity = Number(selectedTools[toolName] || 0);
              const isOverStock =
                !!workerName.trim() && selectedQuantity > available;

              return (
                <View key={toolName} style={styles.toolRow}>
                  <View style={styles.toolNameWrap}>
                    <Text style={styles.toolIcon}>{getToolIcon(toolName)}</Text>

                    <View style={styles.toolTextBox}>
                      <Text style={styles.toolName}>{toolName}</Text>

                      <Text
                        style={[
                          styles.availableText,
                          available <= 0 && styles.noStockText,
                        ]}
                      >
                        Available: {available}
                      </Text>
                    </View>
                  </View>

                  <TextInput
                    placeholder="0"
                    placeholderTextColor="#888"
                    style={[
                      styles.quantityInput,
                      isOverStock && styles.quantityInputError,
                    ]}
                    value={selectedTools[toolName] || ""}
                    onChangeText={(value) => updateQuantity(toolName, value)}
                    keyboardType="numeric"
                  />
                </View>
              );
            })}
          </View>
        );
      })}

      <TouchableOpacity style={styles.button} onPress={saveTools}>
        <Text style={styles.buttonText}>Save Selected Tools</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (prefillWorkerName) {
            router.replace({
              pathname: "/worker-details",
              params: {
                workerName: prefillWorkerName,
              },
            } as any);
          } else {
            router.replace("/(tabs)");
          }
        }}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={{ height: 70 }} />
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

  workerNoticeTitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 4,
  },

  workerNoticeName: {
    color: "#ff6b00",
    fontSize: 24,
    fontWeight: "bold",
  },

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

  optionText: {
    color: "#d1d5db",
    fontSize: 16,
    fontWeight: "bold",
  },

  optionTextActive: {
    color: "white",
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
    paddingVertical: 12,
  },

  toolNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },

  toolIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  toolTextBox: {
    flex: 1,
  },

  toolName: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },

  availableText: {
    color: "#86efac",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
  },

  noStockText: {
    color: "#f87171",
  },

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

  quantityInputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
  },

  button: {
    backgroundColor: "#ff6b00",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "white",
    fontSize: 22,
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