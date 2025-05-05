// app/adminHomePage.tsx
/**
 * @summary: adminHomePage.tsx
 * This is the screen that admins first see when they login. This screen serves as a dashboard to explain admins what they can do. 
 * Each statment/admin feature is presented in order of appearance on the Bottom Navigation bar, which is custom for the admim.
 * This file is part of the set of screens that are only accessible to admin users once they are logged in.
 * 
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Admin Home screen, where admins can view what permissions they have/what they can use their account for.
 */

// Import React libraries and necessary React Native components
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import {Platform,StyleSheet,Text,useColorScheme,View,ScrollView,TouchableOpacity} from "react-native"; // React Native UI components
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAuth, checkAdmin } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";

// Main component for the admin home page
const AdminHomePage = () => {
  const router = useRouter(); // Navigation router
  const insets = useSafeAreaInsets(); // Safe area insets for padding
  const isDarkMode = useColorScheme() === "dark"; // Boolean for dark mode

  const styles = createStyles(isDarkMode, insets.top); // Dynamic styles based on theme and safe area insets

  // Check admin authentication on component mount
  useEffect(() => {
        checkAuth(router);
        checkAdmin(router);
      }, []);
  
  // Render component
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header/Screen Title */}
          <Text style={styles.title}>Admin Dashboard</Text>
          {/* Description of admin features */}
          <Text style={styles.description}>
            Below is a description of what admins can do, presented in the order of appearance on the bottom bar.
            {/* adminBan.tsx */}
            {"\n\n"}•{" "}<Text style={styles.bold}>Manage Banned Words</Text>: manage the list of prohibited terms to keep content safe for users.
            {/* adminStats.tsx */}
            {"\n\n"}•{" "}<Text style={styles.bold}>Analytics</Text>: view stats on overall user engagement and preferences.
            {/* adminModifyAccount.tsx */}
            {"\n\n"}•{" "}<Text style={styles.bold}>Accounts</Text>: view and delete user accounts.
            {/* adminCreateRecipes.tsx */}
            {"\n\n"}•{" "}<Text style={styles.bold}>Create Recipes</Text>: add new recipes into the system for users to interact with.
            {/* adminSignUp.tsx */}
            {"\n\n"}•{" "}<Text style={styles.bold}>Create Admin</Text>: create additional admin accounts.
          </Text>

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
        </ScrollView>
      </SafeAreaView>
      {/* Bottom Navigation Bar */}
      <AdminBottomNavBar activeTab="dashboard" isDarkMode={isDarkMode} />
    </View>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (isDarkMode: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
      paddingTop: Platform.OS === "android" ? topInset : 0,
    },
    inner: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
      paddingBottom: 100, // leaving room for nav bar
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 24,
    },
    description: {
      fontSize: 18,
      lineHeight: 26,
      color: isDarkMode ? "#fff" : "#333",
    },
    bold: {
      fontWeight: "600",
      color: isDarkMode ? "#ffc074" : "#721121",
    },
    button: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      marginTop: 24,
      width: "100%",
      alignItems: "center",
    },
    buttonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#721121" : "#FFCF99",
    },
  });

export default AdminHomePage;
