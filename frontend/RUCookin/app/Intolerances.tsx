// app/Intolerances.tsx
/**
 * This is the screen where users can select what dietary intolerances they have. This includes allergies.
 * For example, Mario ihas Celiac disease, he would select Gluten on this screen.
 * This file is part of the set of screens that are only accessible when a user is creating their account.
 * 
 * @requirement: U001 - Account Creation: The system shall allow users to create an account with their first and last name, username, password, and email.
 * @requirement: U003 - User Preference: The system shall allow users to edit information such as cuisine likes, dislikes, diet-types, and intolerances.
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Intolerances page, which is a screen where users can select the ingredients they have intolerances for/ allergic to.
 */
// Import React libraries and necessary React Native components
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

// Import authentication checking utilities
import { checkAuth, getTokenData } from "../utils/authChecker";

// Define constant list of known food intolerances
const INTOLERANCES = [
  'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood',
  'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'
];

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// Main component for setting intolerance preferences
const IntolerancePreferences = () => {
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]); // State to track selected intolerances

  const colorScheme = useColorScheme(); // Detect device color scheme (light or dark)
  const isDarkMode = colorScheme === 'dark'; // Check if dark mode
  const styles = createStyles(isDarkMode); // Create styles dynamically based on theme

  const router = useRouter(); // Router for navigation

  // On component mount: check if the user is authenticated
  useEffect(() => {
    checkAuth(router);
  }, []);

  // Toggle selection/deselection of an intolerance
  const toggleIntoleranceSelection = (intolerance: string) => {
    setSelectedIntolerances((prevSelected) =>
      prevSelected.includes(intolerance)
        ? prevSelected.filter((item) => item !== intolerance) // Deselect if already selected
        : [...prevSelected, intolerance] // Otherwise add to selection
    );
  };

  // Handle when user presses "Continue" button
  const handleContinue = async () => {
    console.log('Selected Intolerances:', selectedIntolerances);
    try {
      const username = await getTokenData("username"); // Get username from token
      if (!username) {
        console.error("Username not found in token.");
        return;
      }
      // Prepare payload to send to server
      const payload = {
        username: username.trim(),
        intolerance: Array.isArray(selectedIntolerances) ? [...selectedIntolerances] : [],
      };
      console.log("🚀 Sending payload:", JSON.stringify(payload));

      // Send POST request to server
      const response = await fetch(`${API_BASE}/routes/api/intolerance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to HomePage on success
        router.push('/HomePage');
      }
      else {
        console.error('Data error: ', data);
      }
    }
    catch (error) {
      console.error('❌ Error during Intolerances:', error);
    }
  };

  // Component UI
  return (
    <SafeAreaView style={styles.container}>
      {/* Heading text */}
      <Text style={styles.heading}>Almost done. Select your food intolerances</Text>
      <View style={styles.body}>
        {/* Grid list of intolerance options */}
        <FlatList
          data={INTOLERANCES}
          numColumns={3} // Display 3 pills per row
          keyExtractor={(item) => item}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const selected = selectedIntolerances.includes(item); // Check if current item is selected
            return (
              <TouchableOpacity
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => toggleIntoleranceSelection(item)} // Toggle on press
              >
                <Text style={[styles.pillText, selected && styles.pillTextSel]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Continue button near the bottom */}
      <TouchableOpacity style={styles.continue} onPress={handleContinue}>
        <Text style={styles.continueTxt}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? "#721121" : "#FFCF99", // Background color depending on theme
      paddingTop: 10,
    },
    heading: {
      fontFamily: "Inter-SemiBold",
      fontSize: 24,
      textAlign: "center",
      color: dark ? "#FFF" : "#000",
      marginTop: 25,
      marginBottom: 4,
    },
    body: {
      flex: 1,
      justifyContent: "flex-start",
      marginTop: 50,
    },
    listContent: {
      flexGrow: 1,
      justifyContent: "flex-start",
    },
    row: {
      justifyContent: "space-evenly" // Even spacing between pills
    },
    pill: {
      flex: 1,
      flexBasis: "30%",
      margin: 8,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: dark ? "#FFCF99" : "#721121",
      alignItems: "center",
    },
    pillSelected: {
      backgroundColor: dark ? "#FFC074" : "#A5402D", // Highlight color when selected
    },
    pillText: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      color: dark ? "#721121" : "#FFCF99",
      textAlign: "center",
    },
    pillTextSel: {
      fontWeight: "600" // Bold text when selected
    },
    continue: {
      marginHorizontal: 20,
      marginBottom: 24, // Leaves space for home-indicator (on iOS)
      padding: 15,
      borderRadius: 8,
      backgroundColor: dark ? "#FFCF99" : "#721121",
    },
    continueTxt: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      color: dark ? "#721121" : "#FFFFFF",
      textAlign: "center",
    },
  });

// Export the component so it can be used in app navigation
export default IntolerancePreferences;