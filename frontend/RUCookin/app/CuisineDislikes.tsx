// Import necessary React and React Native components
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
} from "react-native";
import { useColorScheme } from "react-native"; // For detecting dark/light theme
import { useRouter } from "expo-router"; // For navigation
import { checkAuth, getTokenData } from "../utils/authChecker"; // Custom auth utilities
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// List of available cuisine types
const CUISINE_TYPES = [
  "African", "Asian", "American", "British", "Cajun", "Caribbean",
  "Chinese", "Eastern European", "European", "French", "German", "Greek",
  "Indian", "Irish", "Italian", "Japanese", "Jewish", "Korean",
  "Latin American", "Mediterranean", "Mexican", "Middle Eastern", "Nordic",
  "Southern", "Spanish", "Thai", "Vietnamese",
];

// Main component for selecting disliked cuisines
export default function CuisineDislikes() {
  const [disliked, setDisliked] = useState<string[]>([]); // State to store selected dislikes
  const dark = useColorScheme() === "dark"; // Determine if device is in dark mode
  const styles = createStyles(dark); // Generate theme-specific styles
  const router = useRouter(); // Router instance for page navigation

  // Check user authentication when component mounts
  useEffect(() => {
    checkAuth(router);
  }, []);

  // Toggle cuisine selection (add or remove from disliked list)
  const toggle = (c: string) =>
    setDisliked((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );

  // Handle "Continue" button press: submit disliked cuisines to server
  const handleContinue = async () => {
    try {
      const username = await getTokenData("username"); // Get username from stored token
      if (!username) return; // Exit if no username found

      const payload = { username: username.trim(), cuisineDislike: disliked };
      
      // Send POST request to save disliked cuisines
      const res = await fetch(`${API_BASE}/routes/api/cuisineDislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // If successful, navigate to "Diets" screen
      if (res.ok) router.push("/Diets");
      else console.error(await res.json());
    } catch (e) {
      console.error("Cuisine Dislike error:", e);
    }
  };

  /* ------------ UI ----------------------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      {/* Heading */}
      <Text style={styles.heading}>Select cuisines you dislike</Text>

      {/* Main body containing selectable cuisine items */}
      <View style={styles.body}>
        <FlatList
          data={CUISINE_TYPES}
          numColumns={3} // Display in 3 columns
          keyExtractor={(item) => item}
          columnWrapperStyle={styles.row} // Row styling
          contentContainerStyle={styles.listContent} // List container styling
          renderItem={({ item }) => {
            const selected = disliked.includes(item); // Check if item is selected
            return (
              <TouchableOpacity
                style={[styles.pill, selected && styles.pillSelected]} // Apply selected style
                onPress={() => toggle(item)}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSel]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Continue button fixed near the bottom */}
      <TouchableOpacity style={styles.continue} onPress={handleContinue}>
        <Text style={styles.continueTxt}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ----------------- STYLES --------------------------------------------- */

// Generate styles dynamically based on dark/light theme
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
    /* Centre the list vertically */
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
      justifyContent: "space-evenly" 
    },
    pill: {
      flex: 1,
      flexBasis: "30%", // Take up roughly 1/3 of the row width
      margin: 8,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: dark ? "#FFCF99" : "#721121",
      alignItems: "center",
    },
    pillSelected: {
      backgroundColor: dark ? "#FFC074" : "#A5402D",
    },
    pillText: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      color: dark ? "#721121" : "#FFCF99",
      textAlign: "center",
    },
    pillTextSel: { 
      fontWeight: "600" // Bold text for selected pill
    },
    continue: {
      marginHorizontal: 20,
      marginBottom: 24, /* leaves space for the device home indicator */
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
