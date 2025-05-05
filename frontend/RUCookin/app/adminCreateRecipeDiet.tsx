// Import React and necessary React Native components
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "react-native"; // For detecting dark or light theme
import { useRouter } from "expo-router"; // Navigation helper
import { checkAuth, getTokenData, checkAdmin } from "../utils/authChecker"; // Custom auth utils
import { useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// List of available diet types
const DIET_TYPES = [
  "Gluten Free",
  "Ketogenic",
  "Vegetarian",
  "Lacto-Vegetarian",
  "Ovo-Vegetarian",
  "Vegan",
  "Pescetarian",
  "Paleo",
  "Primal",
  "Low FODMAP",
  "Whole30",
];

// Main functional component for Diet Preferences screen
export default function adminCreateRecipeDiet() {
  const [selected, setSelected] = useState<string[]>([]); // State to track selected diets
  const dark = useColorScheme() === "dark"; // Detect dark mode
  const styles = createStyles(dark); // Generate styles based on theme
  const router = useRouter(); // Router instance for page navigation
  const { recipeTitle } = useLocalSearchParams(); //pull recipe Title from previous page
  // Check authentication on component mount
  useEffect(() => {
    checkAuth(router);
    checkAdmin(router);
  }, []);

  // Toggle diet selection (add/remove from selected list)
  const toggle = (d: string) =>
    setSelected((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  // Handle pressing "Continue" button
  const handleContinue = async () => {
    console.log('Selected Diet:', selected);

    try {
      if (!recipeTitle) {
        console.error("Missing recipeTitle from previous screen.");
        return;
      }

      // Prepare payload to send
      const payload = { recipeTitle: String(recipeTitle).trim(), diets: selected };
      console.log("🚀 Sending payload:", JSON.stringify(payload));

      // Send POST request to server to save Diet
      const response = await fetch(`${API_BASE}/routes/api/adminDiet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to next page (Admin Home page) on success
        router.push('/adminHomePage');
      } else {
        console.error('Data error: ', data);
      }
    } catch (error) {
      console.error('❌ Error during adding Cuisine:', error);
    }
  };

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        {/* Title */}
        <Text style={styles.heading}>Select your diet preferences</Text>

        {/* Grid list of diet types */}
        <FlatList
          data={DIET_TYPES}
          numColumns={2} // Display in 2 columns
          keyExtractor={(item) => item}
          columnWrapperStyle={styles.row} // Style for each row
          contentContainerStyle={styles.listContent} // Flex grow to push button down
          renderItem={({ item }) => {
            const active = selected.includes(item); // Is item selected
            return (
              <TouchableOpacity
                style={[styles.pill, active && styles.pillSelected]} // Highlight if selected
                onPress={() => toggle(item)}
              >
                <Text style={[styles.pillText, active && styles.pillTextSel]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Continue button */}
        <TouchableOpacity style={styles.continue} onPress={handleContinue}>
          <Text style={styles.continueTxt}>Create Recipe</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? "#721121" : "#FFCF99", // Background color changes with theme
    },
    content: {
      flex: 1,
      padding: 20
    },
    heading: {
      fontFamily: "Inter-SemiBold",
      fontSize: 24,
      textAlign: "center",
      color: dark ? "#FFFFFF" : "#000000",
      marginBottom: 12,
    },
    /* Styling the grid list */
    listContent: {
      flexGrow: 1,
      justifyContent: "flex-start"
    },
    row: {
      justifyContent: "space-evenly"
    },

    /* Style for each pill */
    pill: {
      flexBasis: "30%", // Approximately 3 pills per row
      margin: 8,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: dark ? "#FFCF99" : "#721121",
      alignItems: "center",
    },
    pillSelected: {
      backgroundColor: dark ? "#FFC074" : "#A5402D", // Highlight selected pill
    },
    pillText: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      color: dark ? "#721121" : "#FFCF99",
      textAlign: "center",
    },
    pillTextSel: {
      fontWeight: "600" // Bolder font for selected item
    },

    /* Style for the continue button */
    continue: {
      marginTop: 20,
      marginHorizontal: 20,
      padding: 15,
      borderRadius: 8,
      backgroundColor: dark ? "#FFCF99" : "#721121",
    },
    continueTxt: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      textAlign: "center",
      color: dark ? "#721121" : "#FFFFFF",
    },
  });