// app/CuisineLikes.tsx
/**
 * @summary: CuisineLikes.tsx
 * This is the screen where users can select what cuisines they like.
 * For example, if Mario likes Italian food, he can select it here.
 * This file is part of the set of screens that are only accessible when a user is creating their account.
 * 
 * @requirement: U001 - Account Creation: The system shall allow users to create an account with their first and last name, username, password, and email.
 * @requirement: U003 - User Preference: The system shall allow users to edit information such as cuisine likes, dislikes, diet-types, and intolerances.
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Cuisine Likes page, which is a screen where users can select the cuisines that they like.
 */
// Import React libraries and necessary React Native components
import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';

// Import authentication-related utilities
import { checkAuth, getTokenData } from "../utils/authChecker";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run. This is part of requirement U018 - Database Connectivity w/ Google Cloud Run.
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// Define static list of available cuisine types
const CUISINE_TYPES = [
  'African', 'Asian', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese',
  'Eastern European', 'European', 'French', 'German', 'Greek', 'Indian', 'Irish',
  'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American', 'Mediterranean',
  'Mexican', 'Middle Eastern', 'Nordic', 'Southern', 'Spanish', 'Thai', 'Vietnamese'
];

// Main component for selecting liked cuisines
const CuisineLikes = () => {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]); // State to track selected cuisines
  const colorScheme = useColorScheme(); // Detect device color scheme (dark/light)
  const [userId, setUserId] = useState<string | null>(null); // User ID (currently unused)
  const isDarkMode = colorScheme === 'dark'; // Boolean for dark mode
  const styles = createStyles(isDarkMode); // Dynamic styles based on theme
  const router = useRouter(); // Navigation router

  // Check user authentication on component mount
  useEffect(() => {
    checkAuth(router);
  }, []);

  // Toggle selection or deselection of a cuisine item
  const toggle = (cuisine: string) => {
    setSelectedCuisines((prevSelected) =>
      prevSelected.includes(cuisine)
        ? prevSelected.filter((item) => item !== cuisine) // Remove if already selected
        : [...prevSelected, cuisine] // Add if not selected
    );
  };

  // Handle "Continue" button press
  const handleContinue = async () => {
    console.log('Selected Cuisines:', selectedCuisines);

    try {
      const username = await getTokenData("username"); // Get username from JWT token
      if (!username) {
        console.error("Username not found in token.");
        return;
      }

      // Prepare payload to send
      const payload = {
        username: username.trim(),
        cuisineLike: Array.isArray(selectedCuisines) ? [...selectedCuisines] : [],
      };
      console.log("🚀 Sending payload:", JSON.stringify(payload));

      // Send POST request to server to save liked cuisines
      const response = await fetch(`${API_BASE}/routes/api/cuisineLike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to next page (Cuisine Dislikes page) on success
        router.push('/CuisineDislikes');
      } else {
        console.error('Data error: ', data);
      }
    } catch (error) {
      console.error('❌ Error during Cuisine Likes:', error);
    }
  };

  // Render component
  return (
    <SafeAreaView style={styles.container}>
      {/* Heading text */}
      <Text style={styles.heading}>
        Let’s get to know you. Select all the cuisines you like
      </Text>

      {/* Body section with grid layout */}
      <View style={styles.body}>
        {/* FlatList for displaying cuisines as selectable pills */}
        <FlatList
          data={CUISINE_TYPES}
          numColumns={3} // Display items in 3 columns
          keyExtractor={(item) => item}
          columnWrapperStyle={styles.row} // Style for each row
          contentContainerStyle={styles.listContent} // Style for entire list
          renderItem={({ item }) => {
            const selected = selectedCuisines.includes(item); // Check if item is selected
            return (
              <TouchableOpacity
                style={[styles.pill, selected && styles.pillSelected]}
                onPress={() => toggle(item)} // Toggle selection on press
              >
                <Text style={[styles.pillText, selected && styles.pillTextSel]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Continue button fixed near bottom */}
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
      backgroundColor: dark ? "#721121" : "#FFCF99",
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
      justifyContent: "space-evenly", // Evenly space items in row
    },
    pill: {
      flex: 1,
      flexBasis: "30%", // Each pill takes 30% width
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
      fontWeight: "600", // Bolder font for selected pills
    },
    continue: {
      marginHorizontal: 20,
      marginBottom: 24, // Leaves space for device home indicator (iPhone, etc.)
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

// Export the CuisineLikes component as default
export default CuisineLikes;