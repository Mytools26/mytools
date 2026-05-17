import { router } from "expo-router";
import React, { useState } from "react";

import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { supabase } from "./supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      Alert.alert("Login Error", error.message);
      return;
    }

    router.replace("/(tabs)/dashboard");
  };

  const register = async () => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      Alert.alert("Register Error", error.message);
      return;
    }

    Alert.alert("Success", "Account created. Check your email if confirmation is required.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyTools Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={register}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/(tabs)/dashboard")}>
        <Text style={styles.skipText}>Continue without login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020b1f",
    padding: 24,
    justifyContent: "center",
  },

  title: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#111c34",
    color: "white",
    padding: 18,
    borderRadius: 16,
    fontSize: 18,
    marginBottom: 16,
  },

  loginButton: {
    backgroundColor: "#ff6b00",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },

  registerButton: {
    backgroundColor: "#2563eb",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
  },

  skipText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    fontWeight: "bold",
  },
});