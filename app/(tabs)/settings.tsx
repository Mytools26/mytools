import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.subtitle}>
        App preferences and information
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>App Name</Text>
        <Text style={styles.value}>MyTools</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Storage</Text>
        <Text style={styles.value}>Local device storage</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Version</Text>
        <Text style={styles.value}>MVP 1.0</Text>
      </View>
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
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },

  label: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 8,
  },

  value: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
});