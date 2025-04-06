import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export type TabName = "profile" | "search" | "home" | "cart" | "settings";

type BottomNavBarProps = {
  activeTab: TabName;
  isDarkMode: boolean;
};

const BottomNavBar = ({ activeTab, isDarkMode }: BottomNavBarProps) => {
  const router = useRouter();

  const getIconSource = (tab: TabName) => {
    const isActive = activeTab === tab;
    switch (tab) {
      case "profile":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/profile_dark_active.png")
            : require("../assets/icons/profile_dark_inactive.png")
          : isActive
          ? require("../assets/icons/profile_light_active.png")
          : require("../assets/icons/profile_light_inactive.png");
      case "search":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/search_dark_active.png")
            : require("../assets/icons/search_dark_inactive.png")
          : isActive
          ? require("../assets/icons/search_light_active.png")
          : require("../assets/icons/search_light_inactive.png");
      case "home":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/home_dark_active.png")
            : require("../assets/icons/home_dark_inactive.png")
          : isActive
          ? require("../assets/icons/home_light_active.png")
          : require("../assets/icons/home_light_inactive.png");
      case "cart":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/cart_dark_active.png")
            : require("../assets/icons/cart_dark_inactive.png")
          : isActive
          ? require("../assets/icons/cart_light_active.png")
          : require("../assets/icons/cart_light_inactive.png");
      case "settings":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/settings_dark_active.png")
            : require("../assets/icons/settings_dark_inactive.png")
          : isActive
          ? require("../assets/icons/settings_light_active.png")
          : require("../assets/icons/settings_light_inactive.png");
      default:
        return null;
    }
  };

  // Define routes with literal types for TypeScript
  const tabRoutes: Record<TabName, "/Profile" | "/SearchRecipe" | "/HomePage" | "/ShoppingCart" | "/Settings"> = {
    profile: "/Profile",
    search: "/SearchRecipe",
    home: "/HomePage",
    cart: "/ShoppingCart",
    settings: "/Settings",
  } as const;


  const styles = bottomNavStyles(isDarkMode);

  return (
    <View style={styles.container}>
      {(["profile", "search", "home", "cart", "settings"] as TabName[]).map(
        (tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => router.push(tabRoutes[tab])}
          >
            <Image source={getIconSource(tab)} style={styles.icon} />
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const bottomNavStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#721121" : "#ffc074", // background changes with theme
      paddingVertical: 25, // extra vertical padding moves the container upward
    },
    tab: {
      padding: 10,
      marginTop: -10, // negative margin to shift icons upward
    },
    icon: {
      width: 24,
      height: 24,
      tintColor: isDarkMode ? "#ffffff" : "#000000",
    },
  });

export default BottomNavBar;
