import React, { useEffect, useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import {View,Text, FlatList,StyleSheet,ActivityIndicator,ScrollView,RefreshControl} from 'react-native';
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



const AdminBan = () => {
  const [violations, setViolations] = useState<ViolationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth(router);
    fetchViolations();
  }, []);

      const fetchViolations = async () => {
        try {
          setLoading(true);
          const res = await fetch("http://localhost:3001/routes/adminBan");
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          setViolations(data);
        } catch (err) {
          console.error("❌ Error fetching violations:", err);
        } finally {
          setLoading(false);
        }
      };
    
      return (
        <View style={styles.container}>
          <SafeAreaView style={styles.contentContainer}>
            <Text style={styles.header}>Admin Ban Violations</Text>
            <Text style={styles.caption}>
              Users with usernames or names matching banned words
            </Text>
    
            {loading ? (
              <Text style={styles.itemText}>Loading...</Text>
            ) : violations.length === 0 ? (
              <Text style={styles.itemText}>No violations found.</Text>
            ) : (
              <FlatList
                data={violations}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item }: { item: ViolationItem }) => (
                  <View style={styles.row}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.username}>{item.username}</Text>
                      <Text style={styles.subText}>
                        {item.firstName} {item.lastName}
                      </Text>
                      {item.matchedFields?.length > 0 ? (
                        item.matchedFields.map((field, index) => (
                          <Text key={index} style={styles.matchedField}>
                            • {field}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.matchedField}>No matches</Text>
                      )}
                    </View>
                  </View>
                )}
              />
            )}
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
        textAlign: "center",
      },
      row: {
        borderBottomWidth: 1,
        borderColor: "#ccc",
        paddingVertical: 10,
      },
      itemInfo: {
        flex: 1,
      },
      username: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#721121",
      },
      subText: {
        fontSize: 14,
        color: "#444",
        marginBottom: 4,
      },
      matchedField: {
        fontSize: 14,
        color: "#c0392b",
        marginLeft: 10,
      },
    });
    
    export default AdminBan;