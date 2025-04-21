import { useRouter } from "expo-router";
import { Platform, StyleSheet, Text, useColorScheme, View, Image, ImageBackground, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import { checkAuth } from "../utils/authChecker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { ScrollView, GestureHandlerRootView, Gesture } from "react-native-gesture-handler"



const AdminHomePage = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";


    const styles = createStyles(isDarkMode, insets.top);

    return (
        <View style={styles.container}>
          <SafeAreaView style={styles.innerContainer}>
            <Text style={styles.title}>Admin Dashboard</Text>
    
            <TouchableOpacity style={styles.button} onPress={() => router.push("/adminBan")}>
              <Text style={styles.buttonText}>Ban Words</Text>
            </TouchableOpacity>
    
            <TouchableOpacity style={styles.button} onPress={() => router.push("/adminStats")}>
              <Text style={styles.buttonText}>Top Lists</Text>
            </TouchableOpacity>
    
            <TouchableOpacity style={styles.button} onPress={() => router.push("/HomePage")}>
              <Text style={styles.buttonText}>Modified Accounts</Text>
            </TouchableOpacity>
    
            <TouchableOpacity style={styles.button} onPress={() => router.push("/adminCreateRecipes")}>
              <Text style={styles.buttonText}>Create Recipes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/HomePage")}>
              <Text style={styles.buttonText}>Create Admin</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      );
    };
    
    const createStyles = (isDarkMode: boolean, topInset: number) =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: isDarkMode ? "#000" : "#fff",
          paddingTop: topInset,
          paddingHorizontal: 20,
        },
        innerContainer: {
          flex: 1,
          justifyContent: "center",
        },
        title: {
          fontSize: 32,
          fontWeight: "bold",
          textAlign: "center",
          color: isDarkMode ? "#FFCF99" : "#721121",
          marginBottom: 30,
        },
        button: {
          backgroundColor: isDarkMode ? "#1e1e1e" : "#eaeaea",
          paddingVertical: 20,
          paddingHorizontal: 16,
          borderRadius: 10,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: isDarkMode ? "#666" : "#ccc",
        },
        buttonText: {
          fontSize: 20,
          fontWeight: "600",
          color: isDarkMode ? "#fff" : "#000",
          textAlign: "center",
        },
      });
    
    export default AdminHomePage;
