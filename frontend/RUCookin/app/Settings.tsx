import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth } from "../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import BottomNavBar from "../components/BottomNavBar";

const SettingsPage = () => {
  // Get device color scheme as fallback
  const deviceScheme = useColorScheme();
  const router = useRouter();
  
  // Initialize isDarkMode based on device scheme; it will be updated from AsyncStorage if available
  const [isDarkMode, setIsDarkMode] = useState(deviceScheme === "dark");
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  // On mount, check AsyncStorage for a stored userTheme value and update isDarkMode
  useEffect(() => {
    const getStoredTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("userTheme");
      if (storedTheme) {
        setIsDarkMode(storedTheme === "dark");
      }
    };
    getStoredTheme();
    checkAuth(router);
  }, []);

  // Toggle dark mode and save preference
  const toggleDarkModeSwitch = async () => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    await AsyncStorage.setItem("userTheme", newTheme);
  };

  // Toggle notifications switch and request permissions if enabling notifications
  const toggleNotificationsSwitch = async () => {
    const newStatus = !isNotificationsEnabled;
    setIsNotificationsEnabled(newStatus);
    if (newStatus) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Notification permissions were not granted.");
      }
    }
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

        {/* Profile Button */}
        <TouchableOpacity style={styles.button} onPress={() => router.push("/Profile")}>
          <Text style={styles.buttonText}>Profile</Text>
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
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
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
