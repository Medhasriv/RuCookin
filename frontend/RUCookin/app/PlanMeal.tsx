// app/PlanMeal.tsx
/**
 * @summary: PlanMeal.tsx
 * 
 * This page allows the user to plan a meal based on their budget and pantry items.
 * This page can be accessed by clicking on the "Meal Plan" button on the home page.
 * The page will ask the user to unput their max budget and then fetch recipes from the Spoonacular API based on the user's pantry items and budget.
 * Recipe suggestions will show how many ingredients the user has in the pantry are used in the recipe and how many ingredients are missing.
 * Recipe suggestions will also show the estimated cost of the missing ingredients.
 * 
 * @requirement: R006 - Budget-Based Recipe Suggestion: The system shall allow users to input a budget and return recipes that can be made within that budget, using the Kroger API to estimate grocery/ingredient costs and available pantry ingredients.
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @returns: The budget meal planning page for the RUCookin' app. This page serves as the "business logic" for our app, allowing users to plan meals based on their budget and pantry items.
 */

// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform, } from "react-native";
import { getToken } from "../utils/authChecker"; // Utility to retrieve auth token
import { useColorScheme } from "react-native"; // Detect device color scheme
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"; // Avoid safe area issues (like notch)
import BottomNavBar from "../components/BottomNavBar"; // Custom bottom navigation bar
import { useRouter } from "expo-router"; // Navigation hook for routing
import AsyncStorage from "@react-native-async-storage/async-storage"; // Async storage for persisting data
import { checkAuth } from "../utils/authChecker";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;
// Connect to the Spoonacular API
const spoonacularApiKey = Constants.manifest?.extra?.spoonacularApiKey ?? (Constants.expoConfig as any).expo.extra.spoonacularApiKey;

// Define the PantryItem type
type PantryItem = {
  id: number;
  name: string;
};

// Define the Recipe type
type Recipe = {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missingCost?: number;
};

const PlanMeal = () => {
  // State to hold user budget input
  const [budget, setBudget] = useState("");
  // State to store list of recipes fetched from Spoonacular API
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  // State to store user's pantry items fetched from backend
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);

  // Get color scheme based on user preference or device setting if not set
  const insets = useSafeAreaInsets();
  const deviceScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => { // Check if user has set a theme preference
    AsyncStorage.getItem("userTheme").then((value) => {
      console.log("Stored userTheme:", value);
      if (value) setUserTheme(value);
    });
    console.log("Device color scheme:", deviceScheme); // debugging log
    checkAuth(router);
  }, []);

  // setting effective theme based on user preference or device setting
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const styles = createStyles(isDarkMode, insets.top);

  // Fetch pantry items when the component first mounts
  useEffect(() => {
    fetchPantryItems();
  }, []);

  // Function to fetch pantry items from the server
  const fetchPantryItems = async () => {
    try {
      const token = await getToken(); // Retrieve auth token
      const response = await fetch(`${API_BASE}/routes/api/pantry`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in header
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPantryItems(data); // Save fetched pantry items to state
      } else {
        console.error("Failed to fetch pantry:", data);
      }
    } catch (error) {
      console.error("❌ Pantry fetch error:", error);
    }
  };

  // Function to fetch recipes based on pantry items and user's budget
  const fetchRecipes = async () => {
    if (!budget.trim()) return; // If budget is empty, do nothing

    try {
      const budgetCents = parseFloat(budget) * 100; // Convert dollars to cents
      const ingredientNames = pantryItems.map((item) => item.name).join(","); // Build comma-separated ingredient list

      // Fetch recipes that can be made with pantry ingredients
      const baseResponse = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
          ingredientNames
        )}&number=10&apiKey=${spoonacularApiKey}`
      );

      const baseData: Recipe[] = await baseResponse.json();
      const filteredRecipes: Recipe[] = [];

      // For each recipe, check the price breakdown
      for (const recipe of baseData) {
        const priceResponse = await fetch(
          `https://api.spoonacular.com/recipes/${recipe.id}/priceBreakdownWidget.json?apiKey=${spoonacularApiKey}`
        );
        const priceData = await priceResponse.json();

        // Clean pantry ingredient names for easier matching
        const pantryNames = pantryItems.map((item) =>
          item.name.toLowerCase().replace(/[^a-z]/g, "")
        );

        // Calculate the cost of missing ingredients
        const missingCost = priceData.ingredients
          .filter((ing: any) => {
            const cleanName = ing.name.toLowerCase().replace(/[^a-z]/g, "");
            return !pantryNames.includes(cleanName);
          })
          .reduce((sum: number, ing: any) => sum + ing.price, 0);

        // Only include recipes where missing ingredients cost <= budget
        if (missingCost <= budgetCents) {
          filteredRecipes.push({
            ...recipe,
            missingCost: parseFloat((missingCost / 100).toFixed(2)), // Convert back to dollars
          });
        }
      }

      // Update recipes state
      setRecipes(filteredRecipes);
    } catch (error) {
      console.error("❌ Error fetching recipes with price filter:", error);
    }
  };

  // Render component UI
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.contentContainer}>
        {/* Header */}
        <Text style={styles.header}>Plan a Meal</Text>
        <Text style={styles.caption}>Enter your budget and we'll find recipes!</Text>

        {/* Budget input field */}
        <TextInput
          style={styles.budgetInput}
          placeholder="Enter max budget in $"
          placeholderTextColor={isDarkMode ? "#888" : "#555"}
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
          onSubmitEditing={fetchRecipes} // Fetch recipes when user submits
        />

        {/* Pantry empty error message */}
        {pantryItems.length === 0 && (
          <Text style={{ color: isDarkMode ? "#FF6B6B" : "#B00020", textAlign: "center", marginBottom: 20 }}>
            Your pantry is empty. Please add ingredients before planning a meal.
          </Text>
        )}

        {/* List of recipes */}
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/RecipeDetail",
                  params: {
                    id: item.id,
                    title: item.title,
                    image: item.image,
                  },
                })
              }
            >
              <View style={styles.recipeItem}>
                {/* Recipe image */}
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
                <View style={styles.recipeText}>
                  {/* Recipe title */}
                  <Text style={styles.recipeTitle}>{item.title}</Text>
                  {/* Recipe ingredient info */}
                  <Text style={styles.recipeInfo}>
                    ✅ Used: {item.usedIngredientCount} | ❌ Missing: {item.missedIngredientCount} | 💸 Est. Cost: $
                    {item.missingCost !== undefined ? item.missingCost : "N/A"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>

      {/* Bottom navigation bar */}
      <BottomNavBar activeTab="home" isDarkMode={isDarkMode} />
    </KeyboardAvoidingView>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (isDarkMode: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
    },
    contentContainer: {
      flex: 1,
      paddingTop: topInset,
      padding: 20,
      // justifyContent: "flex-start"
    },
    header: {
      fontSize: 28,
      fontWeight: "bold",
      color: isDarkMode ? "#FFCF99" : "#721121",
      textAlign: "center",
      marginBottom: 10,
    },
    caption: {
      fontSize: 16,
      color: isDarkMode ? "#FFCF99" : "#721121",
      textAlign: "center",
      marginBottom: 20,
    },
    budgetInput: {
      borderWidth: 1,
      borderColor: isDarkMode ? "#FFCF99" : "#721121",
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 50,
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 20,
      backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
    },
    recipeItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#444" : "#ccc",
      paddingBottom: 10,
    },
    recipeImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
    },
    recipeText: {
      marginLeft: 15,
      flex: 1,
    },
    recipeTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    recipeInfo: {
      fontSize: 14,
      color: isDarkMode ? "#ccc" : "#555",
      marginTop: 4,
    },
  });

export default PlanMeal;