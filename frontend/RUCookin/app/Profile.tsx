// app/Profile.tsx
/**
 * @summary: Profile.tsx
 * 
 * This page allows users to view and edit their profile information.
 * Users can update their first name, last name, and email address.
 * 
 * @requirement: U002 - Account Modification: The system shall allow users to edit information such as first name, last name, location, and email. 
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * 
 * @author: Team SWEG
 * @returns: The basic profile page for users to view and edit their profile information. 
 */
// Import necessary React and React Native libraries
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth } from "../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// Profile screen component
const Profile = () => {
  // Detect device color scheme (light or dark)
  const deviceScheme = useColorScheme();

  // State for user's saved theme (can override device setting)
  const [userTheme, setUserTheme] = useState<string | null>(null);

  // Determine effective theme: user preference overrides device setting
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";

  // State to store user's profile data
  const [userData, setUserData] = useState({
    id: "",
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    cuisineLike: [],
    cuisineDislike: [],
    diet: [],
    intolerance: [],
  });

  // State to track which fields are currently being edited
  const [editing, setEditing] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  const router = useRouter();

  // Load user settings and data when component mounts
  useEffect(() => {
    // Load user's preferred theme from AsyncStorage
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
    // Check if user is authenticated, redirect if not
    checkAuth(router);
    // Fetch user's profile data from the server
    fetchUserData();
  }, []);

  // Function to fetch user's data from server
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("token"); // Get stored token
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(`${API_BASE}/routes/auth/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUserData(data.user); // Update state with server data
        await AsyncStorage.setItem("UserInfo", JSON.stringify(data.user)); // Cache user data locally
      } else {
        console.error("Failed to fetch user profile:", data.message);
      }
    } catch (error) {
      console.error("Failed to load user data", error);
    }
  };

  // Save updated user data to server
  const handleSave = async () => {
    console.log("Saving data:", userData);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch(`${API_BASE}/routes/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        }),
      });

      const updatedData = await response.json();
      if (response.ok) {
        setUserData(updatedData.user); // Update UI with latest data
        console.log("after");
        console.log(updatedData.user);
        await AsyncStorage.setItem("UserInfo", JSON.stringify(updatedData.user)); // Update local cache
        console.log("Profile updated successfully!");
      } else {
        console.error("Profile update failed:", updatedData.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Function to toggle editing mode for a specific field
  const toggleEditing = (field: keyof typeof editing) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Create dynamic styles based on theme
  const styles = createStyles(isDarkMode);

  // Render component
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Header showing user's username */}
        <Text style={styles.header} testID="profile-header">
          {userData.username ? `${userData.username}'s Profile` : "Profile"}
        </Text>

        {/* Section header for basic information */}
        <Text style={styles.sectionHeader} testID="basic-info-header">
          Basic Information
        </Text>

        {/* Field for First Name */}
        <View style={styles.fieldContainer} testID="first-name-section">
          <Text style={styles.label} testID="first-name-label">First Name:</Text>
          <View style={styles.inputRow}>
            {editing.firstName ? (
              <>
                {/* Editable input field */}
                <TextInput
                  style={styles.input}
                  value={userData.firstName}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, firstName: text }))}
                  testID="first-name-input"
                />
                {/* Save changes button */}
                <TouchableOpacity
                  onPress={() => {
                    toggleEditing("firstName");
                    handleSave();
                  }}
                  testID="save-first-name-icon"
                >
                  <Image
                    source={
                      isDarkMode
                        ? require("../assets/icons/save-dark.png")
                        : require("../assets/icons/save-light.png")
                    }
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.value} testID="first-name-display">{userData.firstName || "N/A"}</Text>
            )}
            {/* Edit button */}
            <TouchableOpacity onPress={() => toggleEditing("firstName")} testID="edit-first-name-icon">
              <Image
                source={
                  isDarkMode
                    ? require("../assets/icons/edit-dark.png")
                    : require("../assets/icons/edit-light.png")
                }
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Last Name */}
        <View style={styles.fieldContainer} testID="last-name-section">
          <Text style={styles.label} testID="last-name-label">Last Name:</Text>
          <View style={styles.inputRow}>
            {editing.lastName ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.lastName}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, lastName: text }))}
                  testID="last-name-input"
                />
                <TouchableOpacity
                  onPress={() => {
                    toggleEditing("lastName");
                    handleSave();
                  }}
                  testID="save-last-name-icon"
                >
                  <Image
                    source={
                      isDarkMode
                        ? require("../assets/icons/save-dark.png")
                        : require("../assets/icons/save-light.png")
                    }
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.value} testID="last-name-display">{userData.lastName || "N/A"}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEditing("lastName")} testID="edit-last-name-icon">
              <Image
                source={
                  isDarkMode
                    ? require("../assets/icons/edit-dark.png")
                    : require("../assets/icons/edit-light.png")
                }
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Email */}
        <View style={styles.fieldContainer} testID="email-section">
          <Text style={styles.label} testID="email-label">Email:</Text>
          <View style={styles.inputRow}>
            {editing.email ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.email}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  testID="email-input"
                />
                <TouchableOpacity
                  onPress={() => {
                    toggleEditing("email");
                    handleSave();
                  }}
                  testID="save-email-icon"
                >
                  <Image
                    source={
                      isDarkMode
                        ? require("../assets/icons/save-dark.png")
                        : require("../assets/icons/save-light.png")
                    }
                    style={styles.editIcon}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.value} testID="email-display">{userData.email || "N/A"}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEditing("email")} testID="edit-email-icon">
              <Image
                source={
                  isDarkMode
                    ? require("../assets/icons/edit-dark.png")
                    : require("../assets/icons/edit-light.png")
                }
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom navigation bar */}
      <BottomNavBar activeTab="settings" isDarkMode={isDarkMode} />
    </View>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    contentContainer: {
      padding: 16,
      flex: 1,
    },
    header: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: isDarkMode ? "#ffffff" : "#000000",
    },
    sectionHeader: {
      fontSize: 20,
      marginBottom: 12,
      color: isDarkMode ? "#cccccc" : "#333333",
    },
    fieldContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      color: isDarkMode ? "#ffffff" : "#000000",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDarkMode ? "#ffffff" : "#000000",
      padding: 8,
      marginRight: 10,
      color: isDarkMode ? "#ffffff" : "#000000",
      backgroundColor: isDarkMode ? "#333333" : "#f0f0f0",
    },
    editIcon: {
      width: 20,
      height: 20,
    },
    value: {
      fontSize: 16,
      color: isDarkMode ? "#cccccc" : "#333333",
    },
  });

// Export the component
export default Profile;