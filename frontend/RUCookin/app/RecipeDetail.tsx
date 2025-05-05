// app/Profile.tsx
/**
 * @summary: RecipeDetail.tsx
 * 
 * This page serves as the template for the recipe page. It displays the recipe's image, title, summary (time to make + servings), ingredients, and instructions.
 * 
 * @requirement: R004 - Recipe Search: The system shall provide a recipe search screen that allows users to look up recipes based on available ingredients, cuisine type, and dietary restrictions.
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * 
 * @author: Team SWEG
 * @returns: The template page for recipes. 
 */

import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useColorScheme } from "react-native";
import Constants from 'expo-constants';
// Connect to the Spoonacular API
const spoonacularApiKey = Constants.manifest?.extra?.spoonacularApiKey ?? (Constants.expoConfig as any).expo.extra.spoonacularApiKey;

const RecipeDetail = () => {
  const { id, title, image } = useLocalSearchParams();
  const [recipeDetails, setRecipeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // info for the users color scheme and other info
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const imageStr = Array.isArray(image) ? image[0] : image;
  const titleStr = Array.isArray(title) ? title[0] : title;

  //getting the info for each recipe by using the "id"  
  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${spoonacularApiKey}`
        );
        const data = await res.json();
        setRecipeDetails(data);
      } catch (err) {
        console.error("Error fetching recipe details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRecipeInfo();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
        <ActivityIndicator size="large" color={isDark ? "#FFCF99" : "#721121"} />
      </View>
    );
  }

  if (!recipeDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load recipe details.</Text>
      </View>
    );
  }

  // creating a component which has the recipe
  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? "#000" : "#fff" }]}>
      <Image source={{ uri: imageStr }} style={styles.image} />
      <Text style={[styles.title, { color: isDark ? "#FFCF99" : "#721121" }]}>{titleStr}</Text>

      <Text style={[styles.sectionTitle, { color: isDark ? "#FFCF99" : "#721121" }]}>Summary</Text>
      <Text style={[styles.summary, { color: isDark ? "#ccc" : "#444" }]}>
        {recipeDetails.summary.replace(/<[^>]+>/g, "")}
      </Text>
      <Text style={[styles.sectionTitle, { color: isDark ? "#FFCF99" : "#721121" }]}>Ingredients</Text>
      {recipeDetails.extendedIngredients.map((ing: any, index: number) => (
        <Text key={index} style={[styles.summary, { color: isDark ? "#ccc" : "#444" }]}>
          • {ing.original}
        </Text>
      ))}

      <Text style={[styles.sectionTitle, { color: isDark ? "#FFCF99" : "#721121" }]}>Instructions</Text>
      <Text style={[styles.instructions, { color: isDark ? "#ccc" : "#444" }]}>
        {recipeDetails.instructions
          ? recipeDetails.instructions.replace(/<[^>]+>/g, "")
          : "No instructions available."}
      </Text>
    </ScrollView>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  summary: {
    fontSize: 16,
    lineHeight: 22,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
    color: "red",
  },
});

export default RecipeDetail;