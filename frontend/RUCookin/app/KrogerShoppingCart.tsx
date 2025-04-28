// Importing necessary modules and components
import { useRouter, useLocalSearchParams } from "expo-router"; // To handle navigation and local search params
import { View, Text, TextInput, FlatList, StyleSheet, useColorScheme, Platform, TouchableOpacity, Image } from "react-native"; // React Native UI components
import { SafeAreaView } from "react-native-safe-area-context"; // Safe Area context for proper layout
import React, { useState, useEffect } from "react"; // React hooks for state and effect
import { checkAuth, getToken } from "../utils/authChecker"; // Custom utility for authentication and token fetching
import AsyncStorage from "@react-native-async-storage/async-storage"; // Async storage for persistent data
import BottomNavBar from "../components/BottomNavBar"; // Custom bottom navigation bar
import * as WebBrowser from 'expo-web-browser'; // To handle web browser functionality (not used here)
import Constants from 'expo-constants'; // Access app constants

// Type definition for CartItem
type CartItem = {
  _id: string;
  itemName: string;
  quantity: number;
  origin: string;
};

// Main component for the Kroger Shopping Cart
const KrogerShoppingCart = () => {
  // States for managing cart data, theme, zip code, and matched items
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // To store the user's cart items
  const [userTheme, setUserTheme] = useState<string | null>(null); // To store user theme preference (dark or light)
  const [zipcode, setZipcode] = useState(""); // To store zip code input by the user
  const [matchedItems, setMatchedItems] = useState<any[]>([]); // To store items matched with Kroger prices
  
  // Determine the current theme based on the user's preference or device setting
  const deviceScheme = useColorScheme(); // Get the device's color scheme (dark or light mode)
  const effectiveTheme = userTheme ? userTheme : deviceScheme; // Use user theme if set, else fall back to device scheme
  const isDarkMode = effectiveTheme === "dark"; // Boolean to check if the current theme is dark
  
  // Dynamic styles based on dark or light mode
  const styles = createStyles(isDarkMode);

  // Router and params to handle navigation
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = params?.token; // Retrieve token from URL params
  
  // Effect to run on component mount
  useEffect(() => {
    // Store the Kroger token when available
    if (token) {
      AsyncStorage.setItem("krogerToken", token.toString())
        .then(() => console.log("✅ Stored Kroger token"))
        .catch((err) => console.error("❌ Failed to store Kroger token:", err));
    }
    
    // Retrieve stored user theme preference
    AsyncStorage.getItem("userTheme")
      .then((value) => {
        if (value) setUserTheme(value);
      })
      .catch((err) => console.error("❌ Failed to get user theme:", err));
    
    // Check if user is authenticated and fetch the shopping cart
    checkAuth(router);
    fetchCart();
  }, [token]);

  // Fetch the user's shopping cart from the API
  const fetchCart = async () => {
    try {
      const userToken = await getToken(); // Retrieve user token
      if (!userToken) {
        console.error("No user token found in storage.");
        return;
      }
      // Fetch cart items from the server
      const response = await fetch("http://localhost:3001/routes/api/shoppingCart", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCartItems(data); // Update cart items state
      } else {
        console.error("❌ Failed to load cart items:", data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error);
    }
  };

  // Fetch prices from Kroger based on the entered zip code
  const handleFetchKrogerPrices = async () => {
    try {
      const krogerToken = await AsyncStorage.getItem("krogerToken"); // Retrieve Kroger token
      if (!krogerToken || !zipcode) {
        console.error("❌ Missing Kroger token or zip code");
        return;
      }
      const userToken = await getToken(); // Retrieve user token
      // Fetch prices from Kroger API based on zip code
      const response = await fetch(`http://localhost:3001/routes/api/krogerCart?zipcode=${zipcode}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "x-kroger-token": krogerToken || "",
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("✅ Kroger Prices Fetched", data);
        setMatchedItems(data.matched); // Update matched items state with prices
      } else {
        console.error("❌ Failed to fetch Kroger data:", data.error);
      }
    } catch (err) {
      console.error("❌ Error:", err);
    }
  };

  // Simulate adding items to Kroger cart
  const handleAddToKrogerCart = async () => {
    try {
      const userToken = await getToken(); // Retrieve user token
      // Send request to add items to Kroger cart
      const response = await fetch("http://localhost:3001/routes/api/krogerCart", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({}) // Send empty body for simulation
      });
      const data = await response.json();
      if (response.ok) {
        console.log("🧪 Simulated cart cleared:", data);
        setCartItems([]); // Clear cart items after successful add
        setMatchedItems([]); // Clear matched items
      } else {
        console.error("❌ Simulated cart API failed:", data.error);
      }
    } catch (err) {
      console.error("❌ Error in simulated cart request:", err);
    }
  };

  // Return JSX for the component's layout
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        {/* Header section */}
        <Text style={styles.header}>Shopping Cart</Text>
        <Text style={styles.caption}>Add your items to the Kroger™ Cart</Text>

        {/* Zip Code Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Enter ZIP Code"
          placeholderTextColor={isDarkMode ? '#721121' : '#FFCF99'}
          value={zipcode}
          onChangeText={setZipcode}
          onSubmitEditing={handleFetchKrogerPrices} // Fetch prices when user submits
        />

        {/* Check Prices Button */}
        <TouchableOpacity style={styles.addToCartButton} onPress={handleFetchKrogerPrices}>
          <Text style={styles.addToCartButtonText}>Check Kroger Prices</Text>
        </TouchableOpacity>

        {/* FlatList to display cart items */}
        <FlatList
          style={styles.flatListContainer}
          data={cartItems}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            // Find matched item prices from the Kroger data
            const matched = matchedItems.find(
              (m) => m.name.toLowerCase() === item.itemName.toLowerCase()
            );
            const priceDisplay = matched ? `$${matched.price.toFixed(2)}` : "";

            return (
              <View style={styles.row}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.itemName}</Text>
                  <Text style={styles.subText}>
                    x{item.quantity} from {item.origin || "Unknown Recipe"}
                  </Text>
                </View>
                <View style={styles.itemPriceWrapper}>
                  <Text style={styles.itemPrice}>{priceDisplay}</Text>
                </View>
              </View>
            );
          }}
        />

        {/* Add to Kroger Cart Button */}
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

// Function to create styles dynamically based on dark mode
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
    itemPriceWrapper: {
      minWidth: 70,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: "bold",
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
  });

export default KrogerShoppingCart;
