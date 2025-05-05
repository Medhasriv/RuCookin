// app/Privacy.tsx
/**
 * @summary: Privacy.tsx
 * 
 * This page lists out the credits for the icons and photos used in the app.
 * The purpose of this page is solely for legal credit. Creditting in the app was required by the icon providers.
 * 
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The privacy and credits page. 
 */

import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, } from "react-native";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import BottomNavBar from "../components/BottomNavBar";
import { checkAuth } from "../utils/authChecker";

export default function Privacy() {
  /* ---------- dark / light mode ---------- */
  const deviceScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(deviceScheme === "dark");
  const styles = createStyles(isDarkMode);
  const router = useRouter();

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem("userTheme");
      if (stored) setIsDarkMode(stored === "dark");
    };
    loadTheme();
    checkAuth(router);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.header}>Privacy & Credits</Text>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.text}>Icons made by Freepik, Darwisy Alfarizi, alkhalifi, kosonicon, Phoenix Group, Tanah Basah from www.flaticon.com</Text>

          <Text style={styles.text}>Photos by Mike Gattorn, S'well, Metin Ozer, nrd on Unsplash</Text>

          <Text style={styles.text}>
            Default icons created by kliwir art ‑ Flaticon
          </Text>

          <Text style={styles.text}>
            Carrot icons created by Freepik ‑ Flaticon
          </Text>

          <Text style={styles.text}>
            Cancel icons created by Bharat Icons ‑ Flaticon
          </Text>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom navigation keeps app navigation consistent */}
      <BottomNavBar activeTab="settings" isDarkMode={isDarkMode} />
    </View>
  );
}

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#000000" : "#ffffff",
    },
    header: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDark ? "#FFCF99" : "#721121",
      textAlign: "center",
      marginVertical: 16,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    text: {
      fontSize: 16,
      color: isDark ? "#FFCF99" : "#721121",
      marginVertical: 4,
    },
  });
}