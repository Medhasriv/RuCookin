import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth, getTokenData } from "../utils/authChecker"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";

const SettingsPage = () => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth(router);
  }, []);

  const toggleDarkModeSwitch = async () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    await AsyncStorage.setItem("userTheme", newTheme);
  };

  const toggleNotificationsSwitch = () => {
    setIsNotificationsEnabled((prev) => !prev);
  };

  const styles = createStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Header */}
        <Text style={styles.header}>Settings</Text>

        {/* Notifications Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.text}>Notifications</Text>
          <Switch
            value={isNotificationsEnabled}
            onValueChange={toggleNotificationsSwitch}
            trackColor={{ false: "#D3D3D3", true: "#FFCF99" }}
            thumbColor={isNotificationsEnabled ? "#721121" : "#701C1C"}
          />
        </View>

        {/* Dark Mode Toggle */}
        <View style={styles.switchContainer}>
          <Text style={styles.text}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkModeSwitch}
            trackColor={{ false: "#D3D3D3", true: "#FFCF99" }}
            thumbColor={isDarkMode ? "#721121" : "#701C1C"}
          />
        </View>

        {/* Privacy Button */}
        <TouchableOpacity style={styles.button} onPress={() => router.push("/Privacy")}>
          <Text style={styles.buttonText}>Privacy</Text>
        </TouchableOpacity>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            AsyncStorage.removeItem("token");
            AsyncStorage.removeItem("userTheme");
            router.push("/Login");
          }}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <BottomNavBar activeTab="settings" isDarkMode={isDarkMode} />
    </View>
  );
};

function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#222222" : "#ffffff",
    },
    contentContainer: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 30,
    },
    switchContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingHorizontal: 20,
      marginVertical: 10,
    },
    text: {
      fontSize: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    button: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      marginVertical: 10,
      width: "80%",
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#721121" : "#FFCF99",
    },
  });
}

export default SettingsPage;
