import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useToolStore } from "../../toolStore";

export default function HomeScreen() {
  const [search, setSearch] = useState("");

  const tools = useToolStore((state) => state.tools);

  const deleteToolFromStore = useToolStore(
    (state) => state.deleteTool
  );

  const deleteTool = (id: string) => {
    Alert.alert("Delete Tool", "Are you sure?", [
      {
        text: "Cancel",
        style: "cancel",
      },

      {
        text: "Delete",
        style: "destructive",

        onPress: () => {
          deleteToolFromStore(id);
        },
      },
    ]);
  };

  const getStatusColor = (
    status: string | undefined
  ) => {
    switch (status) {
      case "Available":
        return "#16a34a";

      case "In Use":
        return "#f97316";

      case "Missing":
        return "#dc2626";

      case "Broken":
        return "#6b7280";

      default:
        return "#16a34a";
    }
  };

  const fixedTools = tools.map(
    (tool, index) => ({
      ...tool,

      id:
        tool.id ||
        `old-tool-${index}`,

      status:
        tool.status ||
        "Available",
    })
  );

  const filteredTools =
    fixedTools.filter((tool) => {
      const searchText =
        search.toLowerCase();

      return (
        tool.name
          ?.toLowerCase()
          .includes(searchText) ||

        tool.profession
          ?.toLowerCase()
          .includes(searchText) ||

        tool.category
          ?.toLowerCase()
          .includes(searchText) ||

        tool.brand
          ?.toLowerCase()
          .includes(searchText) ||

        tool.quantity
          ?.toLowerCase()
          .includes(searchText) ||

        tool.status
          ?.toLowerCase()
          .includes(searchText) ||

        tool.location
          ?.toLowerCase()
          .includes(searchText) ||

        tool.holder
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.logo}>
        MyTools 🔧
      </Text>

      <Text style={styles.subtitle}>
        All your tools organized
      </Text>

      <TextInput
        placeholder="Search tools..."
        placeholderTextColor="#9ca3af"
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/add-tool")
        }
      >
        <Text style={styles.buttonText}>
          + Add Tool
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        My Tools
      </Text>

      {filteredTools.length === 0 ? (
        <Text style={styles.emptyText}>
          No tools found
        </Text>
      ) : (
        filteredTools.map((tool) => (
          <View
            key={`${tool.id}-${tool.name}`}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text
                style={styles.toolTitle}
              >
                {tool.name}
              </Text>

              <View
                style={[
                  styles.statusBadge,

                  {
                    backgroundColor:
                      getStatusColor(
                        tool.status
                      ),
                  },
                ]}
              >
                <Text
                  style={
                    styles.statusText
                  }
                >
                  {tool.status}
                </Text>
              </View>
            </View>

            <Text style={styles.text}>
              Profession:{" "}
              {tool.profession}
            </Text>

            <Text style={styles.text}>
              Category:{" "}
              {tool.category}
            </Text>

            <Text style={styles.text}>
              Brand: {tool.brand}
            </Text>

            {tool.quantity ? (
              <Text style={styles.text}>
                Quantity:{" "}
                {tool.quantity}
              </Text>
            ) : null}

            {tool.location ? (
              <Text style={styles.text}>
                Location:{" "}
                {tool.location}
              </Text>
            ) : null}

            {tool.holder ? (
              <Text style={styles.text}>
                Holder: {tool.holder}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname:
                    "/edit-tool",

                  params: {
                    id: tool.id,
                  },
                })
              }
            >
              <Text
                style={
                  styles.editButtonText
                }
              >
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                deleteTool(tool.id)
              }
            >
              <Text
                style={
                  styles.deleteButtonText
                }
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b1f",
    padding: 20,
  },

  logo: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    marginTop: 50,
  },

  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
    marginBottom: 22,
  },

  searchInput: {
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
    marginBottom: 30,
  },

  buttonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  sectionTitle: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 20,
  },

  emptyText: {
    color: "#9ca3af",
    fontSize: 18,
  },

  card: {
    backgroundColor: "#111c34",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",

    alignItems: "flex-start",

    gap: 10,

    marginBottom: 10,
  },

  toolTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    flex: 1,
  },

  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },

  statusText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },

  text: {
    color: "#d1d5db",
    fontSize: 18,
    marginBottom: 6,
  },

  editButton: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
    alignItems: "center",
  },

  editButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  deleteButton: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});