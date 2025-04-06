import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, TouchableOpacity, useColorScheme, View, Linking } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

//these are here so the props have a type
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

function RecipeDisplay(props: RecipeDisplayProps){ 
    const colorScheme = useColorScheme(); // Handling color scheme
    const isDarkMode = colorScheme === 'dark'; // Checks if dark mode
    const styles = createStyles(isDarkMode); // Changes based on system color scheme
    const [recipeDetails, setRecipeDetails] = useState<any[]>([]); // Store recipe details fetched from second API

    // Function get URL + recipe deets by passing to second api
    const fetchRecipeDetails = async (id: number) => {
      try {
        const response = await fetch('https://api.spoonacular.com/recipes/'+ id +'/information?includeNutrition=false&apiKey=9c396355ebfb4dd08de141e25dd55182');
        const data = await response.json();
        if (response.ok){
          setRecipeDetails(recipeDetails)
        //   console.log('URLS successful:', data);
          return data;
        } else {
            console.error('failed:', data);
        }
      }catch (error){
        console.error('Error:', error);
      }
    };

    //using useEffect to pass in the IDs to call on the second API
    useEffect(() => {
        const fetchAllRecipes = async () => {
          try {
            //calling on the function with each ID
            const fetchedDetails = await Promise.all(
              props.recipes.map(async (recipe) => {
                const details = await fetchRecipeDetails(recipe.id);
                return {...recipe, details };
              })
            );
            setRecipeDetails(fetchedDetails);
          } catch (error) {
            console.error('Error:', error);
          }
        };
        fetchAllRecipes();
        console.log('URLS successful:', recipeDetails);
    }, [props.recipes]);


    //if you want to TEST, PASTE EXAMPLE CODE FROM THE BOTTOM HERE

    //this actually renders the frontend to display each recipe
    //need help making this pretty
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

    return (
        <div>
          <ul>{listItems}</ul>
        </div>
    );
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



    //   // Simulate the fetching process with an example recipe
    // useEffect(() => {
    //     const exampleRecipe: Recipe = {
    //     id: 1,
    //     title: "Spaghetti Bolognese",
    //     details: {
    //         sourceUrl: "https://www.example.com/spaghetti-bolognese-recipe",
    //         summary: "great recipe 100/100 would eat every day yo",
    //         servings: 2,
    //         readyInMinutes: 5,
    //     },
    //     };

    //     // Directly set the recipe details
    //     setRecipeDetails([exampleRecipe]);
    // }, []);