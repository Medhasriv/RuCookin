import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View, Linking } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  const [recipeDetails, setRecipeDetails] = useState<any[]>([]);

  // Function to fetch details for a recipe by ID
  const fetchRecipeDetails = async (id: number) => {
    try {
      const response = await fetch(
        'https://api.spoonacular.com/recipes/' + id + '/information?includeNutrition=false&apiKey=9c396355ebfb4dd08de141e25dd55182'
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
    console.log('Fetched recipes:', recipeDetails);
  }, [props.recipes]);

  const listItems = recipeDetails.map((recipe) => (
    <SafeAreaView key={recipe.id} style={styles.recipeContainer}>
      {recipe.details ? (
        <TouchableOpacity onPress={() => Linking.openURL(recipe.details.sourceUrl)}>
          <View style={styles.recipeContainer}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDesc}>{recipe.details.summary}</Text>
            <Text style={styles.recipeDesc}>Servings: {recipe.details.servings}</Text>
            <Text style={styles.recipeDesc}>Time: {recipe.details.readyInMinutes}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <Text>No details available</Text>
      )}
    </SafeAreaView>
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
      width: 1200,
      height: 150,
      backgroundColor: isDarkMode ? 'white' : '#FFCF99',
      marginBottom: 10,
    },
    recipeTitle: {
      padding: 10,
      fontFamily: 'Inter-SemiBold',
      fontSize: 25,
      color: isDarkMode ? '#721121' : '#FFCF99',
    },
    recipeDesc: {
      padding: 5,
      paddingLeft: 10,
      fontFamily: 'Inter-Regular',
      fontSize: 15,
      color: isDarkMode ? '#721121' : '#FFCF99',
    },
  });
}

export default RecipeDisplay;
