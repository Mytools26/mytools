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

const detectToolFromText = (text: string) => {
  const value = text.toLowerCase();

  if (value.includes("drill")) {
    return {
      name: "Drill",
      icon: "🛠️",
      category: "PowerTools",
      keyword: "drill",
    };
  }

  if (value.includes("screwdriver")) {
    return {
      name: "Screwdriver",
      icon: "🪛",
      category: "Screwdrivers",
      keyword: "screwdriver",
    };
  }

  if (value.includes("battery")) {
    return {
      name: "Battery",
      icon: "🔋",
      category: "BatteriesChargers",
      keyword: "battery",
    };
  }

  if (value.includes("tester")) {
    return {
      name: "Tester",
      icon: "📟",
      category: "MeasuringTools",
      keyword: "tester",
    };
  }

  if (value.includes("grinder")) {
    return {
      name: "Grinder",
      icon: "⚙️",
      category: "PowerTools",
      keyword: "grinder",
    };
  }

  if (value.includes("saw")) {
    return {
      name: "Saw",
      icon: "🪚",
      category: "PowerTools",
      keyword: "saw",
    };
  }

  return {
    name: "Unknown Tool",
    icon: "🔧",
    category: "General",
    keyword: "",
  };
};

const getToolEmoji = (toolName: string) => {
  const name = toolName.toLowerCase();

  if (name.includes("drill")) return "🛠️";
  if (name.includes("screwdriver")) return "🪛";
  if (name.includes("battery")) return "🔋";
  if (name.includes("tester")) return "📟";
  if (name.includes("grinder")) return "⚙️";
  if (name.includes("saw")) return "🪚";

  return "🔧";
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<any>(null);

  const tools = useToolStore((state) => state.tools || []);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  const fakeDetectedTool = useMemo(() => {
    const randomTools = [
      "drill",
      "screwdriver",
      "battery",
      "tester",
      "grinder",
      "saw",
    ];

    const random =
      randomTools[Math.floor(Math.random() * randomTools.length)];

    return detectToolFromText(random);
  }, [loading]);

  const matchingTools = useMemo(() => {
    if (!result) return [];

    const keyword =
      result.keyword?.toLowerCase() ||
      result.name.toLowerCase();

    return tools.filter((tool) => {
      const name =
        tool.name?.toLowerCase() || "";

      const category =
        tool.category?.toLowerCase() || "";

      const profession =
        tool.profession?.toLowerCase() || "";

      const image =
        tool.image?.toLowerCase() || "";

      const brand =
        tool.brand?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        category.includes(keyword) ||
        profession.includes(keyword) ||
        image.includes(keyword) ||
        brand.includes(keyword)
      );
    });
  }, [result, tools]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Loading camera...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Camera permission required
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Allow Camera
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = async () => {
    try {
      if (!cameraRef.current) {
        return;
      }

      setLoading(true);

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: false,
          skipProcessing: true,
        });

      console.log(
        "PHOTO URI:",
        photo.uri
      );

      setTimeout(() => {
        setResult(fakeDetectedTool);

        Alert.alert(
          "Photo Captured",
          `Detected: ${fakeDetectedTool.name}`
        );

        setLoading(false);
      }, 1200);
    } catch (error) {
      console.log(error);

      setLoading(false);

      Alert.alert(
        "Error",
        "Failed to capture photo"
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />

      <View style={styles.overlay}>
        <Text style={styles.title}>
          AI Tool Scanner
        </Text>

        <Text style={styles.subtitle}>
          Point camera at a tool
        </Text>

        <View style={styles.scanBox} />

        {result ? (
          <ScrollView
            style={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.resultCard}>
              <Text style={styles.resultIcon}>
                {result.icon}
              </Text>

              <Text style={styles.resultTitle}>
                {result.name}
              </Text>

              <Text style={styles.resultCategory}>
                {result.category}
              </Text>
            </View>

            <Text style={styles.matchTitle}>
              Matching Inventory Tools
            </Text>

            {matchingTools.length ===
            0 ? (
              <View
                style={
                  styles.noMatchCard
                }
              >
                <Text
                  style={
                    styles.noMatchText
                  }
                >
                  No matching tools
                  found
                </Text>
              </View>
            ) : (
              matchingTools.map(
                (tool, index) => {
                  const realId =
                    tool.id ||
                    `old-tool-${index}`;

                  return (
                    <TouchableOpacity
                      key={realId}
                      style={
                        styles.matchCard
                      }
                      onPress={() =>
                        router.push({
                          pathname:
                            "/item-details",

                          params: {
                            toolId:
                              realId,
                          },
                        } as any)
                      }
                    >
                      <View
                        style={
                          styles.matchLeft
                        }
                      >
                        <Text
                          style={
                            styles.matchEmoji
                          }
                        >
                          {getToolEmoji(
                            tool.name
                          )}
                        </Text>

                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={
                              styles.matchName
                            }
                          >
                            {tool.name}
                          </Text>

                          <Text
                            style={
                              styles.matchMeta
                            }
                          >
                            Qty:{" "}
                            {tool.quantity ||
                              "0"}{" "}
                            ·{" "}
                            {tool.borrowedBy ||
                              tool.holder ||
                              "Storage"}
                          </Text>

                          <Text
                            style={
                              styles.matchMeta
                            }
                          >
                            {tool.category ||
                              "General"}{" "}
                            ·{" "}
                            {tool.status ||
                              "Unknown"}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={
                          styles.openBadge
                        }
                      >
                        <Text
                          style={
                            styles.openText
                          }
                        >
                          OPEN
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
              )
            )}
          </ScrollView>
        ) : null}

        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          disabled={loading}
        >
          <Text
            style={
              styles.scanButtonText
            }
          >
            {loading
              ? "Scanning..."
              : "Scan Tool"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  camera: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
    padding: 20,
    backgroundColor:
      "rgba(0,0,0,0.25)",
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

  resultsContainer: {
    maxHeight: 280,
    marginBottom: 20,
  },

  resultCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  resultIcon: {
    fontSize: 42,
    marginBottom: 10,
  },

  resultTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  resultCategory: {
    color: "#9ca3af",
    fontSize: 15,
    marginTop: 4,
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
  },

  noMatchText: {
    color: "#9ca3af",
    fontSize: 15,
  },

  matchCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1f2937",
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
  },

  matchLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  matchEmoji: {
    fontSize: 26,
    marginRight: 12,
  },

  matchName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  matchMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 3,
  },

  openBadge: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 8,
  },

  openText: {
    color: "#60a5fa",
    fontSize: 11,
    fontWeight: "bold",
  },

  scanButton: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 12,
  },

  scanButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  backButton: {
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#111827",
  },

  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  center: {
    flex: 1,
    backgroundColor: "#020b1f",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  text: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },

  permissionButton: {
    backgroundColor: "#ff6b00",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});