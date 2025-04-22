import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text,TextInput, Button,FlatList,StyleSheet,ActivityIndicator} from 'react-native';
import { checkAuth } from "../utils/authChecker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserItem = {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    AccountType: string[];
  };
  const AdminModifyAccount = () => {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedUsername, setEditedUsername] = useState<string>('');
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const router = useRouter();
    
    useEffect(() => {
        checkAuth(router);
        fetchUsers();
        getCurrentUserId();
    }, []);

    const getCurrentUserId = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
    
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.userId);
      };
    
      const fetchUsers = async () => {
        try {
          const res = await fetch('http://localhost:3001/routes/api/adminMaintain');
          const data = await res.json();
          setUsers(data);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
      };
      const handleEdit = (user: UserItem) => {
        setEditingId(user._id);
        setEditedUsername(user.username);
      };
      const handleSave = async () => {
        if (!editingId || !editedUsername.trim()) return;
      
        try {
          await fetch('http://localhost:3001/routes/api/adminMaintain', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: editingId,        
              username: editedUsername   
            }),
          });
      
          setEditingId(null);
          setEditedUsername('');
          fetchUsers();
        } catch (err) {
          console.error('Error updating user:', err);
        }
      };
      const handleDelete = async (userId: string) => {
        try {
          await fetch('http://localhost:3001/routes/api/adminMaintain', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
      
          fetchUsers(); 
        } catch (err) {
          console.error('Error deleting user:', err);
        }
      };


      const renderUser = ({ item }: { item: UserItem }) => {
        const isSelf = item._id === currentUserId;
        const isAdmin = Array.isArray(item.AccountType) && item.AccountType.includes('admin');

        
    return (
        <View style={styles.card}>
          <Text>{item.firstName} {item.lastName}</Text>
          {editingId === item._id ? (
            <>
              <TextInput
                value={editedUsername}
                onChangeText={setEditedUsername}
                style={styles.input}
              />
              <Button title="Save" onPress={handleSave} />
            </>
          ) : (
            <Text style={styles.username} onPress={() => {
              if (isAdmin && !isSelf) {
                console.log("Access Denied", "You cannot edit another admin's account.");
              } else {
                handleEdit(item);
              }
            }}>{item.username}</Text>
          )}
          {!isAdmin && !isSelf && (
            <Button title="Delete" color="red" onPress={() => handleDelete(item._id)} />
          )}
        </View>
      );
    };
  
    return (
        <SafeAreaView style={styles.container}>
        <Text style={styles.header}>🔧 Admin Account Modification</Text>
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
        />

      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    card: {
      borderWidth: 1, borderColor: '#ccc', padding: 12,
      borderRadius: 8, marginBottom: 12, backgroundColor: '#f8f8f8'
    },
    username: {
      fontWeight: 'bold', fontSize: 16, marginTop: 8, color: '#333'
    },
    input: {
      borderWidth: 1, borderColor: '#ccc', padding: 8,
      borderRadius: 6, marginVertical: 8
    }
  });
  export default AdminModifyAccount;







