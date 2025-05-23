// app/Pantry.tsx
/**
 * @summary: Pantry.tsx
 * 
 * Users can store ingredients that they have in their pantry. 
 * Users can search for ingredients and add them to their pantry.
 * Users can remove ingredients from their pantry.
 * Users can update the expiration date of the ingredients in their pantry.
 * Users can view the ingredients in their pantry.
 * The ingredients added to the pantry will be used for recipe suggestions and budget meal planning.
 * The pantry page can be accessed from the bottom navigation bar.
 * 
 * @requirement: S008 - Expiration Date Reminder: The system shall allow users to input expiration dates for their ingredients and notify them when ingredients are nearing expiration.
 * @requirement: S009 - MyPantry: The system shall allow users to save the ingredients to Mypantry, which will be used later when deciding on recipes
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The pantry page for the RUCookin' app.
 */

// Importing necessary libraries and components
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { checkAuth, getToken } from "../utils/authChecker";
import BottomNavBar from "../components/BottomNavBar";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run.
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;
// Connect to the Spoonacular API
const spoonacularApiKey = Constants.manifest?.extra?.spoonacularApiKey ?? (Constants.expoConfig as any).expo.extra.spoonacularApiKey;


// Define types for ingredients and pantry items
type IngredientResult = {
  id: number;
  name: string;
  image: string;
};

type PantryItem = {
  id: number;
  name: string;
  image: string;
  expirationDate?: string;
};

// Main Pantry component
const Pantry = () => {
  // State hooks for managing user input, pantry, and theme
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<IngredientResult[]>([]);
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [expirationInputs, setExpirationInputs] = useState<{ [key: number]: string }>({});

  // Set theme based on user preference or system setting
  const deviceScheme = useColorScheme();
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const styles = createStyles(isDarkMode);
  const router = useRouter();

  // On component mount: load theme, check auth, fetch pantry items
  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
    checkAuth(router);
    fetchPantryItems();
  }, []);

  // Fetch pantry items from backend API
  const fetchPantryItems = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/routes/api/pantry`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: PantryItem[] = await response.json();
      if (response.ok) {
        setPantryItems(data);

        // Pre-fill expiration date inputs if available
        const newInputs: { [key: number]: string } = {};


        if (Array.isArray(data)) {
          data.forEach((item) => {
            if (item.expirationDate) {
              newInputs[item.id] = item.expirationDate.split("T")[0]; // Format date
            }
          });
        } else {
          console.error("Unexpected data format:", data);
        }

        setExpirationInputs(newInputs);
      } else {
        console.error("Error fetching pantry items:", data);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  // Fetch ingredient search results from Spoonacular API
  const fetchIngredients = async () => {
    try {
      if (!searchText.trim()) return;

      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(searchText)}&number=5&apiKey=${spoonacularApiKey}`
      );

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("❌ Error fetching ingredients:", error);
    }
  };

  // Add an ingredient to the pantry
  const handleAddToPantry = async (ingredient: IngredientResult) => {
    // Check if item already exists in the pantry
    const alreadyExists = pantryItems.some((item) => item.id === ingredient.id);
    if (alreadyExists) {
      console.warn("Item already exists in pantry");
      return; // Skip adding if duplicate
    }

    try {
      const token = await getToken();
      const newItem = { id: ingredient.id, name: ingredient.name, image: ingredient.image };

      const response = await fetch(`${API_BASE}/routes/api/pantry`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item: newItem }),
      });

      const data = await response.json();

      if (response.ok) {
        setSearchText(""); // Clear search bar
        setSearchResults([]); // Clear search results
        fetchPantryItems(); // Refresh pantry list
      } else {
        console.error("Data error: ", data);
      }
    } catch (error) {
      console.error("❌ Error adding to pantry:", error);
    }
  };

  // Remove an item from the pantry
  const handleRemoveFromPantry = async (id: number) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/routes/api/pantry`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemId: id }),
      });

      const data = await response.json();
      if (response.ok) {
        setPantryItems((prev) => prev.filter((item) => item.id !== id)); // Remove locally
      } else {
        console.error("Server error:", data.message);
      }
    } catch (error) {
      console.error("❌ Error deleting pantry item:", error);
    }
  };

  // Update expiration date for a pantry item
  const handleUpdateExpiration = async (itemId: number) => {
    const expirationDate = expirationInputs[itemId];
    if (!expirationDate) return;

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/routes/api/pantry/expiration`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ itemId, expirationDate }),
      });

      const data = await response.json();
      if (response.ok) {
        fetchPantryItems(); // Refresh pantry list
      } else {
        console.error("Error updating expiration date:", data.message);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  // Render the UI
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Page Title */}
        <Text style={styles.header}>Pantry</Text>
        <Text style={styles.caption}>Search and add ingredients to your pantry</Text>

        {/* Ingredient Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search for ingredients..."
          placeholderTextColor={isDarkMode ? "#721121" : "#FFCF99"}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={fetchIngredients}
        />

        {/* Display Ingredient Search Results */}
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleAddToPantry(item)} style={styles.resultItem}>
              <Image source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` }} style={styles.ingredientImage} />
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Section for User's Pantry */}
        <Text style={styles.caption}>Your Pantry</Text>
        <FlatList
          data={pantryItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Image source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` }} style={styles.ingredientImage} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.itemName}>{item.name}</Text>

                {/* Expiration Date Input */}
                <TextInput
                  style={styles.expirationInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={isDarkMode ? "#ccc" : "#555"}
                  value={expirationInputs[item.id] || ""}
                  onChangeText={(text) =>
                    setExpirationInputs((prev) => ({ ...prev, [item.id]: text }))
                  }
                />

                {/* Save Expiration Date Button */}
                <TouchableOpacity style={styles.saveButton} onPress={() => handleUpdateExpiration(item.id)}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>

              {/* Delete Pantry Item Button */}
              <TouchableOpacity onPress={() => handleRemoveFromPantry(item.id)} style={styles.removeButton}>
                <Image
                  source={
                    isDarkMode
                      ? require("../assets/icons/cancel_dark.png")
                      : require("../assets/icons/cancel_light.png")
                  }
                  style={styles.cancelIcon}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="pantry" isDarkMode={isDarkMode} />
    </View>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: { flex: 1, paddingTop: 20, backgroundColor: isDarkMode ? "#000000" : "#ffffff" },
    contentContainer: { flex: 1, padding: 20 },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    caption: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    searchInput: {
      height: 50,
      borderColor: isDarkMode ? "#721121" : "#FFCF999A",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 20,
      color: isDarkMode ? "#721121" : "#FFCF999A",
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
    },
    resultItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: isDarkMode ? "#FFCF99" : "#721121",
    },
    itemName: {
      marginLeft: 15,
      fontSize: 16,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    ingredientImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
    },
    removeButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    cancelIcon: {
      width: 24,
      height: 24,
    },
    expirationInput: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 5,
      marginTop: 5,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    saveButton: {
      backgroundColor: isDarkMode ? "#721121" : "#FFCF99",
      borderRadius: 5,
      padding: 6,
      marginTop: 5,
      alignSelf: "flex-start",
    },
    saveButtonText: {
      color: isDarkMode ? "#FFCF99" : "#721121",
      fontSize: 14,
    },
  });

export default Pantry;