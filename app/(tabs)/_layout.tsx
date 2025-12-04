import React from "react";
import { Tabs } from "expo-router";
import { Home, Search, ShoppingBag, Heart, User, Users } from "lucide-react-native";
import colors from "@/constants/colors";
import { useCartStore } from "@/store/cart-store";
import { View, Text, StyleSheet } from "react-native";

function TabBarIcon(props: {
  name: React.ReactNode;
  color: string;
}) {
  return <View style={{ marginBottom: -3 }}>{props.name}</View>;
}

export default function TabLayout() {
  const cartItemCount = useCartStore((state) => state.getItemCount());

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang Chủ",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name={<Home size={24} color={color} />} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Tìm Kiếm",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name={<Search size={24} color={color} />} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Yêu Thích",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name={<Heart size={24} color={color} />} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ Sơ",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name={<User size={24} color={color} />} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    right: -6,
    top: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 4,
  },
});