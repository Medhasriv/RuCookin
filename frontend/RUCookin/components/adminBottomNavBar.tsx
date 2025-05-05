import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export type TabName = "dashboard" | "ban" | "stats" | "list" | "new_recipe" | "new_admin";

type BottomNavBarProps = {
  activeTab: TabName;
  isDarkMode: boolean;
};

const BottomNavBar = ({ activeTab, isDarkMode }: BottomNavBarProps) => {
  const router = useRouter();

  const getIconSource = (tab: TabName) => {
    const isActive = activeTab === tab;
    switch (tab) {
      case "dashboard":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/dashboard_dark_active.png")
            : require("../assets/icons/dashboard_dark.png")
          : isActive
            ? require("../assets/icons/dashboard_light_active.png")
            : require("../assets/icons/dashboard_light.png");
      case "ban":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/ban_dark_active.png")
            : require("../assets/icons/ban_dark.png")
          : isActive
            ? require("../assets/icons/ban_light_active.png")
            : require("../assets/icons/ban_light.png");
      case "stats":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/stats_dark_active.png")
            : require("../assets/icons/stats_dark.png")
          : isActive
            ? require("../assets/icons/stats_light_active.png")
            : require("../assets/icons/stats_light.png");
      case "list":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/modifyaccounts_dark_active.png")
            : require("../assets/icons/modifyaccounts_dark.png")
          : isActive
            ? require("../assets/icons/modifyaccounts_light_active.png")
            : require("../assets/icons/modifyaccounts_light.png");
      case "new_recipe":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/createrecipe_dark_active.png")
            : require("../assets/icons/createrecipe_dark.png")
          : isActive
            ? require("../assets/icons/createrecipe_light_active.png")
            : require("../assets/icons/createrecipe_light.png");
      case "new_admin":
        return isDarkMode
          ? isActive
            ? require("../assets/icons/adminsignup_dark_active.png")
            : require("../assets/icons/adminsignup_dark.png")
          : isActive
            ? require("../assets/icons/adminsignup_light_active.png")
            : require("../assets/icons/adminsignup_light.png");
      default:
        return null;
    }
  };

  // Define routes with literal types for TypeScript
  const tabRoutes: Record<TabName, "/adminHomePage" | "/adminBan" | "/adminStats" | "/adminModifyAccount" | "/adminCreateRecipes" | "/adminSignUp"> = {
    dashboard: "/adminHomePage",
    ban: "/adminBan",
    stats: "/adminStats",
    list: "/adminModifyAccount",
    new_recipe: "/adminCreateRecipes",
    new_admin: "/adminSignUp",
  } as const;


  const styles = bottomNavStyles(isDarkMode);

  return (
    <View style={styles.container}>
      {(Object.keys(tabRoutes) as TabName[]).map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => router.push(tabRoutes[tab])}
          >
            <Image
              source={getIconSource(tab)}
              style={[
                styles.icon,
                // only tint the active icon:
                isActive && { tintColor: isDarkMode ? "#fff" : "#000" },
              ]}
            />
          </TouchableOpacity>
        );
      })}
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
      // tintColor: isDarkMode ? "#ffffff" : "#000000",
    },
  });

export default BottomNavBar;