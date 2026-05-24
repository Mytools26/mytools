import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";

import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useToolStore } from "../toolStore";

export default function IdentifyScreen() {
  const tools = useToolStore((state) => state.tools || []);

  const [image, setImage] = useState<string | null>(null);

  const [detectedType, setDetectedType] =
    useState("");

  const [matches, setMatches] = useState<any[]>(
    []
  );

  const detectToolType = (filename: string) => {
    const text = filename.toLowerCase();

    if (
      text.includes("drill") ||
      text.includes("driver")
    ) {
      return "drill";
    }

    if (
      text.includes("screwdriver")
    ) {
      return "screwdriver";
    }

    if (
      text.includes("grinder")
    ) {
      return "grinder";
    }

    if (
      text.includes("saw")
    ) {
      return "saw";
    }

    if (
      text.includes("battery")
    ) {
      return "battery";
    }

    return "tool";
  };

  const findMatchingTools = (
    type: string
  ) => {
    return tools.filter((tool) => {
      const name =
        tool.name?.toLowerCase() || "";

      return name.includes(type);
    });
  };

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Camera access required."
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    setImage(asset.uri);

    const fakeDetectedType =
      detectToolType(asset.fileName || "");

    setDetectedType(fakeDetectedType);

    const found =
      findMatchingTools(fakeDetectedType);

    setMatches(found);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Identify Tool
      </Text>

      <Text style={styles.subtitle}>
        Take a photo and find matching tools
      </Text>

      <TouchableOpacity
        style={styles.cameraButton}
        onPress={pickImage}
      >
        <Text style={styles.cameraButtonText}>
          Open Camera
        </Text>
      </TouchableOpacity>

      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      ) : null}

      {detectedType ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Detected Type
          </Text>

          <Text style={styles.detectedText}>
            {detectedType}
          </Text>
        </View>
      ) : null}

      {matches.length > 0 ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Matching Tools
          </Text>

          {matches.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() =>
                router.push({
                  pathname: "/item-details",
                  params: {
                    name: tool.name,
                    profession:
                      tool.profession,
                    category:
                      tool.category,
                    brand:
                      tool.brand,
                    quantity:
                      tool.quantity,
                  },
                } as any)
              }
            >
              <Text style={styles.toolName}>
                {tool.name}
              </Text>

              <Text style={styles.toolMeta}>
                {tool.profession}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : detectedType ? (
        <View style={styles.resultCard}>
          <Text style={styles.noMatch}>
            No matching tools found
          </Text>
        </View>
      ) : null}

      <View style={{ height: 80 }} />
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

  cameraButton: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 20,
  },

  cameraButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  image: {
    width: "100%",
    height: 260,
    borderRadius: 20,
    marginBottom: 20,
  },

  resultCard: {
    backgroundColor: "#111c34",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  resultTitle: {
    color: "#ff6b00",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  detectedText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  toolCard: {
    backgroundColor: "#020b1f",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  toolName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  toolMeta: {
    color: "#9ca3af",
    marginTop: 4,
  },

  noMatch: {
    color: "#f87171",
    fontSize: 16,
    fontWeight: "bold",
  },
});