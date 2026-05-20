import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const SETTINGS_KEY = "my-tools-settings";

export default function SettingsScreen() {
  const [companyName, setCompanyName] = useState("MyTools Company");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem(SETTINGS_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      setCompanyName(parsed.companyName || "MyTools Company");
      setDarkMode(parsed.darkMode ?? true);
    }
  };

  const saveSettings = async () => {
    await AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        companyName,
        darkMode,
      })
    );

    Alert.alert("Saved", "Settings saved successfully.");
  };

  const resetApp = async () => {
    Alert.alert(
      "Reset Application",
      "This will delete all tools, workers, warehouse stock and history. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert("Done", "All app data deleted. Restart Expo.");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>App preferences and data control</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Company Name</Text>

        <TextInput
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Company name"
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.label}>Dark Mode</Text>
            <Text style={styles.hint}>Visual switch saved for later theme system</Text>
          </View>

          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      <View style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>

        <Text style={styles.dangerText}>
          Reset deletes all local app data from this device.
        </Text>

        <TouchableOpacity style={styles.resetButton} onPress={resetApp}>
          <Text style={styles.buttonText}>Reset Application</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b1f",
    padding: 16,
  },

  title: {
    color: "white",
    fontSize: 40,
    fontWeight: "bold",
    marginTop: 54,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },

  label: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  hint: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: -4,
  },

  input: {
    backgroundColor: "#020b1f",
    borderRadius: 12,
    padding: 14,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  saveButton: {
    backgroundColor: "#ff6b00",
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 14,
  },

  dangerCard: {
    backgroundColor: "#111c34",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },

  dangerTitle: {
    color: "#f87171",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  dangerText: {
    color: "#d1d5db",
    fontSize: 14,
    marginBottom: 14,
  },

  resetButton: {
    backgroundColor: "#7f1d1d",
    padding: 14,
    borderRadius: 13,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
});