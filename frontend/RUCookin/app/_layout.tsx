// app/_layout.tsx
/**
 * @summary: _layout.tsx
 * This file represents the root layout of the app. In layman terms, this is the initial boot up/loading screen.
 * This is where we load in fonts and images.
 * We show a custom splash screen while the app is loading.  
 * 
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The root layout of the app, which includes the loading screen and preloads the login and sign up screens for smoother transitions.
 */

import React, { useState, useEffect } from "react";
import { Platform, useColorScheme, View, Image, ActivityIndicator, StyleSheet } from "react-native";
import { SplashScreen, Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Asset } from "expo-asset";
import "./globals.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = createStyles(isDarkMode);
  
  // Loading fonts
  const [fontsLoaded] = useFonts({
    "InknutAntiqua-SemiBold": require("@/assets/fonts/InknutAntiqua-SemiBold.ttf"),
    "Inter-Regular":         require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold":        require("@/assets/fonts/Inter-SemiBold.ttf"),
    "SpaceMono-Regular":     require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Loading our loading GIF
  const [gifLoaded, setGifLoaded] = useState(false);

  // Establish that the app's loadng screen is our GIF and a spinner
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Asset.loadAsync(require("@/assets/images/loading.gif"));
      } catch (e) {
        console.warn("Error loading assets:", e);
      } finally {
        setGifLoaded(true);
      }
    }
    prepare();
  }, []);

  // hiding the default splash screen that Expo provides because let's honestly, it's mid
  useEffect(() => {
    if (fontsLoaded && gifLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, gifLoaded]);

  // Displaying our loading screen while the app is loading
  if (!fontsLoaded || !gifLoaded) {
    return (
      <View style={styles.container}>
        <Image
          source={require("@/assets/images/loading.gif")}
          style={styles.gif}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" style={styles.spinner} />
      </View>
    );
  }

  // pre-loading login and sign up for smoother transitions
  return (
    <Stack
      screenOptions={({ route }) => ({
        gestureEnabled: !["Login", "SignUp"].includes(route.name),
        headerShown: false,
      })}
    />
  );
}

// Styling for the loading screen
function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#721121" : "#FFCF99", // match your splash BG
    },
    gif: {
      width: 150,
      height: 150,
    },
    spinner: {
      marginTop: 20,
    },
  });
}
