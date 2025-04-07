import { useRouter } from "expo-router";
import { View, Text, TextInput, FlatList, StyleSheet, useColorScheme, Platform, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from "react";
import { checkAuth, getToken } from "../utils/authChecker"; 
import axios from 'axios';

type PantryItem = {
  _id: string;
  itemName: string;
  quantity: number;
  origin: string;
};

const Pantry = () => {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);

  const router = useRouter();

   useEffect(() => {
    const fetchPantry = async() => {
      try {
        const token = await getToken();
        if (!token) {
          console.error("No token found in storage.");
          return;
        }
        console.log("Token:");
        console.log(await getToken());
        console.log("END");
        const response = await fetch ("http://localhost:3001/routes/api/pantry",
           {
            method: "GET", 
            headers: {
              "Authorization": `Bearer ${token}`,
        },
      });
        const data = await response.json();
        if (response.ok) {
          setPantryItems(data);
        }
        else {
          console.error("❌ Failed to load pantry items:", data.message);
        }
      }
      catch(error) {
        console.error("❌ Error fetching pantry:", error);
      }
    };
      checkAuth(router);
      fetchPantry();
  }, []);

  const handleAddItem = async() => {
    try{
    const token = await getToken();
    if (!searchText.trim()) return;
    const newItem = {
      _id: `${searchText.trim()}-${Date.now()}`,
      itemName: searchText.trim(),
      quantity: 1,
      origin: "Search"
    };
    const payload = { token,
      pantryItems: newItem,
    };
    console.log("🚀 Sending payload:", JSON.stringify(payload));
    const response = await fetch("http://localhost:3001/routes/api/pantry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ pantryItems: newItem}),
    });
    const data = await response.json();
    if(response.ok) {
      setPantryItems([...pantryItems, newItem]);
      setSearchText('');
    }
    else {
      console.error('Data error: ', data)
    }

  } catch(error) {
    console.error('❌ Error during Pantry:', error);
  }

  };

  const handleRemoveItem = async (_id: string) => {
    try{
      const token = await getToken();
      const response = await fetch("http://localhost:3001/routes/api/pantry",{
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({pantryItemId: _id}),
      });
      const data = await response.json();
      console.log(data)
      if (response.ok) { 
        setPantryItems(prevItems => prevItems.filter(item => item._id !== _id));
      } else {
        console.error("Server error:", data.message);
      }
    } catch (error) {
      console.error("❌ Error deleting pantry item:", error);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1 }}>
  {/* RUCookin' Header */}
  <View style={styles.headerBar}>
    <Text
      style={Platform.select({
        ios: styles.iosLogoText,
        android: styles.iosLogoText,
        web: styles.webLogoText,
      })}
      numberOfLines={1}
      adjustsFontSizeToFit={Platform.OS !== 'web'}
    >
      RUCookin'
    </Text>
    <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/Settings')}>
      <Image 
        source={require('../assets/icons/settings.png')}
        style={styles.icon}
      />
    </TouchableOpacity>
  </View>

  {/* Main Content */}
  <View style={styles.container}>
    <Text style={styles.title}>My Pantry</Text>

    <TextInput
      style={styles.searchBar}
      placeholder="Add item to Pantry..."
      placeholderTextColor={isDarkMode ? '#721121' : '#FFCF99'}
      value={searchText}
      onChangeText={setSearchText}
      onSubmitEditing={handleAddItem}
    />

    <FlatList
      data={pantryItems}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.subText}>x{item.quantity} from {item.origin || 'Unknown Recipe'}</Text>
          </View>
          <TouchableOpacity onPress={() => handleRemoveItem(item._id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>❌</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  </View>
</SafeAreaView>

  );
};

export default Pantry;

const createStyles = (isDarkMode: boolean) => StyleSheet.create({
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
      },
  iosLogoText: {
    width: 200,
    fontSize: 30,
    fontFamily: 'InknutAntiqua-SemiBold',
    color: isDarkMode ? "#FFCF99" : "#721121",
  },
  webLogoText: {
    fontSize: 30,
    fontFamily: 'InknutAntiqua-SemiBold',
    color: isDarkMode ? "#FFCF99" : "#721121",
  },
  settingsIcon: {
    padding: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
    //backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: isDarkMode ? '#721121' : '#FFCF99',
    alignSelf: 'flex-start',
  },
  searchBar: {
    width: '60%', 
    alignSelf: 'flex-start',
    backgroundColor: isDarkMode ? '#FFCF99' : '#721121',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor:  isDarkMode ? '#FFCF99' : '#721121',
    paddingVertical: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    fontSize: 12,
    color:  isDarkMode ? '#721121' : '#FFCF99',
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  removeButtonText: {
    fontSize: 18,
    color: 'red',
  },
  button: {
    marginTop: 'auto',
    alignSelf: 'center',
    backgroundColor: isDarkMode ? '#FFCF99' : '#721121',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    color: isDarkMode ? '#721121' : '#FFCF99',
  }
});
