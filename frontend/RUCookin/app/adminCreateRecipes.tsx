// app/adminCreateRecipes.tsx
/**
 * @summary: adminCreateRecipes.tsx
 * This is the screen where an admin creates their own recipe.
 * This file is part of the set of screens that are only accessible to admin users once they are logged in.
 * 
 * @requirement: A013 - Admin Add Recipes: The system shall allow administrators to add recipes to the list of existing recipes
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Admin Create Recipes screen, where admins can create their own recipe and add it to the system.
 */

// Importing React libraries and nexessary React Native components
import React, { useEffect, useState } from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Platform,useColorScheme} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { checkAuth, checkAdmin } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";
import { LogBox } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run. This is part of requirement U018 - Database Connectivity w/ Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// Suppress specific warning about nested VirtualizedLists. This is a common warning that is not currently breaking our app and impacting functionalities.
LogBox.ignoreLogs([
  "VirtualizedLists should never be nested inside plain ScrollViews"
]);

// Main component for creating a new recipe
const AdminCreateRecipe = () => {
  const router = useRouter(); // Navigation router
  const insets = useSafeAreaInsets(); // Safe area insets for handling notches and safe areas
  const isDarkMode = useColorScheme() === "dark"; // Detect dark mode
  const styles = createStyles(isDarkMode, insets.top); // Generate styles based on theme and safe area

  const [title, setTitle] = useState(""); // State for recipe title
  const [summary, setSummary] = useState(""); // State for recipe summary
  const [readyInMin, setReadyInMin] = useState(""); // State for recipe ready time in minutes
  const [instructions, setInstructions] = useState(""); // State for recipe instructions
  const [ingredients, setIngredients] = useState(""); // State for recipe ingredients

  // Check authentication and admin status on component mount
  useEffect(() => {
    checkAuth(router);
    checkAdmin(router);
  }, []);

  // Handle form submission, which is triggered when the user clicks the "Continue Making the Recipe" button
  const handleSubmit = async () => {
    if (!title.trim() || !instructions.trim() || !ingredients.trim()) {
      return alert("Please fill in Title, Instructions, and Ingredients."); 
    }

    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      readyInMin: readyInMin ? parseInt(readyInMin, 10) : undefined,
      instructions: instructions.trim(),
      ingredients: ingredients.split(",").map((i) => i.trim())
    };

    try {
      const res = await fetch(
        `${API_BASE}/routes/api/adminCreateRecipe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        router.push({
          pathname: "/adminCreateRecipeCuisine",
          params: { recipeTitle: title.trim() }
        });
      } else {
        alert(data.message || "Failed to create recipe.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check console for details.");
    }
  };

  // Rendering component
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Heading text */}
          <Text style={styles.title}>Create New Recipe</Text>
          
          {/* Input fields for recipe details */}

          {/* Title */}
          <TextInput
            style={styles.input}
            placeholder="Title *"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={title}
            onChangeText={setTitle}
          />
          {/* Summary */}
          <TextInput
            style={styles.input}
            placeholder="Summary"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={summary}
            onChangeText={setSummary}
          />
          {/* Ready in minutes */}
          <TextInput
            style={styles.input}
            placeholder="Ready In Minutes"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={readyInMin}
            onChangeText={setReadyInMin}
            keyboardType="numeric"
          />
          {/* Instructions */}
          <TextInput
            style={styles.textArea}
            placeholder="Instructions *"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />
          {/* Ingredients */}
          <TextInput
            style={styles.input}
            placeholder="Ingredients (comma-separated) *"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={ingredients}
            onChangeText={setIngredients}
          />
          {/* Continue button */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Continue Making the Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      {/* Bottom navigation bar */}
      <AdminBottomNavBar activeTab="new_recipe" isDarkMode={isDarkMode} />
    </View>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (isDarkMode: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
      paddingTop: Platform.OS === "android" ? topInset : 0,
    },
    inner: { flex: 1 },
    content: {
      padding: 20,
      paddingBottom: 100, // leave space for nav bar
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 24,
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      color: isDarkMode ? "#fff" : "#000",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    textArea: {
      height: 100,
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      color: isDarkMode ? "#fff" : "#000",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      textAlignVertical: "top",
    },
    button: {
      backgroundColor: isDarkMode ? "#721121" : "#ffc074",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 16,
    },
    buttonText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default AdminCreateRecipe;
