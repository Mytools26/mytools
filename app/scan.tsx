import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";

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

const getToolEmoji = (toolName: string) => {
  const name = String(toolName || "").toLowerCase();

  if (name.includes("voltage") || name.includes("tester") || name.includes("meter")) return "📟";
  if (name.includes("drill")) return "🛠️";
  if (name.includes("screwdriver")) return "🪛";
  if (name.includes("battery")) return "🔋";
  if (name.includes("grinder")) return "⚙️";
  if (name.includes("saw")) return "🪚";
  if (name.includes("ladder")) return "🪜";
  if (name.includes("light")) return "💡";
  if (name.includes("wrench")) return "🔧";
  if (name.includes("pliers")) return "🗜️";
  if (name.includes("hammer")) return "🔨";

  return "🔧";
};

const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const normalizeDetectedTool = (parsed: any) => {
  let normalizedName = String(parsed.name || "Unknown Tool");
  let normalizedCategory = String(parsed.category || "General");
  let normalizedKeyword = String(parsed.keyword || "").toLowerCase();
  let normalizedIcon = parsed.icon || getToolEmoji(normalizedName);
  let normalizedConfidence = parsed.confidence || "low";

  const rawText = `${normalizedName} ${normalizedCategory} ${normalizedKeyword}`.toLowerCase();

  if (
    rawText.includes("highlighter") ||
    rawText.includes("marker") ||
    rawText.includes("pen") ||
    rawText.includes("voltage") ||
    rawText.includes("tester") ||
    rawText.includes("phase tester") ||
    rawText.includes("electrical tester") ||
    rawText.includes("neon tester") ||
    rawText.includes("test screwdriver")
  ) {
    normalizedName = "Voltage Tester";
    normalizedCategory = "MeasuringTools";
    normalizedKeyword = "tester";
    normalizedIcon = "📟";
    normalizedConfidence = normalizedConfidence === "high" ? "high" : "medium";
  }

  if (rawText.includes("screwdriver") && !rawText.includes("tester")) {
    normalizedName = "Screwdriver";
    normalizedCategory = "Screwdrivers";
    normalizedKeyword = "screwdriver";
    normalizedIcon = "🪛";
  }

  if (rawText.includes("drill")) {
    normalizedName = "Drill";
    normalizedCategory = "PowerTools";
    normalizedKeyword = "drill";
    normalizedIcon = "🛠️";
  }

  if (rawText.includes("pliers")) {
    normalizedName = "Pliers";
    normalizedCategory = "HandTools";
    normalizedKeyword = "pliers";
    normalizedIcon = "🗜️";
  }

  if (rawText.includes("wrench")) {
    normalizedName = "Wrench";
    normalizedCategory = "HandTools";
    normalizedKeyword = "wrench";
    normalizedIcon = "🔧";
  }

  if (rawText.includes("hammer")) {
    normalizedName = "Hammer";
    normalizedCategory = "HandTools";
    normalizedKeyword = "hammer";
    normalizedIcon = "🔨";
  }

  return {
    name: normalizedName,
    category: normalizedCategory,
    keyword: normalizedKeyword,
    icon: normalizedIcon,
    confidence: normalizedConfidence,
  };
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const tools = useToolStore((state) => state.tools || []);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [workerName, setWorkerName] = useState("");

  const matchingTools = useMemo(() => {
    if (!result?.keyword && !result?.name) return [];

    const keyword = String(result.keyword || "").toLowerCase().trim();
    const name = String(result.name || "").toLowerCase().trim();

    return tools.filter((tool) => {
      const toolName = String(tool.name || "").toLowerCase();
      const toolCategory = String(tool.category || "").toLowerCase();
      const toolImage = String(tool.image || "").toLowerCase();

      return (
        (keyword && toolName.includes(keyword)) ||
        (keyword && toolCategory.includes(keyword)) ||
        (keyword && toolImage.includes(keyword)) ||
        (name && toolName.includes(name))
      );
    });
  }, [result, tools]);

  const firstMatch = matchingTools[0];

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>
        <TouchableOpacity style={styles.scanButton} onPress={requestPermission}>
          <Text style={styles.scanButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const openAddTool = (assignedWorker?: string) => {
    if (!result?.name) return;

    router.push({
      pathname: "/add-tool",
      params: {
        prefillName: result.name,
        prefillCategory: result.category || "General",
        workerName: assignedWorker || "",
        location: assignedWorker ? "Assigned from Scanner" : "Warehouse",
      },
    } as any);
  };

  const openMatchedTool = (tool: any) => {
    const assignedWorker = tool.borrowedBy || tool.holder;

    if (assignedWorker) {
      router.push({
        pathname: "/worker-details",
        params: { workerName: assignedWorker },
      } as any);
      return;
    }

    router.push("/(tabs)" as any);
  };

  const handleAssignToWorker = () => {
    const cleanWorker = workerName.trim();

    if (!cleanWorker) {
      Alert.alert("Worker required", "Write worker name first, e.g. Worker A or Ali.");
      return;
    }

    openAddTool(cleanWorker);
  };

  const handleScan = async () => {
    try {
      if (!cameraRef.current) return;

      const apiKey = process.env.EXPO_PUBLIC_CLAUDE_KEY;

      if (!apiKey) {
        Alert.alert(
          "Missing API key",
          "EXPO_PUBLIC_CLAUDE_KEY is missing. Check your .env file and restart Expo with: npx expo start -c"
        );
        return;
      }

      setLoading(true);
      setResult(null);
      setAiResponse("");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: false,
      });

      if (!photo?.base64) {
        Alert.alert("Camera error", "Could not capture image data.");
        return;
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/jpeg",
                    data: photo.base64,
                  },
                },
                {
                  type: "text",
                  text:
                    'Identify the main hand tool, construction tool, electrical tool, or workshop tool in this image. Return ONLY valid JSON. No markdown. No explanation. Use this exact shape: {"name":"Voltage Tester","category":"MeasuringTools","keyword":"tester","icon":"📟","confidence":"high"} Valid categories: PowerTools, Screwdrivers, MeasuringTools, BatteriesChargers, CableTools, SafetyEquipment, Lighting, HandTools, General. Important: a voltage tester, phase tester, neon tester, electrical tester, or test screwdriver must be identified as Voltage Tester, not Screwdriver, Highlighter, Marker, or Pen. Screwdriver only means a normal screwdriver used mainly for screws. Common outputs: Drill, Screwdriver, Voltage Tester, Multimeter, Battery, Grinder, Saw, Ladder, Work Light, Wrench, Pliers, Hammer, Tape Measure, Cutter Knife, Cable Cutter, Safety Helmet, Safety Gloves. Valid keywords: drill, screwdriver, tester, multimeter, battery, grinder, saw, ladder, light, wrench, pliers, hammer, tape, cutter, cable, helmet, gloves. If unsure, still make the best guess and use confidence "low".',
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      console.log("CLAUDE RAW RESPONSE:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        Alert.alert(
          "Claude API error",
          data?.error?.message || `Request failed with status ${response.status}`
        );
        return;
      }

      const text = data?.content?.[0]?.text || "";
      setAiResponse(text);

      console.log("CLAUDE TEXT:", text);

      const parsed = safeJsonParse(text);

      if (!parsed?.name) {
        Alert.alert(
          "Could not read AI response",
          "Claude responded, but the app could not parse the result. Check the terminal logs."
        );
        return;
      }

      const finalResult = normalizeDetectedTool(parsed);
      setResult(finalResult);
    } catch (error) {
      console.log("SCAN ERROR:", error);
      Alert.alert("Error", "Failed to scan. Check terminal logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.overlay}>
        <Text style={styles.title}>AI Tool Scanner</Text>
        <Text style={styles.subtitle}>Scan, find, add, or assign tools</Text>

        <View style={styles.scanBox} />

        {result ? (
          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.resultCard}>
              <Text style={styles.resultIcon}>{result.icon}</Text>
              <Text style={styles.resultTitle}>{result.name}</Text>
              <Text style={styles.resultCategory}>{result.category}</Text>
              <Text
                style={[
                  styles.resultCategory,
                  { color: result.confidence === "high" ? "#22c55e" : "#f59e0b" },
                ]}
              >
                {result.confidence === "high" ? "High confidence" : "Low/Medium confidence"}
              </Text>
            </View>

            <View style={styles.actionCard}>
              <Text style={styles.actionTitle}>What do you want to do?</Text>

              <TouchableOpacity style={styles.actionButton} onPress={() => openAddTool()}>
                <Text style={styles.actionButtonText}>+ Add to Inventory</Text>
              </TouchableOpacity>

              <TextInput
                placeholder="Worker name: e.g. Worker A, Ali, Mehmet"
                placeholderTextColor="#888"
                style={styles.workerInput}
                value={workerName}
                onChangeText={setWorkerName}
              />

              <TouchableOpacity style={styles.assignButton} onPress={handleAssignToWorker}>
                <Text style={styles.actionButtonText}>Assign to Worker</Text>
              </TouchableOpacity>

              {firstMatch ? (
                <TouchableOpacity style={styles.openButton} onPress={() => openMatchedTool(firstMatch)}>
                  <Text style={styles.actionButtonText}>Open Matching Tool</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {matchingTools.length > 0 ? (
              <>
                <Text style={styles.matchTitle}>Found in Inventory</Text>

                {matchingTools.map((tool, index) => {
                  const realId = tool.id || `old-tool-${index}`;

                  return (
                    <TouchableOpacity
                      key={realId}
                      style={styles.matchCard}
                      onPress={() => openMatchedTool(tool)}
                    >
                      <View style={styles.matchLeft}>
                        <Text style={styles.matchEmoji}>{getToolEmoji(tool.name || "")}</Text>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.matchName}>{tool.name}</Text>
                          <Text style={styles.matchMeta}>
                            Qty: {tool.quantity || "0"} · {tool.borrowedBy || tool.holder || "Storage"}
                          </Text>
                          <Text style={styles.matchMeta}>
                            {tool.category || "General"} · {tool.status || "Unknown"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.openBadge}>
                        <Text style={styles.openText}>OPEN</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              <View style={styles.noMatchCard}>
                <Text style={styles.noMatchText}>No matching tools in inventory yet.</Text>
              </View>
            )}

            {aiResponse ? <Text style={styles.debugText}>AI: {aiResponse}</Text> : null}
          </ScrollView>
        ) : null}

        <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={loading}>
          <Text style={styles.scanButtonText}>
            {loading ? "AI Scanning..." : "Scan Tool"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#d1d5db",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  scanBox: {
    borderWidth: 3,
    borderColor: "#ff6b00",
    borderRadius: 24,
    width: 260,
    height: 260,
    alignSelf: "center",
    marginBottom: 30,
  },
  resultsContainer: { maxHeight: 420, marginBottom: 20 },
  resultCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  resultIcon: { fontSize: 42, marginBottom: 10 },
  resultTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  resultCategory: { color: "#9ca3af", fontSize: 15, marginTop: 4 },
  actionCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  actionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#ff6b00",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  assignButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  openButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  actionButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  workerInput: {
    backgroundColor: "#020b1f",
    color: "white",
    padding: 14,
    borderRadius: 14,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },
  matchTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  noMatchCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 10,
  },
  noMatchText: { color: "#9ca3af", fontSize: 15 },
  matchCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  matchEmoji: { fontSize: 26, marginRight: 12 },
  matchName: { color: "white", fontSize: 16, fontWeight: "bold" },
  matchMeta: { color: "#9ca3af", fontSize: 12, marginTop: 3 },
  openBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },
  openText: { color: "#60a5fa", fontSize: 11, fontWeight: "bold" },
  scanButton: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  scanButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  backButton: {
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#111827",
  },
  backButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  center: {
    flex: 1,
    backgroundColor: "#020b1f",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: { color: "white", fontSize: 18, marginBottom: 20 },
  debugText: {
    color: "#9ca3af",
    fontSize: 11,
    marginTop: 10,
    marginBottom: 10,
  },
});