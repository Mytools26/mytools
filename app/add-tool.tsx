import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { useToolStore } from "../toolStore";

const professions = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Mechanic",
  "Welder",
  "Mason",
  "Tiler",
  "Roofer",
  "HVAC Technician",
  "Gardener",
  "Handyman",
];

const categories = [
  "Power Tools",
  "Hand Tools",
  "Measuring Tools",
  "Cutting Tools",
  "Construction Tools",
  "Safety Equipment",
  "Machines",
  "Ladders",
];

const brands = [
  "Makita",
  "Bosch",
  "DeWalt",
  "Milwaukee",
  "Hilti",
  "Stanley",
  "Wera",
  "Knipex",
  "Metabo",
  "Einhell",
  "Other",
];

const toolSuggestions = [
  "Cordless Drill",
  "Impact Driver",
  "Hammer Drill",
  "Rotary Hammer",
  "Angle Grinder",
  "Circular Saw",
  "Jigsaw",
  "Reciprocating Saw",
  "Screwdriver Set",
  "Bit Set",
  "Hammer",
  "Tape Measure",
  "Laser Level",
  "Spirit Level",
  "Multimeter",
  "Voltage Tester",
  "Wire Stripper",
  "Crimping Tool",
  "Pipe Wrench",
  "Adjustable Wrench",
  "Pliers Set",
  "Water Pump Pliers",
  "Socket Set",
  "Ratchet Set",
  "Welding Machine",
  "Soldering Iron",
  "Compressor",
  "Ladder",
  "Toolbox",
  "Generator",
];

const statuses = [
  "Available",
  "In Use",
  "Missing",
  "Broken",
];

export default function AddToolScreen() {
  const addTool = useToolStore((state) => state.addTool);

  const [profession, setProfession] = useState("Electrician");
  const [category, setCategory] = useState("Power Tools");
  const [brand, setBrand] = useState("Makita");
  const [toolName, setToolName] = useState("Cordless Drill");
  const [customToolName, setCustomToolName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("Available");
  const [location, setLocation] = useState("");
  const [holder, setHolder] = useState("");

  const saveTool = () => {
    const finalName =
      customToolName.trim() || `${brand} ${toolName}`;

    if (!finalName.trim()) {
      Alert.alert("Error", "Enter tool name");
      return;
    }

    addTool({
      id: Date.now().toString(),
      name: finalName,
      profession,
      category,
      brand,
      quantity,
      status,
      location,
      holder,

      borrowedBy: "",
      returnDate: "",
      notes: "",
    });

    Alert.alert("Success", "Tool added");

    router.replace("/(tabs)");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Add Tool
      </Text>

      <TextInput
        placeholder="Custom tool name"
        placeholderTextColor="#888"
        style={styles.input}
        value={customToolName}
        onChangeText={setCustomToolName}
      />

      <Text style={styles.label}>
        Profession
      </Text>

      <Picker
        selectedValue={profession}
        onValueChange={setProfession}
        style={styles.picker}
      >
        {professions.map((item) => (
          <Picker.Item
            key={item}
            label={item}
            value={item}
          />
        ))}
      </Picker>

      <Text style={styles.label}>
        Category
      </Text>

      <Picker
        selectedValue={category}
        onValueChange={setCategory}
        style={styles.picker}
      >
        {categories.map((item) => (
          <Picker.Item
            key={item}
            label={item}
            value={item}
          />
        ))}
      </Picker>

      <Text style={styles.label}>
        Brand
      </Text>

      <Picker
        selectedValue={brand}
        onValueChange={setBrand}
        style={styles.picker}
      >
        {brands.map((item) => (
          <Picker.Item
            key={item}
            label={item}
            value={item}
          />
        ))}
      </Picker>

      <Text style={styles.label}>
        Tool
      </Text>

      <Picker
        selectedValue={toolName}
        onValueChange={setToolName}
        style={styles.picker}
      >
        {toolSuggestions.map((item) => (
          <Picker.Item
            key={item}
            label={item}
            value={item}
          />
        ))}
      </Picker>

      <TextInput
        placeholder="Quantity e.g. 5 pieces"
        placeholderTextColor="#888"
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.label}>
        Status
      </Text>

      <Picker
        selectedValue={status}
        onValueChange={setStatus}
        style={styles.picker}
      >
        {statuses.map((item) => (
          <Picker.Item
            key={item}
            label={item}
            value={item}
          />
        ))}
      </Picker>

      <TextInput
        placeholder="Location e.g. Van"
        placeholderTextColor="#888"
        style={styles.input}
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        placeholder="Holder e.g. George"
        placeholderTextColor="#888"
        style={styles.input}
        value={holder}
        onChangeText={setHolder}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={saveTool}
      >
        <Text style={styles.buttonText}>
          Save Tool
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          router.replace("/(tabs)")
        }
      >
        <Text style={styles.backButtonText}>
          Back
        </Text>
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
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 30,
  },

  label: {
    color: "white",
    fontSize: 18,
    marginBottom: 8,
  },

  picker: {
    backgroundColor: "#111c34",
    color: "white",
    marginBottom: 18,
  },

  input: {
    backgroundColor: "#111c34",
    color: "white",
    padding: 18,
    borderRadius: 16,
    fontSize: 18,
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#ff6b00",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  backButton: {
    borderColor: "#374151",
    borderWidth: 1,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 60,
  },

  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});