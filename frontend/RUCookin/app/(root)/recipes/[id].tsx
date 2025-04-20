import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "@/components/BottomNavBar";
import { Ionicons } from "@expo/vector-icons";
import { checkAuth } from "@/utils/authChecker";

/* ------------- helpers ------------- */
const stripHtml = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

type RecipeInfo = {
  title: string;
  summary?: string;
  readyInMinutes?: number;
  servings?: number;
  instructions?: string;
};

export default function Recipe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  /* theme */
  const deviceScheme = useColorScheme();
  const [isDark, setIsDark] = useState(deviceScheme === "dark");
  const styles = createStyles(isDark);

  /* data */
  const [recipe, setRecipe] = useState<RecipeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------- on mount / focus -------- */
  useEffect(() => {
    checkAuth(router);

    (async () => {
      const storedTheme = await AsyncStorage.getItem("userTheme");
      if (storedTheme) setIsDark(storedTheme === "dark");

      try {
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?apiKey=7687f59ac03546c396f6e21ef843c784`
        );
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error("❌ Error fetching recipe info", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* -------- render states -------- */
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={isDark ? "#FFCF99" : "#721121"} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Recipe not found.</Text>
        <BottomNavBar activeTab="search" isDarkMode={isDark} />
      </View>
    );
  }

  /* -------- main UI -------- */
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        {/* ---------- header with back button ---------- */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons
              name="arrow-back"
              size={28}
              color={isDark ? "#FFCF99" : "#721121"}
            />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {recipe.title}
          </Text>
        </View>

        <ScrollView>
          {recipe.readyInMinutes !== undefined &&
            recipe.servings !== undefined && (
              <Text style={styles.meta}>
                ⏱ {recipe.readyInMinutes} min • 🍽 {recipe.servings} servings
              </Text>
            )}

          {recipe.summary && (
            <>
              <Text style={styles.sectionHeader}>Summary</Text>
              <Text style={styles.body}>{stripHtml(recipe.summary)}</Text>
            </>
          )}

          {recipe.instructions && (
            <>
              <Text style={styles.sectionHeader}>Instructions</Text>
              <Text style={styles.body}>{stripHtml(recipe.instructions)}</Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomNavBar activeTab="search" isDarkMode={isDark} />
    </View>
  );
}

/* ------------- styles ------------- */
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: dark ? "#000" : "#fff" },

    content: { flex: 1, paddingHorizontal: 20 },

    /* header row */
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      marginTop: 4,
    },
    backBtn: { marginRight: 8 },

    title: {
      flex: 1,
      fontSize: 24,
      fontWeight: "bold",
      color: dark ? "#FFCF99" : "#721121",
    },

    meta: {
      fontSize: 16,
      color: dark ? "#FFCF99" : "#721121",
      marginBottom: 16,
    },
    sectionHeader: {
      fontSize: 22,
      fontWeight: "600",
      color: dark ? "#FFCF99" : "#721121",
      marginTop: 16,
      marginBottom: 6,
    },
    body: {
      fontSize: 16,
      color: dark ? "#E5E5E5" : "#333",
      lineHeight: 22,
    },
    error: {
      flex: 1,
      textAlign: "center",
      textAlignVertical: "center",
      fontSize: 18,
      color: dark ? "#FFCF99" : "#721121",
    },
  });
