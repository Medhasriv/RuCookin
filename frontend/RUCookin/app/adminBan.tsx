import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {View,Text, FlatList,StyleSheet,ScrollView, TextInput, Button} from 'react-native';
import { checkAuth } from "../utils/authChecker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavBar from "../components/BottomNavBar";


type ViolationItem = {
  username: string;
  firstName: string;
  lastName: string;
  matchedFields: string[];
};

type BanWordItem = {
  word: string;
  addedBy?: string;
};



const AdminBan = () => {
  const [banWords, setBanWords] = useState<BanWordItem[]>([]);
  const [newWord, setNewWord] = useState('');
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth(router);
    fetchBanWords();
    fetchViolations();
  }, []);
  const fetchBanWords = async () => {
    try {
      const res = await fetch("http://localhost:3001/routes/api/adminBan/list");
      const data = await res.json();
      setBanWords(data);
    } catch (err) {
      console.error('Error fetching ban words:', err);
    }
  };
  


      const fetchViolations = async () => {
        try {

          const res = await fetch("http://localhost:3001/routes/api/adminBan/violations");
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          setViolations(data);
        } catch (err) {
          console.error("❌ Error fetching violations:", err);
        } 
      };
      const handleAddBanWord = async () => {
        if (!newWord.trim()) return;
        try {
          const res = await fetch("http://localhost:3001/routes/api/adminBan/add", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: newWord})
          });
          const data = await res.json();
    
          if (res.ok) {
            console.error('Success', 'Ban word added!');
            setNewWord('');
            fetchBanWords();
            fetchViolations();
          } else {
            console.error('Error', data.message || 'Could not add ban word.');
          }
        } catch (err) {
          console.error(err);
          console.error('Error', ' error occurred.');
        }
      };
      const styles = StyleSheet.create({
        container: {
          padding: 16,
          backgroundColor: '#fff',
          flex: 1,
        },
        heading: {
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 16,
          color: '#721121',
        },
        subHeader: {
          fontSize: 18,
          fontWeight: 'bold',
          marginTop: 24,
          marginBottom: 10,
          color: '#444',
        },
        inputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        },
        input: {
          flex: 1,
          borderColor: '#ccc',
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          marginRight: 8,
          fontSize: 16,
        },
        banWord: {
          fontSize: 16,
          marginBottom: 4,
          paddingLeft: 8,
          color: '#000',
        },
        none: {
          fontStyle: 'italic',
          color: '#777',
          marginBottom: 10,
          fontSize: 16,
        },
        card: {
          padding: 12,
          borderRadius: 8,
          borderColor: '#ddd',
          borderWidth: 1,
          marginBottom: 12,
          backgroundColor: '#f9f9f9',
        },
        username: {
          fontWeight: 'bold',
          fontSize: 16,
          color: '#2c3e50',
        },
        fieldHeader: {
          marginTop: 6,
          fontWeight: '600',
          color: '#555',
        },
        matchedField: {
          paddingLeft: 10,
          color: '#c0392b',
        },
      });

      return (
        <ScrollView style={styles.container}>
          <Text style={styles.heading}>🚫 Manage Ban Words</Text>
      
          {/* Add New Word */}
          <View style={styles.inputRow}>
            <TextInput
              value={newWord}
              onChangeText={setNewWord}
              placeholder="Add new ban word"
              placeholderTextColor="#999"
              style={styles.input}
            />
            <Button title="Add" onPress={handleAddBanWord} />
          </View>
      
          {/* Ban Word List */}
          <Text style={styles.subHeader}>📋 Current Ban Words</Text>
          {banWords.length === 0 ? (
            <Text style={styles.none}>No ban words yet.</Text>
          ) : (
            banWords.map((word, index) => (
              <Text key={index} style={styles.banWord}>• {word.word}</Text>
            ))
          )}
      
          {/* Violations List */}
          <Text style={styles.subHeader}>🚨 Violations</Text>
          {violations.length === 0 ? (
            <Text style={styles.none}>No violations found.</Text>
          ) : (
            <FlatList
              data={violations}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.fieldHeader}>Matched Fields:</Text>
                  {item.matchedFields.map((field, idx) => (
                    <Text key={idx} style={styles.matchedField}>• {field}</Text>
                  ))}
                </View>
              )}
            />
          )}
        </ScrollView>
      );}
  
    export default AdminBan;