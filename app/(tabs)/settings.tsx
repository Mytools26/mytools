import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";

import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../supabase";

const SETTINGS_KEY = "my-tools-settings";
const STORAGE_KEY = "my-tools-storage";

export default function SettingsScreen() {
  const [companyName, setCompanyName] = useState("MyTools Company");
  const [darkMode, setDarkMode] = useState(true);
  const [workerEmail, setWorkerEmail] = useState("");
  const [addingWorker, setAddingWorker] = useState(false);

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
      JSON.stringify({ companyName, darkMode })
    );
    Alert.alert("Saved", "Settings saved successfully.");
  };

  const handleAddWorker = async () => {
    if (!workerEmail.trim()) {
      Alert.alert("Error", "Enter worker email.");
      return;
    }

    setAddingWorker(true);

    try {
      // Βρίσκουμε τον user με αυτό το email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Βρίσκουμε την εταιρεία του manager
      const { data: memberData } = await supabase
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (!memberData?.company_id) {
        Alert.alert("Error", "Company not found.");
        return;
      }

      // Ψάχνουμε τον worker με το email
      const { data: workerData, error: workerError } = await supabase
        .from("auth.users")
        .select("id")
        .eq("email", workerEmail.trim())
        .single();

      if (workerError || !workerData) {
        // Αν δεν βρεθεί, δημιουργούμε invite link
        Alert.alert(
          "Worker Not Found",
          `No account found for ${workerEmail}. Ask the worker to Register first with this email, then you can add them.`
        );
        return;
      }

      // Προσθέτουμε τον worker στην εταιρεία
      const { error: insertError } = await supabase
        .from("company_members")
        .insert({
          company_id: memberData.company_id,
          user_id: workerData.id,
          role: "worker",
        });

      if (insertError) {
        Alert.alert("Error", insertError.message);
        return;
      }

      Alert.alert("Success", `${workerEmail} added as worker!`);
      setWorkerEmail("");
    } catch (e) {
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setAddingWorker(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const exportBackup = async () => {
    const appData = await AsyncStorage.getItem(STORAGE_KEY);
    const settingsData = await AsyncStorage.getItem(SETTINGS_KEY);
    const backup = {
      app: "MyTools",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      settings: settingsData ? JSON.parse(settingsData) : null,
      storage: appData ? JSON.parse(appData) : null,
    };
    await Share.share({
      title: "MyTools Backup",
      message: JSON.stringify(backup, null, 2),
    });
  };

  const importBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const file = result.assets[0];
      const response = await fetch(file.uri);
      const text = await response.text();
      const parsed = JSON.parse(text);
      if (parsed.settings) {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed.settings));
      }
      if (parsed.storage) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.storage));
      }
      Alert.alert("Import Complete", "Backup restored. Restart Expo.");
    } catch (error) {
      Alert.alert("Import Failed", "Invalid backup file.");
    }
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
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Dark Mode</Text>
            <Text style={styles.hint}>Saved for the future theme system</Text>
          </View>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>👷 Add Worker</Text>
        <Text style={styles.hint}>
          Add a worker to your company. They must first create an account with this email.
        </Text>
        <TextInput
          style={styles.input}
          value={workerEmail}
          onChangeText={setWorkerEmail}
          placeholder="Worker email"
          placeholderTextColor="#888"
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={styles.addWorkerButton}
          onPress={handleAddWorker}
          disabled={addingWorker}
        >
          <Text style={styles.buttonText}>
            {addingWorker ? "Adding..." : "Add Worker"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Account</Text>
        <Text style={styles.hint}>
          You are logged in. Tap below to sign out.
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Backup</Text>
        <Text style={styles.hint}>
          Export or import tools, workers, warehouse stock and history.
        </Text>
        <TouchableOpacity style={styles.exportButton} onPress={exportBackup}>
          <Text style={styles.buttonText}>Export Backup</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.importButton} onPress={importBackup}>
          <Text style={styles.buttonText}>Import Backup</Text>
        </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: "#020b1f", padding: 16 },
  title: { color: "white", fontSize: 40, fontWeight: "bold", marginTop: 54 },
  subtitle: { color: "#9ca3af", fontSize: 16, marginBottom: 18 },
  card: { backgroundColor: "#111c34", borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#1f2937" },
  label: { color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  hint: { color: "#9ca3af", fontSize: 13, lineHeight: 18, marginBottom: 12 },
  input: { backgroundColor: "#020b1f", borderRadius: 12, padding: 14, color: "white", fontSize: 16, borderWidth: 1, borderColor: "#374151" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  saveButton: { backgroundColor: "#ff6b00", padding: 14, borderRadius: 13, alignItems: "center", marginTop: 14 },
  addWorkerButton: { backgroundColor: "#7c3aed", padding: 14, borderRadius: 13, alignItems: "center", marginTop: 14 },
  logoutButton: { backgroundColor: "#7f1d1d", padding: 14, borderRadius: 13, alignItems: "center", marginTop: 4 },
  exportButton: { backgroundColor: "#2563eb", padding: 14, borderRadius: 13, alignItems: "center", marginTop: 4 },
  importButton: { backgroundColor: "#16a34a", padding: 14, borderRadius: 13, alignItems: "center", marginTop: 10 },
  dangerCard: { backgroundColor: "#111c34", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#7f1d1d" },
  dangerTitle: { color: "#f87171", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  dangerText: { color: "#d1d5db", fontSize: 14, marginBottom: 14 },
  resetButton: { backgroundColor: "#7f1d1d", padding: 14, borderRadius: 13, alignItems: "center" },
  buttonText: { color: "white", fontSize: 15, fontWeight: "bold" },
});