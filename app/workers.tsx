import React from "react";

import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function WorkersScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Workers</Text>

      <Text style={styles.subtitle}>
        Company employees
      </Text>

      <View style={styles.card}>
        <Text style={styles.workerName}>Example Worker</Text>

        <Text style={styles.text}>
          Profession: Electrician
        </Text>

        <Text style={styles.text}>
          Assigned tools: 0
        </Text>
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
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 60,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },

  workerName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },

  text: {
    color: "#d1d5db",
    fontSize: 18,
    marginBottom: 8,
  },
});