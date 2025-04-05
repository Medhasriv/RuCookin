import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { checkAuth,getTokenData } from "../utils/authChecker"; 

const DIET_TYPES = [
  'Gluten Free',
  'Ketogenic',
  'Vegetarian',
  'Lacto-Vegetarian',
  'Ovo-Vegetarian',
  'Vegan',
  'Pescetarian',
  'Paleo',
  'Primal',
  'Low FODMAP',
  'Whole30'
];

const DietPreferences = () => {
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  const router = useRouter();

    useEffect(() => {
      checkAuth(router);
  }, []);

  const toggleDietSelection = (diet: string) => {
    setSelectedDiets((prevSelected) =>
      prevSelected.includes(diet)
        ? prevSelected.filter((item) => item !== diet)
        : [...prevSelected, diet]
    );
  };

  const handleContinue = async() => {
    console.log('Selected Diets:', selectedDiets);
    try {
          const username = await getTokenData("username");
          if (!username) {
            console.error("Username not found in token.");
            return;
          }
          const payload = { username: username.trim(),
            diet:Array.isArray(selectedDiets) ? [...selectedDiets] : [],
          };
          console.log("🚀 Sending payload:", JSON.stringify(payload));
          const response = await fetch("http://localhost:3001/routes/api/diet", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username.trim(),
              diet:Array.isArray(selectedDiets) ? [...selectedDiets] : [] }), 
          });
          const data = await response.json();
      if(response.ok) {
        router.push('/Intolerances');
      }
      else {
        console.error('Data error: ', data)
      }
    }
    catch (error) {
      console.error('❌ Error during Diet:', error);
    }
   
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headingText}>Select your diet preferences</Text>

      <FlatList
        data={DIET_TYPES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dietItem,
              selectedDiets.includes(item) && styles.selectedDietItem,
            ]}
            onPress={() => toggleDietSelection(item)}
          >
            <Text
              style={[
                styles.dietText,
                selectedDiets.includes(item) && styles.selectedDietText,
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
    dietItem: {
      padding: 15,
      marginVertical: 5,
      marginHorizontal: 20,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#FFCF99' : '#721121',
    },
    selectedDietItem: {
      backgroundColor: isDarkMode ? '#FFC074' : '#A5402D',
    },
    dietText: {
      fontFamily: 'Inter-Regular',
      fontSize: 18,
      color: isDarkMode ? '#721121' : '#FFCF99',
    },
    selectedDietText: {
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

export default DietPreferences;
