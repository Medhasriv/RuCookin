import { useRouter } from "expo-router";
import { Platform, StyleSheet, Text, useColorScheme, View, ImageBackground, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { checkAuth } from "../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";

const HomePage = () => {
  const insets = useSafeAreaInsets();
  const deviceScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem("userTheme").then((value) => {
      if (value) setUserTheme(value);
    });
    checkAuth(router);
  }, []);

  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === "dark";
  const styles = createStyles(isDarkMode, insets.top);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning!";
    if (currentHour < 18) return "Good Afternoon!";
    return "Good Evening!";
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        
        <View style={styles.tileGrid}>
          {/* Find a Recipe Tile */}
          <TouchableOpacity style={styles.tile} onPress={() => router.push("/SearchRecipe")}>
            <ImageBackground
              source={require("../assets/images/find_recipe.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Find a Recipe</Text>
            </ImageBackground>
          </TouchableOpacity>
          
          {/* Plan a Meal Tile */}
          <TouchableOpacity style={styles.tile}>
            <ImageBackground
              source={require("../assets/images/plan_meal.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Plan a Meal</Text>
            </ImageBackground>
          </TouchableOpacity>
          
          {/* Saved Recipes Tile */}
          <TouchableOpacity style={styles.tile}>
            <ImageBackground
              source={require("../assets/images/saved_recipes.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Saved Recipes</Text>
            </ImageBackground>
          </TouchableOpacity>
          
          {/* Order Ingredients Tile */}
          <TouchableOpacity style={styles.tile} onPress={() => router.push("/ShoppingCart")}>
            <ImageBackground
              source={require("../assets/images/order_ingredients.jpg")}
              style={styles.tileBackground}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.overlay} />
              <Text style={styles.tileText}>Order Ingredients</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <BottomNavBar activeTab="home" isDarkMode={isDarkMode} />
    </View>
  );
};

function createStyles(isDarkMode: boolean, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000000" : "#ffffff",
    },
    contentContainer: {
      flex: 1,
      paddingTop: topInset,
      paddingHorizontal: 20,
      justifyContent: "flex-start",
    },
    greeting: {
      fontSize: Platform.select({ ios: 36, web: 48, default: 36 }),
      fontWeight: "bold",
      marginVertical: 20,
      color: isDarkMode ? "#FFCF99" : "#721121",
      textAlign: "center",
    },
    tileGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },
    // Use aspectRatio to maintain a square tile.
    tile: {
      width: Platform.OS === "web" ? "22%" : "48%",
      aspectRatio: 1, // maintain square shape on all platforms
      marginVertical: Platform.OS === "web" ? 15 : 10,
    },
    tileBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      overflow: "hidden",
    },
    // Ensure the image fills its container.
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
      fontSize: Platform.select({ ios: 20, web: 22, default: 20 }),
      fontWeight: "bold",
      color: "#fff",
      zIndex: 1,
      textAlign: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: "rgba(0,0,0,0.3)",
      borderRadius: 5,
    },
  });
}

export default HomePage;
