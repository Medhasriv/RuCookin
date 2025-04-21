import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useColorScheme } from "react-native";

const RecipeDetail = () => {
  const { id, title, image } = useLocalSearchParams();
  const [recipeDetails, setRecipeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const imageStr = Array.isArray(image) ? image[0] : image;
  const titleStr = Array.isArray(title) ? title[0] : title;
  
  useEffect(() => {
    const fetchRecipeInfo = async () => {
      try {
        const res = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=c11a17bfe0a94b5a95c3f70ddbf663af`
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
