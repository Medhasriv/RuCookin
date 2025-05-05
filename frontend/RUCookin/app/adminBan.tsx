// app/adminBan.tsx
/**
 * @summary: adminBan.tsx
 * This is the screen where admins can monitor and manage content i.e. ban words that are used by users in their usernames that may violate rules.
 * This file is part of the set of screens that are only accessible to admin users once they are logged in.
 * 
 * @requirement: A014 - Admin Add Ban Words: The system shall allow administrators to ban words.
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Admin Ban screen, where admins can view, ban, and manage words .
 */

import React, { useEffect, useState } from "react"; //
import {View,Text,FlatList,TextInput,TouchableOpacity,StyleSheet,Platform,useColorScheme,ScrollView} from "react-native"; // React Native UI components
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // To handle navigation
import { checkAuth, checkAdmin, getToken } from "../utils/authChecker"; // Custom utility for authentication and token fetching
import AdminBottomNavBar from "../components/adminBottomNavBar";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run. This is part of requirement U018 - Database Connectivity w/ Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;
// This is a debugging statement to ensure that the API_BASE is set correctly
console.log("👉 API_BASE is now:", API_BASE);

// creating an object called ViolationItem which keeps track of items that violate the rules
type ViolationItem = {
  username: string;
  firstName: string;
  lastName: string;
  matchedFields: string[];
};
// creating an object called BanWordItem which keeps track of words that are banned
type BanWordItem = {
  word: string;
  addedBy?: string;
};

// These are the main components of the Admin Ban screen
const AdminBan = () => {
  // Setting the current color theme based on user's preference or device setting
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === "dark";
  const styles = createStyles(isDarkMode, insets.top);
  
  // States for managing ban words and violators
  const [banWords, setBanWords] = useState<BanWordItem[]>([]);
  const [newWord, setNewWord] = useState("");
  const [violations, setViolations] = useState<ViolationItem[]>([]);

  // Fetching ban words and violations when the component mounts and checking authentication
  useEffect(() => {
    checkAuth(router);
    checkAdmin(router);
    fetchBanWords();
    fetchViolations();
  }, []);

  // Below are the functions that handle fetching, adding, and removing ban words and violations from the backend API

  // Fetching the list of ban words from the backend API
  const fetchBanWords = async () => {
    try {
      const res = await fetch(`${API_BASE}/routes/api/adminBan/list`);
      const data = await res.json();
      setBanWords(data);
    } catch (err) {
      console.error("Error fetching ban words:", err);
    }
  };

  // Fetching the list of violations from the backend API
  const fetchViolations = async () => {
    try {
      const res = await fetch(`${API_BASE}/routes/api/adminBan/violations`);
      if (!res.ok) throw new Error("Failed to fetch violations");
      const data = await res.json();
      setViolations(data);
    } catch (err) {
      console.error("❌ Error fetching violations:", err);
    }
  };

  // Adding a new ban word to the backend API
  const handleAddBanWord = async () => {
    if (!newWord.trim()) return;
    
    try {
      const token = await getToken();
      if (!token) {
        console.error("No token found in storage.");
        return;
      }
      const res = await fetch(`${API_BASE}/routes/api/adminBan/add`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ word: newWord.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewWord("");
        fetchBanWords();
        fetchViolations();
      } else {
        console.error("Error adding ban word:", data.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Removing a ban word from the backend API
  const handleRemoveBanWord = async (word: string) => {
    try {
      const res = await fetch(`${API_BASE}/routes/api/adminBan/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchBanWords();
        fetchViolations();
      } else {
        console.error("Error removing ban word:", data.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // Rendering the Admin Ban screen
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
        <FlatList
          data={violations}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Header/Screen Title */}
              <Text style={styles.title}> Manage Ban Words</Text>

              {/* Add New Word */}
              <View style={styles.inputRow}>
                <TextInput
                  value={newWord}
                  onChangeText={setNewWord}
                  placeholder="Add new ban word"
                  placeholderTextColor={isDarkMode ? "#aaa" : "#999"}
                  style={styles.input}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddBanWord}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Ban Word List */}
              <Text style={styles.subHeader}>Current Banned Words</Text>
              {banWords.length === 0 ? (
                <Text style={styles.none}>No ban words yet.</Text>
              ) : (
                banWords.map((w, i) => (
                  <View key={i} style={styles.banWordRow}>
                    <Text style={styles.banWord}>• {w.word}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveBanWord(w.word)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <Text style={styles.subHeader}>Violations</Text>
              {violations.length === 0 && <Text style={styles.none}>No violations found.</Text>}
            </>
          }
          // Rendering each violation item
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.fieldHeader}>Matched Fields:</Text>
              {item.matchedFields.map((f, idx) => (
                <Text key={idx} style={styles.matchedField}>
                  • {f}
                </Text>
              ))}
            </View>
          )}
        />
        </ScrollView>
      </SafeAreaView>
      <AdminBottomNavBar activeTab="ban" isDarkMode={isDarkMode} />
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
    content: {
      padding: 20,
      paddingBottom: 100, // avoid nav bar
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: 100, // avoid nav bar
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 24,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      color: isDarkMode ? "#fff" : "#000",
      padding: 10,
      borderRadius: 8,
      marginRight: 8,
      fontSize: 16,
    },
    addButton: {
      backgroundColor: isDarkMode ? "#721121" : "#ffc074",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    addButtonText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontSize: 16,
      fontWeight: "600",
    },
    subHeader: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#ffc074" : "#444",
      marginTop: 24,
      marginBottom: 8,
    },
    none: {
      fontStyle: "italic",
      color: isDarkMode ? "#888" : "#777",
      marginBottom: 10,
      fontSize: 16,
    },
    banWordRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    banWord: {
      fontSize: 16,
      color: isDarkMode ? "#fff" : "#000",
    },
    removeButton: {
      backgroundColor: isDarkMode ? "#444" : "#e0e0e0",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 6,
    },
    removeButtonText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontSize: 14,
    },
    card: {
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? "#333" : "#ddd",
      marginBottom: 12,
    },
    username: {
      fontWeight: "bold",
      fontSize: 16,
      color: isDarkMode ? "#ffc074" : "#2c3e50",
    },
    name: {
      color: isDarkMode ? "#fff" : "#2c3e50",
    },
    fieldHeader: {
      marginTop: 6,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#555",
    },
    matchedField: {
      paddingLeft: 10,
      color: isDarkMode ? "#FFCF99" : "#c0392b",
    },
  });

export default AdminBan;
