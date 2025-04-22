import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth } from "../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";

const Profile = () => {
  const deviceScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const [userData, setUserData] = useState({
    id: "", // include id so you can update the record
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    cuisineLike: [],
    cuisineDislike: [],
    diet: [],
    intolerance: [],
  });
  const [editing, setEditing] = useState({
    firstName: false,
    lastName: false,
    location: false,
    email: false,
  });
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
    checkAuth(router);
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem("UserInfo");
      // console.log("Stored UserInfo:", storedUserInfo); // Debug log
      if (storedUserInfo) {
        setUserData(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Failed to load user data", error);
    }
  };

  // When a field is submitted, update the database automatically.
  const handleSave = async () => {
    console.log("Saving data:", userData); // Debugging log
    // Ensure required fields exist
    if (!userData.username || !userData.email) return;
    try {
      const response = await fetch("http://localhost:3001/routes/auth/updateProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userData.id, // from the decoded token stored during login
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          location: userData.location,
        }),
      });
      const updatedData = await response.json();
      if (response.ok) {
        // Update local state and AsyncStorage with the updated user info
        setUserData(updatedData.user);
        await AsyncStorage.setItem("UserInfo", JSON.stringify(updatedData.user));
      } else {
        console.error("Profile update failed:", updatedData.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Toggle editing mode for a given field.
  const toggleEditing = (field: keyof typeof editing) => {
    setEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const styles = createStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Header */}
        <Text style={styles.header} testID="profile-header">
          {userData.username ? `${userData.username}'s Profile` : "Profile"}
        </Text>

        {/* Basic Information Section */}
        <Text style={styles.sectionHeader} testID="basic-info-header">
          Basic Information
        </Text>

        {/* First Name */}
        <View style={styles.fieldContainer} testID="first-name-section">
          <Text style={styles.label} testID="first-name-label">First Name:</Text>
          <View style={styles.inputRow}>
            {editing.firstName ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.firstName}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, firstName: text }))}
                  testID="first-name-input" // testID for input field
                />
                <TouchableOpacity
                  onPress={() => {
                    toggleEditing("firstName");
                    handleSave();
                  }}
                  testID="save-first-name-icon" // testID for save button
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
                  testID="last-name-input" // testID for input field
                />
                <TouchableOpacity
                  onPress={() => {
                    toggleEditing("lastName");
                    handleSave();
                  }}
                  testID="save-last-name-icon" // testID for save button
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

        {/* Location */}
        <View style={styles.fieldContainer} testID="location-section">
          <Text style={styles.label} testID="location-label">Location:</Text>
          <View style={styles.inputRow}>
            {editing.location ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.location}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, location: text }))}
                  testID="location-input" // testID for input field
                />
                <TouchableOpacity
                  onPress={() => {
                    toggleEditing("location");
                    handleSave();
                  }}
                  testID="save-location-icon" // testID for save button
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
              <Text style={styles.value} testID="location-display">{userData.location || "N/A"}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEditing("location")} testID="edit-location-icon">
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
                  testID="email-input" // testID for input field
                />
                <TouchableOpacity
                  onPress={() => {
                    toggleEditing("email");
                    handleSave();
                  }}
                  testID="save-email-icon" // testID for save button
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

        {/* Bottom navigation bar */}
        <BottomNavBar activeTab="settings" isDarkMode={isDarkMode} />
      </SafeAreaView>
    </View>
  );
};

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

export default Profile;