// app/SavedRecipes.tsx
import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { useRouter, useFocusEffect } from "expo-router";
import { checkAuth, getToken, getTokenData } from "../utils/authChecker";

export default function SavedRecipes() {
  /* ------------- theme ------------- */
  const deviceScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceScheme === "dark");

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const stored = await AsyncStorage.getItem("userTheme");
        setIsDark(stored ? stored === "dark" : deviceScheme === "dark");
      })();
    }, [deviceScheme])
  );

  /* ------------- recipes ------------- */
  const [recipes, setRecipes] = useState<any[]>([]);
  const router = useRouter();

  /* fetch favourites each time page is focused */
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        const username = await getTokenData("username");
        const token = await getToken();
        if (!username || !token) return;

        try {
          const res = await fetch(
            "http://localhost:3001/routes/api/favoriteRecipe",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Username: username,
              },
            }
          );
          const ids: number[] = await res.json();
          if (!isActive) return;            // screen blurred meanwhile
          if (!ids.length) {
            setRecipes([]);
            return;
          }

          const spoon = await fetch(
            `https://api.spoonacular.com/recipes/informationBulk?ids=${ids.join(
              ","
            )}&apiKey=7687f59ac03546c396f6e21ef843c784`
          );
          const data = await spoon.json();
          if (isActive) setRecipes(data);
        } catch (err) {
          console.error("❌ Error loading saved recipes", err);
        }
      };

      load();
      return () => {
        isActive = false; // cancel setState if we leave before fetch finishes
      };
    }, [])
  );

  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <Text style={styles.header}>Saved Recipes</Text>

        <ScrollView>
          <View style={styles.tileGrid}>
            {recipes.length === 0 && (
              <Text style={styles.empty}>
                You haven’t saved any recipes yet.
              </Text>
            )}

            {recipes.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.tile}
                onPress={() =>
                  router.push({
                    pathname: "/recipes/[id]",
                    params: { id: r.id.toString() },
                  })
                }
              >
                <Image source={{ uri: r.image }} style={styles.img} />
                <View style={styles.overlay} />
                <Text style={styles.title}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar activeTab="home" isDarkMode={isDark} />
    </View>
  );
}

/* ---------- styles ---------- */
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? "#000000" : "#ffffff",
    },
    content: { flex: 1, padding: 20 },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: dark ? "#FFCF99" : "#721121",
    },
    tileGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    empty: {
      fontSize: 16,
      color: dark ? "#FFCF99" : "#721121",
      textAlign: "center",
      width: "100%",
      marginTop: 40,
    },
    tile: { width: "48%", aspectRatio: 1, marginBottom: 15 },
    img: { width: "100%", height: "100%", borderRadius: 10 },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
      borderRadius: 10,
    },
    title: {
      position: "absolute",
      bottom: 4,
      left: 4,
      right: 4,
      color: "#ffffff",
      fontWeight: "600",
      textAlign: "center",
    },
  });
