import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useRouter } from "expo-router";
import { checkAuth } from "../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";

const Profile = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
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
    checkAuth(router);
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem("UserInfo");
      console.log("Stored UserInfo:", storedUserInfo); // Debug log
      if (storedUserInfo) {
        setUserData(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Failed to load user data", error);
    }
  };

  // When a field is submitted, update the database automatically.
  const handleSave = async () => {
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
        <Text style={styles.header}>
          {userData.username ? `${userData.username}'s Profile` : "Profile"}
        </Text>


        {/* Basic Information Section */}
        <Text style={styles.sectionHeader}>Basic Information</Text>

                {/* First Name */}
                <View style={styles.fieldContainer}>
          <Text style={styles.label}>First Name:</Text>
          <View style={styles.inputRow}>
            {editing.firstName ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.firstName}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, firstName: text }))}
                />
                <TouchableOpacity onPress={() => { toggleEditing("firstName"); handleSave(); }}>
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
              <Text style={styles.value}>{userData.firstName || "N/A"}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEditing("firstName")}>
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
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Last Name:</Text>
          <View style={styles.inputRow}>
            {editing.lastName ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.lastName}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, lastName: text }))}
                />
                <TouchableOpacity onPress={() => { toggleEditing("lastName"); handleSave(); }}>
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
              <Text style={styles.value}>{userData.lastName || "N/A"}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEditing("lastName")}> 
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
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Location:</Text>
          <View style={styles.inputRow}>
            {editing.location ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.location}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, location: text }))}
                />
                <TouchableOpacity onPress={() => { toggleEditing("location"); handleSave(); }}>
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
              <Text style={styles.value}>{userData.location || "N/A"}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEditing("location")}> 
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
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email:</Text>
          <View style={styles.inputRow}>
            {editing.email ? (
              <>
                <TextInput
                  style={styles.input}
                  value={userData.email}
                  onChangeText={(text) => setUserData((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                />
                <TouchableOpacity onPress={() => { toggleEditing("email"); handleSave(); }}>
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
              <Text style={styles.value}>{userData.email || "N/A"}</Text>
            )}
            <TouchableOpacity onPress={() => toggleEditing("email")}> 
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


        {/* Preferences Button */}
        <TouchableOpacity
          style={styles.preferenceButton}
          onPress={() => router.push("/CuisineLikes")}
        >
          <Text style={styles.preferenceButtonText}>
            Diet and Cuisine Preferences
          </Text>
        </TouchableOpacity>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              AsyncStorage.removeItem("token");
              router.push("/Login");
            }}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="profile" isDarkMode={isDarkMode} />
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
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    preferenceButton: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 20,
    },
    preferenceButtonText: {
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 18,
      fontWeight: "bold",
    },
    sectionHeader: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 10,
    },
    fieldContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 5,
    },
    value: {
      fontSize: 16,
      padding: 10,
      borderRadius: 5,
      backgroundColor: isDarkMode ? "#721121" : "#FFF",
      color: isDarkMode ? "#FFCF99" : "#721121",
      flex: 1,
    },
    input: {
      fontSize: 16,
      padding: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? "#FFCF99" : "#721121",
      borderRadius: 5,
      color: isDarkMode ? "#FFCF99" : "#721121",
      backgroundColor: isDarkMode ? "#721121" : "#FFF",
      flex: 1,
    },
    editIcon: {
      width: 24,
      height: 24,
      marginLeft: 10,
      tintColor: isDarkMode ? "#FFCF99" : "#721121",
    },
    buttonContainer: {
      marginTop: 20,
      alignItems: "center",
    },
    button: {
      padding: 15,
      borderRadius: 8,
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      margin: 10,
      width: "80%",
    },
    buttonText: {
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
    },
  });
}

export default Profile;