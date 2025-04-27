import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  useColorScheme,
  ScrollView
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { checkAuth } from "../utils/authChecker";
import AdminBottomNavBar from "../components/adminBottomNavBar";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "VirtualizedLists should never be nested inside plain ScrollViews"
]);

type UserItem = {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  AccountType?: string[];  // make it optional
};

const AdminModifyAccount = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === "dark";
  const styles = createStyles(isDarkMode, insets.top);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedUsername, setEditedUsername] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    checkAuth(router);
    fetchUsers();
    fetchCurrentUserId();
  }, []);

  const fetchCurrentUserId = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    const payload = JSON.parse(atob(token.split(".")[1]));
    setCurrentUserId(payload.userId);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3001/routes/api/adminMaintain");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleEdit = (user: UserItem) => {
    setEditingId(user._id);
    setEditedUsername(user.username);
  };

  const handleSave = async () => {
    if (!editingId || !editedUsername.trim()) return;
    try {
      await fetch("http://localhost:3001/routes/api/adminMaintain", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  const handleCancel = () => {
    setEditingId(null);
    setEditedUsername("");
  };

  const handleDelete = async (userId: string) => {
    try {
      await fetch("http://localhost:3001/routes/api/adminMaintain", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const renderUser = ({ item }: { item: UserItem }) => {
    const isSelf = item._id === currentUserId;
    const isAdmin =
      Array.isArray(item.AccountType) && item.AccountType.includes("admin");  // guard here

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
              <Text style={styles.title}>Modify Accounts</Text>
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
