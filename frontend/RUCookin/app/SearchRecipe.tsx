import { Link, useRouter } from "expo-router";
import {
  Platform,
  StyleSheet,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RadioButton, Checkbox } from "react-native-paper";
import BottomNavBar from "../components/BottomNavBar";
import { checkAuth, getToken, getTokenData } from "../utils/authChecker"; 
import * as dotenv from 'dotenv';
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;
// Connect to the Spoonacular API
const spoonacularApiKey = Constants.manifest?.extra?.spoonacularApiKey ?? (Constants.expoConfig as any).expo.extra.spoonacularApiKey;

const stripHtml = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const SearchRecipe = () => {
  const insets = useSafeAreaInsets();
  const deviceScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedIntolerance, setSelectedIntolerance] = useState<string[]>([]);
  const [searchRecipe, setSearchRecipe] = useState("");
  const [result, setResult] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<number[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [includePreferences, setincludePreferences] = useState(false);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
  }, []);
  /** Load favourite IDs once so we can draw filled / empty stars */
  useEffect(() => {
    (async () => {
      const username = await getTokenData("username");
      const token    = await getToken();
      if (!username || !token) return;
      try {
        const res  = await fetch(`${API_BASE}/routes/api/favoriteRecipe`,
          { method: "GET", headers: { Authorization:`Bearer ${token}`, Username:username }});
        const data = await res.json();
        if (res.ok) setFavourites(data);           // [12345, 9876, …]
      } catch (err) { console.error(err); }
    })();
  }, []);
  /** Toggle star */
const toggleFavourite = async (recipeId: number) => {
  const username = await getTokenData("username");
  const token    = await getToken();
  if (!username || !token) {
    console.log("❌ toggleFavourite: missing auth", { username, token });
    return;
  }

  const already = favourites.includes(recipeId);
  console.log(
    `⭐️ ${already ? "Removing" : "Adding"} favourite:`,
    recipeId,
    "for user",
    username
  );

  // optimistically update UI
  setFavourites((prev) =>
    already ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]
  );

  try {
    const res = await fetch(
      `${API_BASE}/routes/api/favoriteRecipe`,
      {
        method: already ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, recipeId }),
      }
    );
    const text = await res.text();  // capture whatever the server sent
    console.log(
      `✅ toggleFavourite response (${res.status}):`,
      text
    );
    if (!res.ok) {
      console.warn("⚠️ toggleFavourite reported error", res.status);
    }
  } catch (err) {
    console.error("❌ toggleFavourite network error:", err);
  }
};

  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const styles = createStyles(isDarkMode, insets.top);

  // List generators for filters
  const CuisineList = () => [
    { label: "African", value: "African" },
    { label: "Asian", value: "Asian" },
    { label: "American", value: "American" },
    { label: "British", value: "British" },
    { label: "Cajun", value: "Cajun" },
    { label: "Caribbean", value: "Caribbean" },
    { label: "Chinese", value: "Chinese" },
    { label: "Eastern European", value: "Eastern European" },
    { label: "European", value: "European" },
    { label: "French", value: "French" },
    { label: "German", value: "German" },
    { label: "Greek", value: "Greek" },
    { label: "Indian", value: "Indian" },
    { label: "Irish", value: "Irish" },
    { label: "Italian", value: "Italian" },
    { label: "Japanese", value: "Japanese" },
    { label: "Jewish", value: "Jewish" },
    { label: "Korean", value: "Korean" },
    { label: "Latin American", value: "Latin American" },
    { label: "Mediterranean", value: "Mediterranean" },
    { label: "Mexican", value: "Mexican" },
    { label: "Middle Eastern", value: "Middle Eastern" },
    { label: "Nordic", value: "Nordic" },
    { label: "Southern", value: "Southern" },
    { label: "Spanish", value: "Spanish" },
    { label: "Thai", value: "Thai" },
    { label: "Vietnamese", value: "Vietnamese" },
  ];
  const IntoleranceList = () => [
    { label: "Dairy", value: "Dairy" },
    { label: "Egg", value: "Egg" },
    { label: "Gluten", value: "Gluten" },
    { label: "Grain", value: "Grain" },
    { label: "Peanut", value: "Peanut" },
    { label: "Seafood", value: "Seafood" },
    { label: "Sesame", value: "Sesame" },
    { label: "Shellfish", value: "Shellfish" },
    { label: "Soy", value: "Soy" },
    { label: "Sulfite", value: "Sulfite" },
    { label: "Tree Nut", value: "Tree Nut" },
    { label: "Wheat", value: "Wheat" },
  ];
  const DietList = () => [
    { label: "Gluten Free", value: "Gluten Free" },
    { label: "Ketogenic", value: "Ketogenic" },
    { label: "Vegetarian", value: "Vegetarian" },
    { label: "Lacto-Vegetarian", value: "Lacto-Vegetarian" },
    { label: "Ovo-Vegetarian", value: "Ovo-Vegetarian" },
    { label: "Vegan", value: "Vegan" },
    { label: "Pescetarian", value: "Pescetarian" },
    { label: "Paleo", value: "Paleo" },
    { label: "Primal", value: "Primal" },
    { label: "Low FODMAP", value: "Low FODMAP" },
    { label: "Whole30", value: "Whole30" },
  ];

  const cuisines = CuisineList();
  const intolerances = IntoleranceList();
  const diets = DietList();

  const handleSearch = async () => {
    
    let selectedCuisinesString = selectedCuisine.join(", ") || "";
    let selectedIntolerancesString = selectedIntolerance.join(", ") || "";
    let excludedCusineString = "";
    let selectedDiet = "";

    if(includePreferences == true){
      const username = await getTokenData("username");
      if (!username) {
        console.error("Username not found in token.");
        return;
      }
      const token = await getToken();
      if (!token) {
        console.error("No token found in storage.");
        return;
      }

      //getting the user preferences (function..?)
      console.log("dislikes");
      try {
          const response = await fetch(`${API_BASE}/routes/api/cuisineDislike`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Username: `${username}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            //add the results to the API strings 
            excludedCusineString+=data.join(", ");
          } else {
            console.error("❌ Failed to load cart items", data.message);
          }
        } catch (error) {
          console.error("❌ Error fetching dislikes", error);
        }

      try {
          const response = await fetch(`${API_BASE}/routes/api/cuisineLike`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Username: `${username}`,
            },
          });
          const data = await response.json();
          if (response.ok) {
            //add the results to the API strings 
            selectedCuisinesString+=data.join(", ");

          } else {
            console.error("❌ Failed to load cart items", data.message);
          }
        } catch (error) {
          console.error("❌ Error fetching likes", error);
        }
      try {
        const response = await fetch(`${API_BASE}/routes/api/intolerance`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Username: `${username}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          //add the results to the API strings 
          selectedIntolerancesString+=data.join(", ");
        } else {
          console.error("❌ Failed to load cart items", data.message);
        }
      } catch (error) {
        console.error("❌ Error fetching intolerances", error);
      }
      try {
        const response = await fetch(`${API_BASE}/routes/api/diet`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Username: `${username}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          //add the results to the API strings 
          selectedDiet+=data.join(", ");
        } else {
          console.error("❌ Failed to load cart items", data.message);
        }
      } catch (error) {
        console.error("❌ Error fetching diets", error);
      }
    } 
    try {    
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(searchRecipe)}&addRecipeInformation=true&excludeCuisine=${encodeURIComponent(excludedCusineString)}&cuisine=${encodeURIComponent(selectedCuisinesString)}&intolerances=${encodeURIComponent(selectedIntolerancesString)}&diet=${encodeURIComponent(selectedDiet)}&apiKey=${spoonacularApiKey}`
      );
      const data = await response.json();
      if (response.ok) {
        console.log("Search successful:", data);
        setResult(data.results);
      } else {
        console.error("Search failed:", data);
      }
    } catch (error) {
      console.error("Error during search!:", error);
    }
  };
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleFilter = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
  };

  const handleFilter = async () => {
    setModalVisible(false);
    await handleSearch();
    console.log("searching with filters!");
  };

  useEffect(() => {
    console.log("Updated result:", result);
  }, [result]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Header */}
        <Text style={styles.header}>
          Recipe Search
        </Text>
        
        {/* Search Bar */}
        <TextInput
          value={searchRecipe}
          onChangeText={setSearchRecipe}
          placeholder="Search for a recipe..."
          placeholderTextColor={isDarkMode ? "#7211219A" : "#FFCF999A"}
          keyboardAppearance="default"
          keyboardType="default"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
        />

        {/* Filter Button */}
        <TouchableOpacity style={styles.filterButton} onPress={toggleModal}>
          <Text style={styles.filterButtonText}>FILTER</Text>
        </TouchableOpacity>

        {/* Filter Modal */}
        <Modal visible={isModalVisible} animationType="slide">
          <SafeAreaView style={[styles.modalContainer, { paddingTop: insets.top + 20 }]}>
            <ScrollView>
              {/*Cusine, diet, and intolerance preferences*/}
              <Text style={styles.modalHeader}>Cuisine</Text>
              {cuisines.map((item) => (
                <View key={item.value} style={styles.radioButtonContainer}>
                  <Checkbox
                    status={selectedCuisine.includes(item.value) ? "checked" : "unchecked"}
                    onPress={() => toggleFilter(selectedCuisine, setSelectedCuisine, item.value)}
                  />
                  <Text style={styles.radioLabel}>{item.label}</Text>
                </View>
              ))}

              <Text style={styles.modalHeader}>Diet</Text>
              {diets.map((diet) => (
                <View key={diet.value} style={styles.radioButtonContainer}>
                  <RadioButton
                    value={diet.value}
                    status={selectedDiet === diet.value ? "checked" : "unchecked"}
                    onPress={() => setSelectedDiet(diet.value)}
                  />
                  <Text style={styles.radioLabel}>{diet.label}</Text>
                </View>
              ))}

              <Text style={styles.modalHeader}>Intolerance</Text>
              {intolerances.map((item) => (
                <View key={item.value} style={styles.radioButtonContainer}>
                  <Checkbox
                    status={selectedIntolerance.includes(item.value) ? "checked" : "unchecked"}
                    onPress={() =>toggleFilter(selectedIntolerance, setSelectedIntolerance, item.value)}
                  />
                  <Text style={styles.radioLabel}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>

            {/*User preferences checkbox*/}
            <View style={styles.preferenceBox}>
              <Checkbox status={includePreferences ? 'checked' : 'unchecked'}
              onPress={() => setincludePreferences(!includePreferences)}/>
              <Text style={styles.filterButtonText}>Use Preferences</Text>
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={handleFilter}>
              <Text style={styles.modalCloseButtonText}>close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>

        {/* Recipe Display */}
        <ScrollView style={styles.recipeDisplayContainer}>
          <View style={styles.tileGrid}>
            {result.map((item) => (
              <View key={item.id} style={styles.tile}>
                <TouchableOpacity
                  style={styles.tileBackground}
                  onPress={() => router.push({
                    pathname: "/recipes/[id]",
                    params: { id: item.id.toString() },
                  })
                  }
                >
                  <Image source={{ uri: item.image }} style={styles.imageStyle} />
                </TouchableOpacity>

                <View style={styles.info}>
                  <Text style={styles.tileTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.infoText}>
                    ⏱ {item.readyInMinutes ?? "–"} min · 🍽 {item.servings ?? "–"}
                  </Text>
                  <Text style={styles.summaryText} numberOfLines={2}>
                    {stripHtml(item.summary)}
                  </Text>
                </View>

                {/* star overlay */}
                <TouchableOpacity
                  testID={`star-button-${item.id}`}
                  style={styles.star}
                  onPress={() => toggleFavourite(item.id)}
                >
                  <Ionicons
                    name={favourites.includes(item.id) ? "star" : "star-outline"}
                    size={28}
                    color={isDarkMode ? "#FFC074" : "#FFD700"}
                  />
                </TouchableOpacity>
              </View>
            ))}
            
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="search" isDarkMode={isDarkMode} />
    </View>
  );
};

function createStyles(isDarkMode: boolean, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      backgroundColor: isDarkMode ? "#721121" : "#FFCF99",
    },
    contentContainer: {
      flex: 1,
      padding: 20,
    },
    iosLogoText: {
      width: 200,
      fontSize: 30,
      fontFamily: "InknutAntiqua-SemiBold",
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    webLogoText: {
      fontSize: 30,
      fontFamily: "InknutAntiqua-SemiBold",
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    settingsIcon: {
      padding: 10,
    },
    icon: {
      width: 30,
      height: 30,
    },
    searchInput: {
      height: 50,
      borderColor: isDarkMode ? "#721121" : "#FFCF999A",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginBottom: 20,
      color: isDarkMode ? "#721121" : "#FFCF999A",
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
    },
    preferenceBox: {
      alignItems: 'center',
      flexDirection: "row",
    },
    filterButton: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 20,
    },
    filterButtonText: {
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 18,
      fontWeight: "bold",
    },
    modalContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    modalHeader: {
      fontSize: 22,
      fontWeight: "bold",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 10,
    },
    radioButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    radioLabel: {
      fontSize: 16,
      marginLeft: 8,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    modalCloseButton: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 20,
    },
    modalCloseButtonText: {
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 18,
      fontWeight: "bold",
    },
    // Recipe Tiles
    recipeDisplayContainer: {
      flex: 1,
      marginTop: 10,
      color: "#ffffff"
    },
    tileGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    tile: {
      width: Platform.OS === "web" ? "30%" : "48%",
      aspectRatio: 1,
      marginVertical: Platform.OS === "web" ? 15 : 10,
    },
    tileBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      overflow: "hidden",
    },
    imageStyle: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    tileText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#fff",
      zIndex: 1,
      textAlign: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: "rgba(0,0,0,0.3)",
      borderRadius: 5,
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    star: {
      position: "absolute",
      top: 6,
      right: 6,
    },
    info: {
      padding: 8,
    },
    tileTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#FFF" : "#000",
      marginBottom: 4,
    },
    infoText: {
      fontSize: 14,
      color: isDarkMode ? "#CCC" : "#555",
      marginBottom: 4,
    },
    summaryText: {
      fontSize: 13,
      color: isDarkMode ? "#AAA" : "#666",
    },
  });
}

export default SearchRecipe;