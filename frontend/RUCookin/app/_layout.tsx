import { SplashScreen, Stack } from "expo-router";
import "./globals.css";
import { useFonts} from "expo-font";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "InknutAntiqua-SemiBold": require("@/assets/fonts/InknutAntiqua-SemiBold.ttf"),
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
    "SpaceMono-Regular": require("@/assets/fonts/SpaceMono-Regular.ttf")
  });
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return <Stack screenOptions={{headerShown:false}} />;
}
