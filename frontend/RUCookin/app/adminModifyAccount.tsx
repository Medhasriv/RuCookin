// app/adminModifyAccount.tsx
/**
 * @summary: adminModifyAccount.tsx
 * This is the screen where admins can view all accounts in the system, and modify the usernames of non-admin accounts.
 * Admins can also delete non-admin accounts from this screen.
 * This file is part of the set of screens that are only accessible to admin users once they are logged in.
 * 
 * @requirement: A011 - Admin Account Deletion: The system shall allow administrators to delete accounts with inappropriate names or inappropriate ingredients.
 * @requirement: A012 - Admin Account Modification: The system shall allow administrators to modify usernames.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Admin Modify Accounts screen, where admins can view, modify, and delete users in the system.
 */

import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Platform, useColorScheme, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAuth, checkAdmin, getToken } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";
import { LogBox } from "react-native";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run. This is part of requirement U018 - Database Connectivity w/ Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// ignore warning about nested scroll views. this is an intentional design choice, not a bug.
LogBox.ignoreLogs([
  "VirtualizedLists should never be nested inside plain ScrollViews"
]);

// Define the type for user items
type UserItem = {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  AccountType?: string[];
};

// Main component for modifying user accounts
const AdminModifyAccount = () => {
  const router = useRouter(); // Navigation router
  const insets = useSafeAreaInsets(); // Safe area insets for padding
  const isDarkMode = useColorScheme() === "dark"; // Boolean for dark mode
  const styles = createStyles(isDarkMode, insets.top); // Dynamic styles based on theme and safe area insets

  const [users, setUsers] = useState<UserItem[]>([]);  // State to hold user data
  const [editingId, setEditingId] = useState<string | null>(null); // State to track currently editing user ID
  const [editedUsername, setEditedUsername] = useState<string>(""); // State to hold edited username
  const [currentUserId, setCurrentUserId] = useState<string>(""); // State to hold current user ID

  // Fetching users and checking authentication on component mount
  useEffect(() => {
    checkAuth(router);
    checkAdmin(router);
    fetchUsers();
  }, []);

// Fetch the current users from the backend API
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/routes/api/adminMaintain`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

// Handles entering the edit mode for a user
  const handleEdit = (user: UserItem) => {
    setEditingId(user._id);
    setEditedUsername(user.username);
  };
// Sets the new username to the edited username and updates the backend API
  const handleSave = async () => {
    if (!editingId || !editedUsername.trim()) return;
    try {
      const token = await getToken();
            if (!token) {
              console.error("No token found in storage.");
              return;
            }
      await fetch(`${API_BASE}/routes/api/adminMaintain`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: editingId,
          username: editedUsername.trim(),
        }),
      });
      setEditingId(null);
      setEditedUsername("");
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };
  // Cancels the editing of the username and resets the state
  const handleCancel = () => {
    setEditingId(null);
    setEditedUsername("");
  };
 // Deletes the user from the backend API
  const handleDelete = async (userId: string) => {
    try {
      const token = await getToken();
            if (!token) {
              console.error("No token found in storage.");
              return;
            }
      await fetch(`${API_BASE}/routes/api/adminMaintain`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ userId }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };
  // Renders a list of all users in the system
  const renderUser = ({ item }: { item: UserItem }) => {
    const isSelf = item._id === currentUserId;
    const isAdmin =
      Array.isArray(item.AccountType) && item.AccountType.includes("admin"); 

    return (
      <View style={styles.card}>
        <Text style={styles.name}>
          {item.firstName} {item.lastName}
        </Text>

        {editingId === item._id ? (
          <>
            <TextInput
              value={editedUsername}
              onChangeText={setEditedUsername}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (isAdmin && !isSelf) return; // block editing other admins
              handleEdit(item);
            }}
          >
            <Text style={styles.username}>{item.username}</Text>
          </TouchableOpacity>
        )}

        {!isAdmin && !isSelf && editingId !== item._id && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item._id)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render component for the entire screen
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {/* Header/Screen Title */}
              <Text style={styles.title}>Modify Accounts</Text>
              {/* Description of screen */}
              <Text style={styles.caption}>
                Tap a username to edit it. Admin accounts cannot be edited.
              </Text>
            </>
          }
          renderItem={renderUser}
        />
        </ScrollView>
      </SafeAreaView>

      <AdminBottomNavBar activeTab="list" isDarkMode={isDarkMode} />
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
      paddingBottom: 100,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 24,
    },
    content: {
      padding: 20,
      paddingBottom: 100, // avoid nav bar
    },
    caption: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 24,
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    card: {
      backgroundColor: isDarkMode ? "#721121" : "#FFCF99",
      padding: 8,
      borderRadius: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#333" : "#ddd",
    },
    name: {
      fontSize: 18,
      fontWeight: "600",
      color: isDarkMode ? "#fff" : "#333",
      marginBottom: 4,
    },
    username: {
      fontSize: 16,
      color: isDarkMode ? "#ffc074" : "#721121",
      fontWeight: "500",
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#121212" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
      padding: 10,
      borderRadius: 6,
      marginBottom: 8,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 8,
    },
    saveButton: {
      backgroundColor: isDarkMode ? "#721121" : "#ffc074",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      marginRight: 8,
    },
    saveText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontWeight: "600",
    },
    cancelButton: {
      backgroundColor: isDarkMode ? "#555" : "#e0e0e0",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
    },
    cancelText: {
      color: isDarkMode ? "#fff" : "#444",
      fontWeight: "600",
    },
    deleteButton: {
      alignSelf: "flex-start",
      backgroundColor: isDarkMode ? "#422" : "#fdd",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    deleteText: {
      color: isDarkMode ? "#f88" : "#a00",
      fontWeight: "600",
    },
  });

export default AdminModifyAccount;
