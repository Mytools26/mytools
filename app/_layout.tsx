import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { supabase } from "./supabase";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<"manager" | "worker" | null>(null);

  const checkRoleAndSession = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("company_members")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (data?.role === "worker") {
        setRole("worker");
      } else {
        setRole("manager");
      }
    } catch {
      setRole("manager");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setLoggedIn(true);
        await checkRoleAndSession(data.session.user.id);
      } else {
        setLoggedIn(false);
      }
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setLoggedIn(true);
          await checkRoleAndSession(session.user.id);
        } else {
          setLoggedIn(false);
          setRole(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: "#020b1f", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ff6b00" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="add-tool" options={{ headerShown: false }} />
        <Stack.Screen name="edit-tool" options={{ headerShown: false }} />
        <Stack.Screen name="worker-view" options={{ headerShown: false }} />
      </Stack>

      {loggedIn ? (
        role === "worker" ? (
          <Redirect href="/worker-view" />
        ) : (
          <Redirect href="/(tabs)/dashboard" />
        )
      ) : (
        <Redirect href="/login" />
      )}

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}