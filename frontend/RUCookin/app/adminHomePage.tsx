import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import {Platform,StyleSheet,Text,useColorScheme,View,ScrollView,TouchableOpacity} from "react-native"; // React Native UI components
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAuth, checkAdmin } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";

const AdminHomePage = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === "dark";

  const styles = createStyles(isDarkMode, insets.top);

  useEffect(() => {
        checkAuth(router);
        checkAdmin(router);
      }, []);
  

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Admin Dashboard</Text>

          <Text style={styles.description}>
            Below is a description of what admins can do, presented in the order of appearance on the bottom bar.
            {"\n\n"}•{" "}<Text style={styles.bold}>Manage Banned Words</Text>: manage the list of prohibited terms to keep content safe for users.
            {"\n\n"}•{" "}<Text style={styles.bold}>Analytics</Text>: view stats on overall user engagement and preferences.
            {"\n\n"}•{" "}<Text style={styles.bold}>Accounts</Text>: view and delete user accounts.
            {"\n\n"}•{" "}<Text style={styles.bold}>Create Recipes</Text>: add new recipes into the system for users to interact with.
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

      <AdminBottomNavBar activeTab="dashboard" isDarkMode={isDarkMode} />
    </View>
  );
};

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
