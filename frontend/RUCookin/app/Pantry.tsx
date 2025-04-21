import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { checkAuth, getToken } from "../utils/authChecker";

type PantryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  origin: string;
};

type SpoonacularResult = {
  id: number;
  name: string;
  image: string;
};

const Pantry = () => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<SpoonacularResult[]>([]);
  const [userTheme, setUserTheme] = useState<string | null>(null);
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
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPantryItems(data);
      } else {
        console.error("❌ Failed to load pantry:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching pantry:", error);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) return setSuggestions([]);
    try {
      const response = await fetch(
        `https://api.spoonacular.com/food/ingredients/search?query=${query}&number=3&apiKey=9c396355ebfb4dd08de141e25dd55182`
      );
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.results);
      }
    } catch (error) {
      console.error("❌ Error fetching suggestions:", error);
    }
  };

  const handleAddItem = async (item: SpoonacularResult) => {
    try {
      const token = await getToken();
      const newItem = {
        _id: `${item.name}-${Date.now()}`,
        itemName: item.name,
        quantity: 1,
        origin: "Spoonacular",
      };
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pantryItem: newItem }),
      });
      const data = await response.json();
      if (response.ok) {
        setPantryItems([...pantryItems, newItem]);
        setSearchText("");
        setSuggestions([]);
      } else {
        console.error("Data error: ", data);
      }
    } catch (error) {
      console.error("❌ Error adding to Pantry:", error);
    }
  };

  const handleRemoveItem = async (_id: string) => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/pantry", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pantryItemId: _id }),
      });
      if (response.ok) {
        setPantryItems((prev) => prev.filter((item) => item._id !== _id));
      } else {
        const data = await response.json();
        console.error("❌ Server error:", data.message);
      }
    } catch (error) {
      console.error("❌ Error deleting pantry item:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.header}>My Pantry</Text>
        <Text style={styles.caption}>
          Add ingredients to your pantry by searching Spoonacular
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for ingredients..."
          placeholderTextColor={isDarkMode ? '#721121' : '#FFCF99'}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            fetchSuggestions(text);
          }}
        />
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.addToPantryButton}
              onPress={() => handleAddItem(item)}
            >
              <Text style={styles.addToPantryButtonText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
        <FlatList
          style={styles.flatListContainer}
          data={pantryItems}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.subText}>
                  x{item.quantity} from {item.origin}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveItem(item._id)} style={styles.removeButton}>
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
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    flatListContainer: {
      flex: 0.6,
      paddingHorizontal: 15,
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
    addToPantryButton: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 20,
    },
    addToPantryButtonText: {
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 18,
      fontWeight: "bold",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderColor: isDarkMode ? "#FFCF99" : "#721121",
      paddingVertical: 12,
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      color: isDarkMode ? "#FFCF99" : "#721121",
      fontSize: 16,
      fontWeight: "600",
    },
    subText: {
      fontSize: 12,
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginTop: 2,
    },
    removeButton: {
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    cancelIcon: {
      width: 24,
      height: 24,
    },
    button: {
      marginTop: 10,
      alignSelf: "center",
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 20,
      borderRadius: 10,
      marginBottom: 10,
    },
    buttonText: {
      fontWeight: "bold",
      color: isDarkMode ? "#721121" : "#FFCF99",
    },
  });

export default Pantry;
