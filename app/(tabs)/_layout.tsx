import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToolStore } from "../../toolStore";
import { t } from "../i18n";

export default function TabLayout() {
  const language = useToolStore((state) => state.language); // auto re-render on language change

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: "#ff6b00",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#020b1f",
          borderTopColor: "#111c34",
          height: 105,
          paddingBottom: 35,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: t("inventory"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="shippingbox.fill" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="borrowed"
        options={{
          title: t("workers"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle.badge.checkmark" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="gearshape.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}