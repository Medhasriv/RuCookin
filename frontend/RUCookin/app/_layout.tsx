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
  
  // 1. Load your custom fonts
  const [fontsLoaded] = useFonts({
    "InknutAntiqua-SemiBold": require("@/assets/fonts/InknutAntiqua-SemiBold.ttf"),
    "Inter-Regular":         require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold":        require("@/assets/fonts/Inter-SemiBold.ttf"),
    "SpaceMono-Regular":     require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  // 2. Track whether we’ve preloaded the GIF asset
  const [gifLoaded, setGifLoaded] = useState(false);

  // 3. Prevent the native splash from auto-hiding, and load the GIF
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

  // 4. Once both fonts & GIF are ready, hide the native splash
  useEffect(() => {
    if (fontsLoaded && gifLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, gifLoaded]);

  // 5. While loading, show your custom JS splash (GIF + spinner)
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

  // 6. Everything’s loaded—render your normal app stack
  return (
    <Stack
      screenOptions={({ route }) => ({
        gestureEnabled: !["Login", "SignUp"].includes(route.name),
        headerShown: false,
      })}
    />
  );
}

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
