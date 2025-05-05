// app/HomePage.tsx
/**
 * @summary: HomePage.tsx
 * This the home page for user accounts. Once a user logs in/ finishes setting up their account, this is the screen that they will be taken to.
 * This screen has three main features:
 *    1. A greeting that changes based on the time of day.
 *    2. A list of recipes that are recommended based on the time of day.
 *    3. A grid of tiles that link to other screens in the app.
 * This file is part of the set of screens that are only accessible when a user is logged in.
 * 
 * @requirement: S010 - Time-based Recipes: The system shall suggest different recipes depending on the time of the day (e.g. breakfast recipes from 5 AM to 12 PM, lunch recipes from 12 PM to 5 PM, etc.)
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Cuisine Dislikes page, which is a screen where users can select the cuisines that they dislike.
 */
import { useRouter } from "expo-router";
import { Platform, StyleSheet, Text, useColorScheme, View, Image, ImageBackground, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { checkAuth } from "../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { ScrollView, GestureHandlerRootView, Gesture } from "react-native-gesture-handler";
import Constants from 'expo-constants';

// Connect to the Spoonacular API
const spoonacularApiKey = Constants.manifest?.extra?.spoonacularApiKey ?? (Constants.expoConfig as any).expo.extra.spoonacularApiKey;

const stripHtml = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const HomePage = () => {
  const insets = useSafeAreaInsets();
  const deviceScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      console.log("Stored userTheme:", value);
      if (value) setUserTheme(value);
    });
    console.log("Device color scheme:", deviceScheme);
    checkAuth(router);
  }, []);
  
  // color scheme decided based on user preference, then device color scheme if there is no user preference set
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const styles = createStyles(isDarkMode, insets.top);


  // Good morning/afternoon/evening greeting based on the time of day
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning!";
    if (currentHour < 18) return "Good Afternoon!";
    return "Good Evening!";
  };


  // time based recipe
  const getMealType = () => {
    const hour = new Date().getHours();
    if (hour < 6   ) return "midnightSnack"; // 12 AM - 6 AM
    if (hour < 12  ) return "breakfast"; // 6 AM - 12 PM
    if (hour < 17  ) return "lunch"; // 12 PM - 5 PM
    if (hour < 21  ) return "dinner"; // 5 PM - 9 PM
    return "midnightSnack";
  };

  // Fetch recipes based on the time of day
  const [timeRecipes, setTimeRecipes] = useState<any[]>([]);
  useEffect(() => {
    const mealType = getMealType();
    const API_KEY = "YOUR_SPOON_API_KEY";

    fetch(
      `https://api.spoonacular.com/recipes/complexSearch?type=${mealType}` +
      `&number=3&addRecipeInformation=true&apiKey=${spoonacularApiKey}`
    )
      .then((res) => res.json())
      .then((json) => setTimeRecipes(json.results || []))
      .catch((err) => console.error("time‑of‑day fetch:", err));
  }, []);


  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subHeader}>
        Your Recipe Picks for the{ getGreeting().replace("Good", "") }
      </Text>
      <GestureHandlerRootView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeTileRow}
          centerContent
        >
          {timeRecipes.map((r) => (
            <View key={r.id} style={styles.timeTile}>
              {/* tappable image */}
              <TouchableOpacity
                style={styles.timeTileImage}
                onPress={() =>
                  router.push({
                    pathname: "/recipes/[id]",
                    params: { id: r.id.toString() },
                  })
                }
              >
                <Image
                  source={{ uri: r.image }}
                  style={styles.imageStyle}
                />
              </TouchableOpacity>
              {/* info below the image */}
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
            </View>
          ))}
        </ScrollView>
      </GestureHandlerRootView>
        <View style={styles.tileGrid}>
          {/* Find a Recipe Tile */}
          <TouchableOpacity style={styles.tile} onPress={() => router.push("/SearchRecipe")}>
            <ImageBackground
              source={require("../assets/images/find_recipe.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Find a Recipe</Text>
            </ImageBackground>
          </TouchableOpacity>
          
          {/* Plan a Meal Tile */}
          <TouchableOpacity style={styles.tile} onPress={() => router.push("/PlanMeal")}>
            <ImageBackground
              source={require("../assets/images/plan_meal.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Meal Plan</Text>
            </ImageBackground>
          </TouchableOpacity>
          
          {/* Saved Recipes Tile */}
          <TouchableOpacity style={styles.tile} onPress={() => router.push("/SavedRecipes")}>
            <ImageBackground
              source={require("../assets/images/saved_recipes.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Saved Recipes</Text>
            </ImageBackground>
          </TouchableOpacity>
          
          {/* Order Ingredients Tile */}
          <TouchableOpacity style={styles.tile} onPress={() => router.push("/ShoppingCart")}>
            <ImageBackground
              source={require("../assets/images/order_ingredients.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Order Food</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <BottomNavBar activeTab="home" isDarkMode={isDarkMode} />
    </View>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
function createStyles(isDarkMode: boolean, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    contentContainer: {
      flex: 1,
      paddingTop: topInset,
      paddingHorizontal: 20,
      justifyContent: "flex-start",
    },
    greeting: {
      fontSize: Platform.select({ ios: 36, web: 48, default: 36 }),
      fontWeight: "bold",
      marginVertical: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
      textAlign: "center",
    },
    tileGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    tile: {
      width: Platform.OS === "web" ? "24%" : "27%",
      aspectRatio: 1, // maintain square shape on all platforms
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
    tileText: {
      fontSize: Platform.select({ ios: 20, web: 22, default: 20 }),
      fontWeight: "bold",
      color: "#fff",
      zIndex: 1,
      textAlign: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: "rgba(0,0,0,0.3)",
      borderRadius: 5,
    },
    subHeader: {
      fontSize: 22,
      fontWeight: "600",
      marginVertical: 12,
      color: isDarkMode ? "#FFCF99" : "#721121",
      textAlign: "center",
    },
    timeTileRow: {
      paddingHorizontal: 4,
      alignItems: "flex-start",
    },
    timeTile: {
      width: 140,
      marginRight: 12,
      borderRadius: 10,
      overflow: "hidden",
    },
    timeTileImage: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 8,
    },
    info: {
      padding: 8,
    },
    tileTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#FFF" : "#000",
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: isDarkMode ? "#CCC" : "#555",
      marginBottom: 4,
    },
    summaryText: {
      fontSize: 13,
      color: isDarkMode ? "#AAA" : "#666",
    },
  });
}

export default HomePage;
