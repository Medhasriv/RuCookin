import { useRouter } from "expo-router";
import { View, Text, TextInput, FlatList, StyleSheet, useColorScheme, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { checkAuth, getToken } from "../utils/authChecker"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

type CartItem = {
  _id: string;
  itemName: string;
  quantity: number;
  origin: string;
};

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchText, setSearchText] = useState("");
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const deviceScheme = useColorScheme();
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const styles = createStyles(isDarkMode);
  const router = useRouter();

useEffect(() => {
  // Retrieve stored theme from AsyncStorage
  AsyncStorage.getItem("userTheme").then((value) => {
    if (value) setUserTheme(value);
  });

  checkAuth(router);
  fetchCart();
}, []);
  
  const fetchCart = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("No token found in storage.");
        return;
      }
      const response = await fetch(`${API_BASE}/routes/api/shoppingCart`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems(data);
      } else {
        console.error("❌ Failed to load cart items:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
    }
  };
  
  const handleAddItem = async () => {
    try {
      const token = await getToken();
      if (!searchText.trim()) return;
      const newItem = {
        _id: `${searchText.trim()}-${Date.now()}`,
        itemName: searchText.trim(),
        quantity: 1,
        origin: "Search",
      };
      const response = await fetch(`${API_BASE}/routes/api/shoppingCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItems: newItem }),
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems([...cartItems, newItem]);
        setSearchText("");
      } else {
        console.error("Data error: ", data);
      }
    } catch (error) {
      console.error("❌ Error during Shopping Cart:", error);
    }
  };

  const handleRemoveItem = async (_id: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE}/routes/api/shoppingCart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemId: _id }),
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems((prevItems) => prevItems.filter((item) => item._id !== _id));
      } else {
        console.error("Server error:", data.message);
      }
    } catch (error) {
      console.error("❌ Error deleting cart item:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Header */}
        <Text style={styles.header}>
          Shopping Cart
        </Text>
        <Text style={styles.caption}>
          Search and add items to your grocery cart, powered by Kroger™
        </Text>
        {/* Search Bar */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search for item here..."
          placeholderTextColor={isDarkMode ? '#721121' : '#FFCF99'}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleAddItem}
        />

        {/* Add to Cart Button */}
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddItem}>
          <Text style={styles.addToCartButtonText}>Add To Cart</Text>
        </TouchableOpacity>
        
        {/* FlatList Container with horizontal padding */}
        <FlatList style={styles.flatListContainer}
          data={cartItems}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.subText}>
                  x{item.quantity} from {item.origin || "Unknown Recipe"}
                </Text>
              </View>
              <TouchableOpacity accessibilityRole="button" onPress={() => handleRemoveItem(item._id)} style={styles.removeButton}>
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
        {/* Kroger Price Checker Button */}
        <TouchableOpacity style={styles.button} onPress={() => router.push("/KrogerShoppingCart")}>
                <Text style={styles.buttonText}>Check Kroger Prices</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="cart" isDarkMode={isDarkMode} />
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
    addToCartButton: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 15,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 20,
    },
    addToCartButtonText: {
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

export default ShoppingCart;
