import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useToolStore } from "../toolStore";

const getToolEmoji = (toolName: string) => {
  const name = toolName.toLowerCase();
  if (name.includes("drill")) return "🛠️";
  if (name.includes("screwdriver")) return "🪛";
  if (name.includes("battery")) return "🔋";
  if (name.includes("tester") || name.includes("meter")) return "📟";
  if (name.includes("grinder")) return "⚙️";
  if (name.includes("saw")) return "🪚";
  if (name.includes("ladder")) return "🪜";
  if (name.includes("light")) return "💡";
  return "🔧";
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const tools = useToolStore((state) => state.tools || []);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState("");

  const matchingTools = useMemo(() => {
    if (!result?.keyword) return [];
    const keyword = result.keyword.toLowerCase();
    return tools.filter((tool) => {
      return (
        tool.name?.toLowerCase().includes(keyword) ||
        tool.category?.toLowerCase().includes(keyword) ||
        tool.image?.toLowerCase().includes(keyword)
      );
    });
  }, [result, tools]);

  if (!permission) {
    return <View style={styles.center}><Text style={styles.text}>Loading camera...</Text></View>;
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

  const handleScan = async () => {
    try {
      if (!cameraRef.current) return;
      setLoading(true);
      setResult(null);
      setAiResponse("");

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
        skipProcessing: true,
      });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.EXPO_PUBLIC_CLAUDE_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-6",
          max_tokens: 200,
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
                  text: `You are a tool recognition AI. Look at this image and identify the tool.
Reply with ONLY a JSON object like this (no other text):
{"name": "Drill", "category": "PowerTools", "keyword": "drill", "icon": "🛠️", "confidence": "high"}

Categories: PowerTools, Screwdrivers, MeasuringTools, BatteriesChargers, CableTools, SafetyEquipment, Lighting, General
Keywords must be single English words like: drill, screwdriver, battery, tester, grinder, saw, ladder, light, wrench, pliers
If you cannot identify a tool, use: {"name": "Unknown Tool", "category": "General", "keyword": "", "icon": "🔧", "confidence": "low"}`,
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const text = data?.content?.[0]?.text || "";
      setAiResponse(text);

      try {
        const parsed = JSON.parse(text);
        setResult(parsed);
        Alert.alert("✅ Detected!", `${parsed.icon} ${parsed.name} (${parsed.confidence} confidence)`);
      } catch {
        const jsonMatch = text.match(/\{.*\}/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResult(parsed);
        } else {
          Alert.alert("Could not identify", "Try pointing at the tool more clearly.");
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to scan. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <View style={styles.overlay}>
        <Text style={styles.title}>AI Tool Scanner</Text>
        <Text style={styles.subtitle}>Point camera at a tool</Text>

        <View style={styles.scanBox} />

        {result ? (
          <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.resultCard}>
              <Text style={styles.resultIcon}>{result.icon}</Text>
              <Text style={styles.resultTitle}>{result.name}</Text>
              <Text style={styles.resultCategory}>{result.category}</Text>
              <Text style={[styles.resultCategory, { color: result.confidence === "high" ? "#22c55e" : "#f59e0b" }]}>
                {result.confidence === "high" ? "✅ High confidence" : "⚠️ Low confidence"}
              </Text>
            </View>

            {matchingTools.length > 0 && (
              <>
                <Text style={styles.matchTitle}>Found in Inventory</Text>
                {matchingTools.map((tool, index) => {
                  const realId = tool.id || `old-tool-${index}`;
                  return (
                    <TouchableOpacity
                      key={realId}
                      style={styles.matchCard}
                      onPress={() => router.push({ pathname: "/worker-details", params: { workerName: tool.borrowedBy || tool.holder } } as any)}
                    >
                      <View style={styles.matchLeft}>
                        <Text style={styles.matchEmoji}>{getToolEmoji(tool.name)}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.matchName}>{tool.name}</Text>
                          <Text style={styles.matchMeta}>Qty: {tool.quantity || "0"} · {tool.borrowedBy || tool.holder || "Storage"}</Text>
                          <Text style={styles.matchMeta}>{tool.category || "General"} · {tool.status || "Unknown"}</Text>
                        </View>
                      </View>
                      <View style={styles.openBadge}>
                        <Text style={styles.openText}>OPEN</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {matchingTools.length === 0 && result.keyword && (
              <View style={styles.noMatchCard}>
                <Text style={styles.noMatchText}>No matching tools in inventory</Text>
                <TouchableOpacity
                  style={[styles.scanButton, { marginTop: 10, padding: 12 }]}
                  onPress={() => router.push({ pathname: "/add-tool" } as any)}
                >
                  <Text style={styles.scanButtonText}>+ Add to Inventory</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : null}

        <TouchableOpacity style={styles.scanButton} onPress={handleScan} disabled={loading}>
          <Text style={styles.scanButtonText}>{loading ? "🤖 AI Scanning..." : "📷 Scan Tool"}</Text>
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
  overlay: { position: "absolute", width: "100%", height: "100%", justifyContent: "flex-end", padding: 20, backgroundColor: "rgba(0,0,0,0.25)" },
  title: { color: "white", fontSize: 34, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  subtitle: { color: "#d1d5db", fontSize: 16, textAlign: "center", marginBottom: 24 },
  scanBox: { borderWidth: 3, borderColor: "#ff6b00", borderRadius: 24, width: 260, height: 260, alignSelf: "center", marginBottom: 30 },
  resultsContainer: { maxHeight: 280, marginBottom: 20 },
  resultCard: { backgroundColor: "#111827", borderRadius: 22, padding: 18, alignItems: "center", marginBottom: 18, borderWidth: 1, borderColor: "#1f2937" },
  resultIcon: { fontSize: 42, marginBottom: 10 },
  resultTitle: { color: "white", fontSize: 24, fontWeight: "bold" },
  resultCategory: { color: "#9ca3af", fontSize: 15, marginTop: 4 },
  matchTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  noMatchCard: { backgroundColor: "#111827", borderRadius: 16, padding: 18, alignItems: "center" },
  noMatchText: { color: "#9ca3af", fontSize: 15 },
  matchCard: { backgroundColor: "#111827", borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1f2937", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  matchLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  matchEmoji: { fontSize: 26, marginRight: 12 },
  matchName: { color: "white", fontSize: 16, fontWeight: "bold" },
  matchMeta: { color: "#9ca3af", fontSize: 12, marginTop: 3 },
  openBadge: { backgroundColor: "#1e293b", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginLeft: 8 },
  openText: { color: "#60a5fa", fontSize: 11, fontWeight: "bold" },
  scanButton: { backgroundColor: "#ff6b00", padding: 18, borderRadius: 18, alignItems: "center", marginBottom: 12 },
  scanButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  backButton: { borderWidth: 1, borderColor: "#374151", padding: 16, borderRadius: 16, alignItems: "center", marginBottom: 30, backgroundColor: "#111827" },
  backButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  center: { flex: 1, backgroundColor: "#020b1f", justifyContent: "center", alignItems: "center", padding: 20 },
  text: { color: "white", fontSize: 18, marginBottom: 20 },
});