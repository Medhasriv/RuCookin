import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { checkAuth, getTokenData } from "./authChecker"; 

const CUISINE_TYPES = [
  'African',
  'Asian',
  'American',
  'British',
  'Cajun',
  'Caribbean',
  'Chinese',
  'Eastern European',
  'European',
  'French',
  'German',
  'Greek',
  'Indian',
  'Irish',
  'Italian',
  'Japanese',
  'Jewish',
  'Korean',
  'Latin American',
  'Mediterranean',
  'Mexican',
  'Middle Eastern',
  'Nordic',
  'Southern',
  'Spanish',
  'Thai',
  'Vietnamese'
];

const CuisineDislikes = () => {
  const [dislikedCuisines, setDislikedCuisines] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  const router = useRouter();

    useEffect(() => {
      checkAuth(router);
  }, []);


  const toggleCuisineSelection = (cuisine: string) => {
    setDislikedCuisines((prevSelected) =>
      prevSelected.includes(cuisine)
        ? prevSelected.filter((item) => item !== cuisine)
        : [...prevSelected, cuisine]
    );
  };

  const handleContinue = async () => {
    console.log('Disliked Cuisines:', dislikedCuisines);
 try {
      const username = await getTokenData("username");
    if (!username) {
      console.error("Username not found in token.");
      return;
    }
    const payload = { 
      username: username.trim(),
      cuisineDislike: Array.isArray(dislikedCuisines) ? [...dislikedCuisines] : [], 
    };
    console.log("🚀 Sending payload:", JSON.stringify(payload));
      const response = await fetch("http://localhost:3001/routes/api/cuisineDislike", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.trim(),
          cuisineDislike: Array.isArray(dislikedCuisines) ? [...dislikedCuisines] : [] }), 
      });
      const data = await response.json();
      if(response.ok) {
        router.push('/Diets');
      }
      else {
        console.error('Data error: ', data)
      }
    }
    catch (error) {
      console.error('❌ Error during Cuisine Dislike:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headingText}>Select cuisines you dislike</Text>

      <FlatList
        data={CUISINE_TYPES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.cuisineItem,
              dislikedCuisines.includes(item) && styles.selectedCuisineItem,
            ]}
            onPress={() => toggleCuisineSelection(item)}
          >
            <Text
              style={[
                styles.cuisineText,
                dislikedCuisines.includes(item) && styles.selectedCuisineText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
    },
    headingText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 24,
      color: isDarkMode ? '#FFFFFF' : '#000000',
      textAlign: 'center',
      marginVertical: 20,
    },
    cuisineItem: {
      padding: 15,
      marginVertical: 5,
      marginHorizontal: 20,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#FFCF99' : '#721121',
    },
    selectedCuisineItem: {
      backgroundColor: isDarkMode ? '#FFC074' : '#A5402D',
    },
    cuisineText: {
      fontFamily: 'Inter-Regular',
      fontSize: 18,
      color: isDarkMode ? '#721121' : '#FFCF99',
    },
    selectedCuisineText: {
      color: isDarkMode ? '#721121' : '#FFCF99',
    },
    continueButton: {
      padding: 15,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#FFCF99' : '#721121',
      margin: 20, // Adds margin to keep it separate from the list items
      marginHorizontal: 20, // Ensures button is aligned with the list items
    },
    continueButtonText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      color: isDarkMode ? '#721121' : '#FFFFFF',
      textAlign: 'center',
    },
  });

export default CuisineDislikes;
