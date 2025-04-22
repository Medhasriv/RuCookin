import { useRouter } from "expo-router";
import { View, Text, TextInput, FlatList, StyleSheet, useColorScheme, Platform, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { checkAuth, getToken } from "../utils/authChecker"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

type CartItem = {
  _id: string;
  itemName: string;
  quantity: number;
  origin: string;
};

const KrogerShoppingCart  = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [matchedItems, setMatchedItems] = useState<any[]>([]);
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
      const response = await fetch("http://localhost:3001/routes/api/shoppingCart", {
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
  
  const handleFetchKrogerPrices  = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3001/routes/api/krogerCart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ zipcode }),
      });
      const data = await response.json();
    if (response.ok) {
      console.log("✅ Kroger Prices Fetched", data);
      setMatchedItems(data.matched); 
    } else {
      console.error("❌ Failed to fetch Kroger data:", data.error);
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
};
  const handleAddToKrogerCart  = async () => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/krogerCart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchedItems }),
      });
      const data = await response.json();
    if (response.ok) {
      console.log("✅ Added to Kroger Cart:", data);
      setCartItems([]);
      setMatchedItems([]);
    } else {
      console.error("❌ Failed to add to Kroger cart:", data.error);
    }
  } catch (err) {
    console.error("❌ Error adding to Kroger cart:", err);
  }
};

return (
  <View style={styles.container}>
    <SafeAreaView style={styles.contentContainer}>
      {/* Header */}
      <Text style={styles.header}>Shopping Cart</Text>
      <Text style={styles.caption}>Add your items to the Kroger™ Cart</Text>

      {/* Zip Code Input */}
      <TextInput
      style={styles.searchInput}
       placeholder="Enter ZIP Code"
      placeholderTextColor={isDarkMode ? '#721121' : '#FFCF99'}
      value={zipcode}
      onChangeText={setZipcode}
      onSubmitEditing={handleFetchKrogerPrices}
/>

      {/* Check Prices Button */}
      <TouchableOpacity style={styles.addToCartButton} onPress={handleFetchKrogerPrices}>
        <Text style={styles.addToCartButtonText}>Check Kroger Prices</Text>
        </TouchableOpacity>

      {/* FlatList for Original Cart Items */}
      <FlatList
        style={styles.flatListContainer}
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
          </View>
        )}
      />

      {/* Matched Kroger Price Preview */}
      {matchedItems.length > 0 && (
        <View>
          <Text style={styles.header}>Kroger Price Preview:</Text>
          {matchedItems.map((item, idx) => (
            <Text key={idx} style={styles.subText}>
              {item.name} - ${item.price.toFixed(2)}
            </Text>
          ))}
        </View>
      )}

      {/* Add to Kroger Cart */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleAddToKrogerCart}
      >
        <Text style={styles.buttonText}>Add to Kroger Cart</Text>
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

export default KrogerShoppingCart;
