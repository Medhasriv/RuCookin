import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View, Linking } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as dotenv from 'dotenv';

// Define prop types for clarity
interface RecipeDetails {
  sourceUrl: string;
  summary: string;
  servings: number;
  readyInMinutes: number;
}
interface Recipe {
  id: number;
  title: string;
  details?: RecipeDetails;
}
interface RecipeDisplayProps {
  recipes: Recipe[];
}

function RecipeDisplay(props: RecipeDisplayProps) {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const effectiveTheme = userTheme ? userTheme : systemColorScheme;
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createStyles(isDarkMode);
  const [recipeDetails, setRecipeDetails] = useState<any[]>([]);

  // Retrieve user theme from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
  }, []);

  // Function to fetch details for a recipe by ID
  const fetchRecipeDetails = async (id: number) => {
    try {
      const response = await fetch(
        'https://api.spoonacular.com/recipes/' 
        + id +
        '/information?includeNutrition=false&apiKey='
      );
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        console.error('failed:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    const fetchAllRecipes = async () => {
      try {
        const fetchedDetails = await Promise.all(
          props.recipes.map(async (recipe) => {
            const details = await fetchRecipeDetails(recipe.id);
            return { ...recipe, details };
          })
        );
        setRecipeDetails(fetchedDetails);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchAllRecipes();
  }, [props.recipes]);

  const listItems = recipeDetails.map((recipe) => (
    <View key={recipe.id} style={styles.recipeContainer}>
      {recipe.details ? (
        <TouchableOpacity onPress={() => Linking.openURL(recipe.details.sourceUrl)}>
          <View style={styles.innerContainer}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDesc}>{((recipe.details.summary).replace(/<\/?[^>]+(>|$)/g, ""))}</Text>
            <Text style={styles.recipeDesc}>Servings: {recipe.details.servings}</Text>
            <Text style={styles.recipeDesc}>Time: {recipe.details.readyInMinutes}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <Text style={styles.recipeDesc}>No details available</Text>
      )}
    </View>
  ));

  return <View>{listItems}</View>;
}

function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    recipeContainer: {
      flexDirection: 'column',
      borderRadius: 10,
      paddingHorizontal: 5,
      borderColor: '#FFCF99',
      width: "100%",
      minHeight: 150,
      marginBottom: 10,
      backgroundColor: isDarkMode ? '#1c1c1c' : '#721121',
      overflow: 'hidden',
    },
    innerContainer: {
      flex: 1,
      padding: 5,
    },
    recipeTitle: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 25,
      padding: 10,
      color: isDarkMode ? '#FFCF99' : '#FFCF99',
    },
    recipeDesc: {
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      padding: 5,
      paddingLeft: 10,
      color: isDarkMode ? '#FFCF99' : '#FFCF99',
      flexWrap: 'wrap',
    },
  });
}

export default RecipeDisplay;
