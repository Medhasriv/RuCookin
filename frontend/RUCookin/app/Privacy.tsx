import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
          <Text style={styles.text}>Icons made by Freepik from www.flaticon.com</Text>
          <Text style={styles.text}>search</Text>

          <Text style={styles.text}>
            Icons made by Darwisy Alfarizi from www.flaticon.com
          </Text>
          <Text style={styles.text}>home</Text>

          <Text style={styles.text}>Icons made by Freepik from www.flaticon.com</Text>
          <Text style={styles.text}>Cart</Text>

          <Text style={styles.text}>Icons made by Freepik from www.flaticon.com</Text>
          <Text style={styles.text}>Settings</Text>

          <Text style={styles.text}>Icons made by Freepik from www.flaticon.com</Text>
          <Text style={styles.text}>Find Recipe image</Text>

          <Text style={styles.text}>Photo by Mike Gattorna on Unsplash</Text>
          <Text style={styles.text}>Plan Meal image</Text>

          <Text style={styles.text}>Photo by S'well on Unsplash</Text>
          <Text style={styles.text}>Saved Recipes</Text>

          <Text style={styles.text}>Photo by Metin Ozer on Unsplash</Text>
          <Text style={styles.text}>Order Ingredients image</Text>

          <Text style={styles.text}>Photo by nrd on Unsplash</Text>
          <Text style={styles.text}>Edit Pencil</Text>

          <Text style={styles.text}>
            Icons made by alkhalifi design from www.flaticon.com
          </Text>
          <Text style={styles.text}>Default‑Profile</Text>

          <Text style={styles.text}>
            Default icons created by kliwir art ‑ Flaticon
          </Text>
          <Text style={styles.text}>Pantry</Text>

          <Text style={styles.text}>
            Carrot icons created by Freepik ‑ Flaticon
          </Text>
          <Text style={styles.text}>Cancel/X recipe</Text>

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

/* ----------------- STYLES ----------------- */
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