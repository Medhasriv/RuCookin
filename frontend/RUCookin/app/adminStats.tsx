// app/adminStats.tsx
/**
 * @summary: adminStats.tsx
 * This is the screen where admins can view data analytics related to different users.
 * Data analytics include the most popular recipes, the most popular diets, the most popular intolerances, and the most liked and disliked cuisines.
 * This file is part of the set of screens that are only accessible to admin users once they are logged in.
 * 
 * @requirement: A015 - Admin Most Favorite Recipes: The system shall allow administrators to view a list of the most favorite recipes.
 * @requirement: A016 - Admin Most-used Information: The system shall allow administrators to view the most frequently used ingredients, cuisine types, diet preferences, and other user preferences.
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Admin Stats Page, where data analytics from user's favorites and preferences can viewed.
 */
import React, { useEffect, useState } from "react";
import { View, Text, SectionList, StyleSheet, Platform, useColorScheme } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getToken, checkAuth, checkAdmin } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run. This is part of requirement U018 - Database Connectivity w/ Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// Define the type for each statistic item
type StatItem = {
  _id: string | number;
  count: number;
};

// Define the type for each section of statistics
type SectionData = {
  title: string;
  data: StatItem[];
};

// Main component for admin statistics
const AdminStats = () => {
  const router = useRouter(); // Navigation router
  const insets = useSafeAreaInsets(); // Safe area insets for padding
  const isDarkMode = useColorScheme() === "dark"; // Boolean for dark mode
  const styles = createStyles(isDarkMode, insets.top); // Dynamic styles based on theme and safe area insets

  const [sections, setSections] = useState<SectionData[]>([]); // State to hold sections of statistics

  // Check admin authentication on component mount and fetch analytics data from backend API
  useEffect(() => {
    checkAuth(router);
    checkAdmin(router);
    fetchAnalytics();
  }, []);

  // Fetch analytics data from backend API
  const fetchAnalytics = async () => {
    try {
      const token = await getToken(); // Get the authentication token
      if (!token) return;

      const [favRes, prefRes] = await Promise.all([
        fetch(`${API_BASE}/routes/api/adminTop/top-favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/routes/api/adminTop/user-preferences`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      const favData = await favRes.json();
      const prefData = await prefRes.json();
      
      // Array for top favorite recipes
      const favs: StatItem[] = Array.isArray(favData)
        ? favData.map((item: any) => ({
          _id: `${item._id}`,
          count: item.count,
        }))
        : [];
      // Array for top diets
      const diets: StatItem[] = Array.isArray(prefData.topDiets)
        ? prefData.topDiets.map((item: any) => ({
          _id: `${item._id}`,
          count: item.count,
        }))
        : [];
      // Array for top intolerances
      const intolerances: StatItem[] = Array.isArray(prefData.topIntolerances)
        ? prefData.topIntolerances.map((item: any) => ({
          _id: `${item._id}`,
          count: item.count,
        }))
        : [];
      // Array for top liked cuisines
      const liked: StatItem[] = Array.isArray(prefData.topLikedCuisines)
        ? prefData.topLikedCuisines.map((item: any) => ({
          _id: `${item._id}`,
          count: item.count,
        }))
        : [];
      // Array for top disliked cuisines
      const disliked: StatItem[] = Array.isArray(prefData.topDislikedCuisines)
        ? prefData.topDislikedCuisines.map((item: any) => ({
          _id: `${item._id}`,
          count: item.count,
        }))
        : [];
      // Set the sections state with the fetched data
      setSections([
        { title: "Favorite Recipes", data: favs },
        { title: "Top Diets", data: diets },
        { title: "Top Intolerances", data: intolerances },
        { title: "Liked Cuisines", data: liked },
        { title: "Disliked Cuisines", data: disliked },
      ]);
    } catch (err) {
      console.error("❌ Error loading analytics:", err);
    }
  };

  // find max across all sections for bar scaling
  const maxCount = sections
    .flatMap((sec) => sec.data)
    .reduce((m, x) => (x.count > m ? x.count : m), 1);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <SectionList
          sections={sections}
          keyExtractor={(item, idx) => `${item._id}-${idx}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Header/Screen Title */}
              <Text style={styles.header}>Admin Analytics</Text>
              {/* Description of admin features */}
              <Text style={styles.caption}>
                Top trends across users dietary preferences
              </Text>
            </>
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => {
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <View style={styles.card}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>{item._id}</Text>
                  <Text style={styles.statCount}>{item.count}</Text>
                </View>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>

      <AdminBottomNavBar activeTab="stats" isDarkMode={isDarkMode} />
    </View>
  );
};

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (isDarkMode: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
      paddingTop: Platform.OS === "android" ? topInset : 0,
    },
    inner: { flex: 1 },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100, // leave room for tab bar
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 16,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    caption: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 24,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    sectionHeader: {
      fontSize: 20,
      fontWeight: "700",
      marginTop: 20,
      marginBottom: 8,
      color: isDarkMode ? "#ffc074" : "#721121",
    },
    card: {
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#333" : "#ddd",
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    statLabel: {
      flex: 1,
      fontSize: 16,
      color: isDarkMode ? "#fff" : "#333",
    },
    statCount: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#721121",
    },
    barContainer: {
      height: 6,
      backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
      borderRadius: 4,
      overflow: "hidden",
    },
    bar: {
      height: "100%",
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      borderRadius: 4,
    },
  });

export default AdminStats;