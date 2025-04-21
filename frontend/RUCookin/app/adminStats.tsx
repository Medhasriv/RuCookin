import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";
import { getToken, checkAuth } from "../utils/authChecker";
import { useRouter } from "expo-router";

type StatItem = {
  _id: string | number;
  count: number;
};

const AdminStats = () => {
  const [analytics, setAnalytics] = useState<StatItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth(router);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [favRes, prefRes] = await Promise.all([
        fetch("http://localhost:3001/routes/adminTop/top-favorites", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3001/routes/adminTop/user-preferences", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const favData = await favRes.json();
      const prefData = await prefRes.json();

      const combined: StatItem[] = [
        ...(Array.isArray(favData) ? favData.map((item: any) => ({
          _id: `Favorite Recipe: ${item._id}`,
          count: item.count,
        })) : []),

        ...(Array.isArray(prefData.topDiets) ? prefData.topDiets.map((item: any) => ({
          _id: `Diet: ${item._id}`,
          count: item.count,
        })) : []),

        ...(Array.isArray(prefData.topIntolerances) ? prefData.topIntolerances.map((item: any) => ({
          _id: `Intolerance: ${item._id}`,
          count: item.count,
        })) : []),

        ...(Array.isArray(prefData.topLikedCuisines) ? prefData.topLikedCuisines.map((item: any) => ({
          _id: `Liked Cuisine: ${item._id}`,
          count: item.count,
        })) : []),

        ...(Array.isArray(prefData.topDislikedCuisines) ? prefData.topDislikedCuisines.map((item: any) => ({
          _id: `Disliked Cuisine: ${item._id}`,
          count: item.count,
        })) : []),
      ];

      setAnalytics(combined);
    } catch (err) {
      console.error("❌ Error loading analytics:", err);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.contentContainer}>
        <Text style={styles.header}>Admin Analytics</Text>
        <Text style={styles.caption}>Top user trends across recipes and preferences</Text>

        <FlatList
          data={analytics}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={({ item }: { item: StatItem }) => (
            <Text style={styles.itemText}>
              {item._id} — {item.count}
            </Text>
          )}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#ffffff",
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
    color: "#721121",
  },
  caption: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#721121",
  },
  itemText: {
    fontSize: 16,
    color: "#721121",
    marginBottom: 12,
  },
});

export default AdminStats;
