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
  const [companyName, setCompanyName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

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
    if (!companyName.trim()) {
      Alert.alert("Error", "Please enter your company name.");
      return;
    }

    // Step 1: Register
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (signUpError) {
      Alert.alert("Register Error", signUpError.message);
      return;
    }

    // Step 2: Login αμέσως μετά
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (loginError) {
      Alert.alert("Login Error", loginError.message);
      return;
    }

    const user = loginData.user;

    if (!user) {
      Alert.alert("Error", "Could not get user after login.");
      return;
    }

    // Step 3: Δημιουργία εταιρείας
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .insert({ name: companyName.trim(), owner_id: user.id })
      .select("*")
      .single();

    if (companyError) {
      Alert.alert("Company Error", companyError.message);
      return;
    }

    // Step 4: Προσθήκη ως manager
    await supabase.from("company_members").insert({
      company_id: company.id,
      user_id: user.id,
      role: "manager",
    });

    Alert.alert("Success", `Welcome! Company "${companyName}" created.`);
    router.replace("/(tabs)/dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyTools</Text>
      <Text style={styles.subtitle}>
        {isRegistering ? "Create your account" : "Welcome back"}
      </Text>

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

      {isRegistering && (
        <TextInput
          placeholder="Company Name (e.g. Elektro GmbH)"
          placeholderTextColor="#888"
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
        />
      )}

      {isRegistering ? (
        <>
          <TouchableOpacity style={styles.loginButton} onPress={register}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsRegistering(false)}
          >
            <Text style={styles.switchText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => setIsRegistering(true)}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/(tabs)/dashboard")}>
            <Text style={styles.skipText}>Continue without login</Text>
          </TouchableOpacity>
        </>
      )}
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
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#9ca3af",
    fontSize: 18,
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
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    color: "#60a5fa",
    fontSize: 16,
    fontWeight: "bold",
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