// app/SavedRecipes.tsx
/**
 * @summary: SavedRecipes.tsx
 * 
 * This page displays the user's favorited recipes in one place. Each recipe is displayed as a card with an image, title, and summary including the time it takes to prepare and the number of servings.
 * This page can be accessed from the home page by clicking on the "Saved Recipes" button.
 * Users can remove recipes from their favorites by clicking on the trash icon on the upper left corner of each recipe's card.
 * 
 * @requirement: R007 - Favorite Recipe: The system shall record the user's saved/favorite recipes so that they can be retrieved later. 
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The template page for recipes. 
 */

import React, { useCallback, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, Text, ScrollView, View, Image, TouchableOpacity, useColorScheme, } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { useRouter, useFocusEffect } from "expo-router";
import { checkAuth, getToken, getTokenData } from "../utils/authChecker";
import { Ionicons } from "@expo/vector-icons";
import Constants from 'expo-constants';
// Connect to the Spoonacular API
const spoonacularApiKey = Constants.manifest?.extra?.spoonacularApiKey ?? (Constants.expoConfig as any).expo.extra.spoonacularApiKey;
// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

const stripHtml = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

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
  // DELETE favorite on backend and remove from UI
  const removeFavorite = async (recipeId: number) => {
    const username = await getTokenData("username");
    const token = await getToken();
    if (!username || !token) return;
    try {
      const res = await fetch(
        `${API_BASE}/routes/api/favoriteRecipe`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, recipeId }),
        }
      );
      if (res.ok) {
        // remove from local state
        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      } else {
        console.warn("Failed to delete favorite:", await res.text());
      }
    } catch (err) {
      console.error("Error deleting favorite:", err);
    }
  };
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
            `${API_BASE}/routes/api/favoriteRecipe`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Username: username,
              },
            }
          );
          console.log("SavedRecipes GET status:", res.status, "ok?", res.ok);
          const ids: number[] = await res.json();
          console.log("SavedRecipes fetched favorite IDs:", ids);
          if (!isActive) return;            // screen blurred meanwhile
          if (!ids.length) {
            setRecipes([]);
            return;
          }

          const spoon = await fetch(
            `https://api.spoonacular.com/recipes/informationBulk?ids=${ids.join(
              ","
            )}&apiKey=${spoonacularApiKey}`
          );
          const data = await spoon.json();
          console.log("SavedRecipes fetched recipe data:", data);
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
              <View key={r.id} style={styles.tile}>
                <TouchableOpacity
                  style={styles.tileBackground}
                  onPress={() =>
                    router.push({
                      pathname: "/recipes/[id]",
                      params: { id: r.id.toString() },
                    })
                  }
                >
                  <Image source={{ uri: r.image }} style={styles.imageStyle} />
                </TouchableOpacity>

                <View style={styles.info}>
                  <Text style={styles.tileTitle} numberOfLines={2}>
                    {r.title}
                  </Text>
                  <Text style={styles.infoText}>
                    ⏱ {r.readyInMinutes ?? "–"} min · 🍽 {r.servings ?? "–"}
                  </Text>
                  <Text style={styles.summaryText} numberOfLines={2}>
                    {stripHtml(r.summary)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.trash}
                  onPress={() => removeFavorite(r.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={isDark ? "#FFCF99" : "#721121"}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNavBar activeTab="home" isDarkMode={isDark} />
    </View>
  );
}

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
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
    title: {
      position: "absolute",
      bottom: 4,
      left: 4,
      right: 4,
      color: "#ffffff",
      fontWeight: "600",
      textAlign: "center",
    },
    tile: {
      width: Platform.OS === "web" ? "30%" : "48%",
      aspectRatio: 1,
      marginVertical: Platform.OS === "web" ? 15 : 10,
    },
    tileBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      overflow: "hidden",
    },
    imageStyle: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    info: {
      padding: 8,
    },
    tileTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: dark ? "#FFF" : "#000",
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: dark ? "#CCC" : "#555",
      marginBottom: 4,
    },
    summaryText: {
      fontSize: 13,
      color: dark ? "#AAA" : "#666",
    },
    trash: {
      position: "absolute",
      top: 6,
      left: 6,
      zIndex: 2,
      padding: 4,
      borderRadius: 6,
      backgroundColor: dark
        ? "rgba(255,255,255,0.1)"
        : "rgba(0,0,0,0.1)",
    },
  });