import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const detectToolFromText = (text: string) => {
  const value = text.toLowerCase();

  if (value.includes("drill")) {
    return { name: "Drill", icon: "🛠️", category: "PowerTools" };
  }

  if (value.includes("screwdriver")) {
    return { name: "Screwdriver", icon: "🪛", category: "Screwdrivers" };
  }

  if (value.includes("battery")) {
    return { name: "Battery", icon: "🔋", category: "BatteriesChargers" };
  }

  if (value.includes("tester")) {
    return { name: "Tester", icon: "📟", category: "MeasuringTools" };
  }

  if (value.includes("grinder")) {
    return { name: "Grinder", icon: "⚙️", category: "PowerTools" };
  }

  if (value.includes("saw")) {
    return { name: "Saw", icon: "🪚", category: "PowerTools" };
  }

  return { name: "Unknown Tool", icon: "🔧", category: "General" };
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

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

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = async () => {
    try {
      setLoading(true);

      setTimeout(() => {
        setResult(fakeDetectedTool);

        Alert.alert("AI Detection", `Detected: ${fakeDetectedTool.name}`);

        setLoading(false);
      }, 1500);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Camera scan failed");
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
          <View style={styles.resultCard}>
            <Text style={styles.resultIcon}>{result.icon}</Text>

            <Text style={styles.resultTitle}>{result.name}</Text>

            <Text style={styles.resultCategory}>{result.category}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          disabled={loading}
        >
          <Text style={styles.scanButtonText}>
            {loading ? "Scanning..." : "Scan Tool"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
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

  resultCard: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
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