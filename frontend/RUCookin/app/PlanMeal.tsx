import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getToken } from "../utils/authChecker";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "../components/BottomNavBar";
import { useRouter } from "expo-router";

type PantryItem = {
  id: number;
  name: string;
};

type Recipe = {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  missingCost?: number;
};

const PlanMeal = () => {
  const [budget, setBudget] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);

  const deviceScheme = useColorScheme();
  const isDarkMode = deviceScheme === "dark";
  const styles = createStyles(isDarkMode);
  const router = useRouter();

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPantryItems(data);
      } else {
        console.error("Failed to fetch pantry:", data);
      }
    } catch (error) {
      console.error("❌ Pantry fetch error:", error);
    }
  };

  const fetchRecipes = async () => {
    if (!budget.trim()) return;
  
    try {
      const budgetCents = parseFloat(budget) * 100; // Spoonacular uses cents
      const ingredientNames = pantryItems.map((item) => item.name).join(",");
  
      const baseResponse = await fetch(
        `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
          ingredientNames
        )}&number=10&apiKey=c11a17bfe0a94b5a95c3f70ddbf663af`
      );
  
      const baseData: Recipe[] = await baseResponse.json();
      const filteredRecipes: Recipe[] = [];
  
      for (const recipe of baseData) {
        const priceResponse = await fetch(
          `https://api.spoonacular.com/recipes/${recipe.id}/priceBreakdownWidget.json?apiKey=c11a17bfe0a94b5a95c3f70ddbf663af`
        );
        const priceData = await priceResponse.json();
  
        const pantryNames = pantryItems.map((item) =>
          item.name.toLowerCase().replace(/[^a-z]/g, "")
        );
  
        const missingCost = priceData.ingredients
          .filter((ing: any) => {
            const cleanName = ing.name.toLowerCase().replace(/[^a-z]/g, "");
            return !pantryNames.includes(cleanName);
          })
          .reduce((sum: number, ing: any) => sum + ing.price, 0);
  
          if (missingCost <= budgetCents) {
            filteredRecipes.push({
              ...recipe,
              missingCost: parseFloat((missingCost / 100).toFixed(2)),
            });
          }
          
      }
  
      setRecipes(filteredRecipes);
    } catch (error) {
      console.error("❌ Error fetching recipes with price filter:", error);
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.header}>Plan a Meal</Text>
        <Text style={styles.caption}>Enter your budget and we'll find recipes!</Text>

        <TextInput
          style={styles.budgetInput}
          placeholder="Enter max budget in $"
          placeholderTextColor={isDarkMode ? "#888" : "#555"}
          keyboardType="numeric"
          value={budget}
          onChangeText={setBudget}
          onSubmitEditing={fetchRecipes}
        />

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
                <Image source={{ uri: item.image }} style={styles.recipeImage} />
                <View style={styles.recipeText}>
                  <Text style={styles.recipeTitle}>{item.title}</Text>
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
      <BottomNavBar activeTab="home" isDarkMode={isDarkMode} />
    </KeyboardAvoidingView>
  );
};

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
    },
    contentContainer: {
      flex: 1,
      padding: 20,
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