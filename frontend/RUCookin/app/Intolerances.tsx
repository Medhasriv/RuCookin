import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { checkAuth, getTokenData } from "./authChecker"; 

const INTOLERANCES = [
  'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 
  'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'
];

const IntolerancePreferences = () => {
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  const router = useRouter();

    useEffect(() => {
      checkAuth(router);
  }, []);

  const toggleIntoleranceSelection = (intolerance: string) => {
    setSelectedIntolerances((prevSelected) =>
      prevSelected.includes(intolerance)
        ? prevSelected.filter((item) => item !== intolerance)
        : [...prevSelected, intolerance]
    );
  };

  const handleContinue = async () => {
    console.log('Selected Intolerances:', selectedIntolerances);
     try {
          const username = await getTokenData("username");
        if (!username) {
          console.error("Username not found in token.");
          return;
        }
        const payload = { username: username.trim(),
          intolerance:Array.isArray(selectedIntolerances) ? [...selectedIntolerances] : [],
        };
        console.log("🚀 Sending payload:", JSON.stringify(payload));
          const response = await fetch("http://localhost:3001/routes/api/intolerance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username.trim(),
              intolerance:Array.isArray(selectedIntolerances) ? [...selectedIntolerances] : [],
            }), 
          });
          const data = await response.json();
          if(response.ok) {
            router.push('/HomePage');
          }
          else {
            console.error('Data error: ', data)
          }
        }
        catch (error) {
          console.error('❌ Error during Intolerances:', error);
        }
    
    
        //console.log('Selected Cuisines:', selectedCuisines);
        
      };
    

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headingText}>Almost done! Select your food intolerances</Text>
      
      <FlatList
        data={INTOLERANCES}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.intoleranceItem,
              selectedIntolerances.includes(item) && styles.selectedIntoleranceItem,
            ]}
            onPress={() => toggleIntoleranceSelection(item)}
          >
            <Text
              style={[
                styles.intoleranceText,
                selectedIntolerances.includes(item) && styles.selectedIntoleranceText,
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
    intoleranceItem: {
      padding: 15,
      marginVertical: 5,
      marginHorizontal: 20,
      borderRadius: 8,
      backgroundColor: isDarkMode ? '#FFCF99' : '#721121',
    },
    selectedIntoleranceItem: {
      backgroundColor: isDarkMode ? '#FFC074' : '#A5402D',
    },
    intoleranceText: {
      fontFamily: 'Inter-Regular',
      fontSize: 18,
      color: isDarkMode ? '#721121' : '#FFCF99',
    },
    selectedIntoleranceText: {
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

export default IntolerancePreferences;
