
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { checkAuth, getToken } from "../utils/authChecker";
import BottomNavBar from "../components/BottomNavBar";

type IngredientResult = {
  id: number;
  name: string;
  image: string;
};
type PantryItem = {
  id: number;
  name: string;
  image: string;
};

const Pantry = () => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<IngredientResult[]>([]);
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const deviceScheme = useColorScheme();
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const styles = createStyles(isDarkMode);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
    checkAuth(router);
    fetchPantryItems();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        setPantryItems(data);
      } else {
        console.error("Error fetching pantry items:", data);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };  

  const fetchIngredients = async () => {
    try {
      if (!searchText.trim()) return;

      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
          searchText
        )}&number=5&apiKey=6ffdf60e9f814440bdbfb6b3f9b9b5cd`
      );

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("❌ Error fetching ingredients:", error);
    }
  };

  const handleAddToPantry = async (ingredient: IngredientResult) => {
    try {
      const token = await getToken();
      // console.log("🔐 token:", token);
            const newItem = {
        id: ingredient.id,
        name: ingredient.name,
        image: ingredient.image,
      };
  
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item: newItem }),
      });
      
      const data = await response.json();
      // console.log("📬 Response from server:", data);
      
        if (response.ok) {
        // alert(`${ingredient.name} added to pantry!`);
        setSearchText("");
        setSearchResults([]);
        fetchPantryItems(); // Re-fetch pantry items after adding to pantry
      } else {
        console.error("Data error: ", data);
      }
    } catch (error) {
      console.error("❌ Error adding to pantry:", error);
    }
  };  

  const handleRemoveFromPantry = async (id: number) => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId: id }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setPantryItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        console.error("Server error:", data.message);
      }
    } catch (error) {
      console.error("❌ Error deleting pantry item:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.header}>Pantry</Text>
        <Text style={styles.caption}>Search and add ingredients to your pantry</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search for ingredients..."
          placeholderTextColor={isDarkMode ? "#721121" : "#FFCF99"}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={fetchIngredients}
        />

        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleAddToPantry(item)}
              style={styles.resultItem}
            >
              <Image
                source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` }}
                style={styles.ingredientImage}
              />
              <Text style={styles.itemName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.caption}>Your Pantry</Text>
        <FlatList
          data={pantryItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Image
                source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.image}` }}
                style={styles.ingredientImage}
              />
              <Text style={styles.itemName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleRemoveFromPantry(item.id)} style={styles.removeButton}>
                <Image
                  source={
                    isDarkMode
                      ? require("../assets/icons/cancel_dark.png")
                      : require("../assets/icons/cancel_light.png")
                  }
                  style={styles.cancelIcon}
                />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
      <BottomNavBar activeTab="pantry" isDarkMode={isDarkMode} />
    </View>
  );
};

const createStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    contentContainer: {
      flex: 1,
      padding: 20,
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    caption: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
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
    resultItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: isDarkMode ? "#FFCF99" : "#721121",
    },
    itemName: {
      marginLeft: 15,
      fontSize: 16,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    ingredientImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
    },
    removeButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    cancelIcon: {
      width: 24,
      height: 24,
    },
  });

export default Pantry;