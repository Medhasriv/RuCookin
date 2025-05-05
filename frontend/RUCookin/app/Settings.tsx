// Import necessary libraries and components
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, Switch, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // For safe area support (notch areas)
import { useColorScheme } from "react-native"; // Detect if the user is using light or dark mode
import { useRouter } from "expo-router"; // For navigation
import { checkAuth } from "../utils/authChecker"; // Custom utility to check if the user is authenticated
import AsyncStorage from "@react-native-async-storage/async-storage"; // To store and retrieve user preferences
import * as Notifications from "expo-notifications"; // To handle notifications and permissions
import BottomNavBar from "../components/BottomNavBar"; // Custom bottom navigation bar component

const SettingsPage = () => {
  // Get device's color scheme as a fallback value
  const deviceScheme = useColorScheme();
  const router = useRouter(); // Router instance for navigation

  // States to store user's preferences for dark mode and notifications
  const [isDarkMode, setIsDarkMode] = useState(deviceScheme === "dark"); // Default to system theme
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true); // Default to notifications enabled

  // Effect to load user's stored theme preference from AsyncStorage on component mount
  useEffect(() => {
    const getStoredTheme = async () => {
      const storedTheme = await AsyncStorage.getItem("userTheme"); // Retrieve stored theme
      if (storedTheme) {
        setIsDarkMode(storedTheme === "dark"); // Set theme based on stored value
      }
    };
    getStoredTheme(); // Call function to fetch stored theme

    checkAuth(router); // Check if the user is authenticated (navigate if not)
  }, []);

  // Function to toggle dark mode preference and store it in AsyncStorage
  const toggleDarkModeSwitch = async () => {
    const newTheme = isDarkMode ? "light" : "dark"; // Toggle between dark and light themes
    setIsDarkMode(!isDarkMode); // Update the local state
    await AsyncStorage.setItem("userTheme", newTheme); // Store updated theme in AsyncStorage
  };

  // Effect to fetch and set notification status from AsyncStorage
  useEffect(() => {
    const getNotificationStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('notificationsEnabled'); // Get notification status
        if (status !== null) {
          setIsNotificationsEnabled(status === 'true'); // Set notifications state based on stored value
        }
      } catch (error) {
        console.error('Error loading notification status:', error); // Handle any errors
      }
    };

    getNotificationStatus(); // Call function to load notification status
  }, []);

  // Function to toggle notification preference, request permissions if enabling notifications
  const toggleNotificationsSwitch = async () => {
    const newStatus = !isNotificationsEnabled; // Toggle the current notification status
    setIsNotificationsEnabled(newStatus); // Update state
    await AsyncStorage.setItem('notificationsEnabled', newStatus.toString()); // Store new status in AsyncStorage

    if (newStatus) {
      const { status } = await Notifications.requestPermissionsAsync(); // Request notification permissions
      if (status !== "granted") {
        alert("Notification permissions were not granted."); // Alert if permissions are denied
      }
    }
  };

  // Generate styles based on dark mode preference
  const styles = createStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Page header */}
        <Text style={styles.header}>Settings</Text>

        {/* Notifications Toggle Switch */}
        <View style={styles.switchContainer}>
          <Text style={styles.text}>Notifications</Text>
          <Switch
            value={isNotificationsEnabled} // Bind switch value to notifications state
            onValueChange={toggleNotificationsSwitch} // Toggle notifications on/off
            trackColor={{ false: "#D3D3D3", true: "#FFCF99" }} // Color when off/on
            thumbColor={isNotificationsEnabled ? "#721121" : "#701C1C"} // Color of thumb when on/off
          />
        </View>

        {/* Dark Mode Toggle Switch */}
        <View style={styles.switchContainer}>
          <Text style={styles.text}>Dark Mode</Text>
          <Switch
            value={isDarkMode} // Bind switch value to dark mode state
            onValueChange={toggleDarkModeSwitch} // Toggle dark mode on/off
            trackColor={{ false: "#D3D3D3", true: "#FFCF99" }} // Color when off/on
            thumbColor={isDarkMode ? "#721121" : "#701C1C"} // Color of thumb when on/off
          />
        </View>

        {/* Profile Button, navigates to the Profile page */}
        <TouchableOpacity style={styles.button} onPress={() => router.push("/Profile")}>
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        {/* Privacy Button, navigates to the Privacy & Credits page */}
        <TouchableOpacity style={styles.button} onPress={() => router.push("/Privacy")}>
          <Text style={styles.buttonText}>Privacy & Credits</Text>
        </TouchableOpacity>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            AsyncStorage.removeItem("token"); // Remove stored token
            AsyncStorage.removeItem("userTheme"); // Remove stored theme preference
            await AsyncStorage.clear();
            router.push("/Login"); // Redirect to Login page
          }}
        >
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom navigation bar */}
      <BottomNavBar activeTab="settings" isDarkMode={isDarkMode} />
    </View>
  );
};

// Function to create styles based on dark mode preference
function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff", // Dark/light background
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
      color: isDarkMode ? "#FFCF99" : "#721121", // Header text color changes with theme
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
      color: isDarkMode ? "#FFCF99" : "#721121", // Text color for switches
    },
    button: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121", // Button background color changes with theme
      padding: 15,
      borderRadius: 8,
      marginVertical: 10,
      width: "80%",
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#721121" : "#FFCF99", // Button text color changes with theme
    },
  });
}

export default SettingsPage;