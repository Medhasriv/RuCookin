import React, { useEffect, useState } from "react";
import {View,Text,TextInput,TouchableOpacity,ScrollView,StyleSheet,Platform,useColorScheme} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { checkAuth, checkAdmin } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";
import { LogBox } from "react-native";
import { useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

LogBox.ignoreLogs([
  "VirtualizedLists should never be nested inside plain ScrollViews"
]);


const AdminCreateRecipe = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === "dark";
  const styles = createStyles(isDarkMode, insets.top);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [readyInMin, setReadyInMin] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState("");
  useEffect(() => {
    checkAuth(router);
    checkAdmin(router);
  }, []);


  const handleSubmit = async () => {
    if (!title.trim() || !instructions.trim() || !ingredients.trim()) {
      return alert("Please fill in Title, Instructions, and Ingredients."); 
    }


    const payload = {
      title: title.trim(),
      summary: summary.trim(),
      readyInMin: readyInMin ? parseInt(readyInMin, 10) : undefined,
      instructions: instructions.trim(),
      ingredients: ingredients.split(",").map((i) => i.trim())
    };

    try {
      const res = await fetch(
        `${API_BASE}/routes/api/adminCreateRecipe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (res.ok) {
        router.push({
          pathname: "/adminCreateRecipeCuisine",
          params: { recipeTitle: title.trim() }
        });
      } else {
        alert(data.message || "Failed to create recipe.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Check console for details.");
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Create New Recipe</Text>

          <TextInput
            style={styles.input}
            placeholder="Title *"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.input}
            placeholder="Summary"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={summary}
            onChangeText={setSummary}
          />

          <TextInput
            style={styles.input}
            placeholder="Ready In Minutes"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={readyInMin}
            onChangeText={setReadyInMin}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.textArea}
            placeholder="Instructions *"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={instructions}
            onChangeText={setInstructions}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Ingredients (comma-separated) *"
            placeholderTextColor={isDarkMode ? "#777" : "#999"}
            value={ingredients}
            onChangeText={setIngredients}
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Continue Making the Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <AdminBottomNavBar activeTab="new_recipe" isDarkMode={isDarkMode} />
    </View>
  );
};

const createStyles = (isDarkMode: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
      paddingTop: Platform.OS === "android" ? topInset : 0,
    },
    inner: { flex: 1 },
    content: {
      padding: 20,
      paddingBottom: 100, // leave space for nav bar
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 24,
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      color: isDarkMode ? "#fff" : "#000",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    textArea: {
      height: 100,
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      color: isDarkMode ? "#fff" : "#000",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      textAlignVertical: "top",
    },
    button: {
      backgroundColor: isDarkMode ? "#721121" : "#ffc074",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
      marginBottom: 16,
    },
    buttonText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default AdminCreateRecipe;
