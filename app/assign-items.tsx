import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const mockItems = [
  {
    id: "1",
    name: "Makita Cordless Drill",
    brand: "Makita",
  },
  {
    id: "2",
    name: "Stanley Toolbox",
    brand: "Stanley",
  },
  {
    id: "3",
    name: "Hammer Drill",
    brand: "Bosch",
  },
];

export default function AssignItemsScreen() {
  const [selectedWorker, setSelectedWorker] = useState("Ali");

  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: number;
  }>({});

  const increaseQty = (itemId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const decreaseQty = (itemId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assign Items</Text>

      <Text style={styles.subtitle}>
        Assign multiple items to workers
      </Text>

      <View style={styles.workerCard}>
        <Text style={styles.workerLabel}>Worker</Text>
        <Text style={styles.workerName}>{selectedWorker}</Text>
      </View>

      {mockItems.map((item) => (
        <View key={item.id} style={styles.card}>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.brand}>{item.brand}</Text>
          </View>

          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => decreaseQty(item.id)}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyText}>
              {selectedItems[item.id] || 0}
            </Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => increaseQty(item.id)}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Assignment</Text>
      </TouchableOpacity>
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

  workerCard: {
    backgroundColor: "#111c34",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },

  workerLabel: {
    color: "#9ca3af",
    fontSize: 16,
    marginBottom: 6,
  },

  workerName: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
    maxWidth: 220,
  },

  brand: {
    color: "#9ca3af",
    fontSize: 16,
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  qtyButton: {
    backgroundColor: "#2563eb",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  qtyButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  qtyText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 18,
    minWidth: 30,
    textAlign: "center",
  },

  saveButton: {
    backgroundColor: "#f97316",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 60,
  },

  saveButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});