import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getToken, checkAuth } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";

type StatItem = {
  _id: string | number;
  count: number;
};

type SectionData = {
  title: string;
  data: StatItem[];
};

const AdminStats = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === "dark";
  const styles = createStyles(isDarkMode, insets.top);

  const [sections, setSections] = useState<SectionData[]>([]);

  useEffect(() => {
    checkAuth(router);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [favRes, prefRes] = await Promise.all([
        fetch("http://localhost:3001/routes/api/adminTop/top-favorites", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3001/routes/api/adminTop/user-preferences", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const favData = await favRes.json();
      const prefData = await prefRes.json();

      const favs: StatItem[] = Array.isArray(favData)
        ? favData.map((item: any) => ({
            _id: `${item._id}`,
            count: item.count,
          }))
        : [];

      const diets: StatItem[] = Array.isArray(prefData.topDiets)
        ? prefData.topDiets.map((item: any) => ({
            _id: `${item._id}`,
            count: item.count,
          }))
        : [];

      const intolerances: StatItem[] = Array.isArray(prefData.topIntolerances)
        ? prefData.topIntolerances.map((item: any) => ({
            _id: `${item._id}`,
            count: item.count,
          }))
        : [];

      const liked: StatItem[] = Array.isArray(prefData.topLikedCuisines)
        ? prefData.topLikedCuisines.map((item: any) => ({
            _id: `${item._id}`,
            count: item.count,
          }))
        : [];

      const disliked: StatItem[] = Array.isArray(prefData.topDislikedCuisines)
        ? prefData.topDislikedCuisines.map((item: any) => ({
            _id: `${item._id}`,
            count: item.count,
          }))
        : [];

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
              <Text style={styles.header}>Admin Analytics</Text>
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
