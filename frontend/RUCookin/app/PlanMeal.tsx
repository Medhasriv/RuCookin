import { useRouter } from "expo-router";
import { View, Text, TextInput, FlatList, StyleSheet, useColorScheme, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { checkAuth, getToken } from "../utils/authChecker";

type Ingredient = {
  name: string;
  price: number;
};

type Recipe = {
  id: string;
  title: string;
  image: string;
  ingredients: Ingredient[];
  totalCost?: number;
};

type PantryItem = {
  _id: string;
  itemName: string;
};

const PlanMeal = () => {
  const [budget, setBudget] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const deviceScheme = useColorScheme();
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createStyles(isDarkMode);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
    checkAuth(router);
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPantryItems(data);
      } else {
        console.error("❌ Failed to load pantry items:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching pantry:", error);
    }
  };

  const fetchBudgetRecipes = async () => {
    const exampleRecipes: Recipe[] = [
      {
        id: '1',
        title: 'Spaghetti & Meatballs',
        image: 'https://spoonacular.com/recipeImages/715538-312x231.jpg',
        ingredients: [
          { name: 'spaghetti', price: 2 },
          { name: 'meatballs', price: 4 },
          { name: 'tomato sauce', price: 2.75 },
        ],
      },
      {
        id: '2',
        title: 'Tacos',
        image: 'https://spoonacular.com/recipeImages/716627-312x231.jpg',
        ingredients: [
          { name: 'tortillas', price: 2 },
          { name: 'ground beef', price: 3 },
          { name: 'cheese', price: 1.5 },
        ],
      },
      {
        id: '3',
        title: 'Fried Rice',
        image: 'https://spoonacular.com/recipeImages/715495-312x231.jpg',
        ingredients: [
          { name: 'rice', price: 1 },
          { name: 'eggs', price: 1 },
          { name: 'soy sauce', price: 1 },
        ],
      },
    ];

    const pantryNames = pantryItems.map(item => item.itemName.toLowerCase());

    const filtered = exampleRecipes
      .map(recipe => {
        const missingIngredients = recipe.ingredients.filter(
          ing => !pantryNames.includes(ing.name.toLowerCase())
        );
        const totalCost = missingIngredients.reduce((sum, ing) => sum + ing.price, 0);
        return { ...recipe, totalCost };
      })
      .filter(recipe => recipe.totalCost <= parseFloat(budget));

    setRecipes(filtered);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.header}>Plan a Meal</Text>
        <Text style={styles.caption}>Enter your budget and we’ll check your pantry too</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Enter your budget (e.g., 15)"
          keyboardType="numeric"
          placeholderTextColor={isDarkMode ? '#721121' : '#FFCF99'}
          value={budget}
          onChangeText={setBudget}
          onSubmitEditing={fetchBudgetRecipes}
        />

        <TouchableOpacity style={styles.addToCartButton} onPress={fetchBudgetRecipes}>
          <Text style={styles.addToCartButtonText}>Find Recipes</Text>
        </TouchableOpacity>

        <FlatList
          style={styles.flatListContainer}
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <Image source={{ uri: item.image }} style={styles.recipeImage} />
              <View style={styles.recipeText}>
                <Text style={styles.itemName}>{item.title}</Text>
                <Text style={styles.subText}>Est. cost: ${item.totalCost?.toFixed(2)}</Text>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
      <BottomNavBar activeTab="home" isDarkMode={isDarkMode} />
    </View>
  );
};

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
      padding: 20,
    },
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
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    flatListContainer: {
      flex: 1,
      paddingHorizontal: 15,
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
    addToCartButton: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 20,
    },
    addToCartButtonText: {
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 18,
      fontWeight: "bold",
    },
    recipeCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#1c1c1c" : "#f9f9f9",
      borderRadius: 10,
      padding: 10,
      marginBottom: 15,
    },
    recipeImage: {
      width: 80,
      height: 80,
      borderRadius: 10,
      marginRight: 15,
    },
    recipeText: {
      flex: 1,
    },
    itemName: {
      color: isDarkMode ? "#FFCF99" : "#721121",
      fontSize: 16,
      fontWeight: "600",
    },
    subText: {
      fontSize: 14,
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginTop: 4,
    },
  });

export default PlanMeal;
