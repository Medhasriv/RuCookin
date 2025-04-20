import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { checkAuth,getTokenData } from "../utils/authChecker";  

const INTOLERANCES = [
  'Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 
  'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'
];

const IntolerancePreferences = () => {
  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const styles = createStyles(isDarkMode);
  const router = useRouter();

    useEffect(() => {
      checkAuth(router);
  }, []);

  const toggleIntoleranceSelection = (intolerance: string) => {
    setSelectedIntolerances((prevSelected) =>
      prevSelected.includes(intolerance)
        ? prevSelected.filter((item) => item !== intolerance)
        : [...prevSelected, intolerance]
    );
  };

  const handleContinue = async () => {
    console.log('Selected Intolerances:', selectedIntolerances);
     try {
          const username = await getTokenData("username");
        if (!username) {
          console.error("Username not found in token.");
          return;
        }
        const payload = { username: username.trim(),
          intolerance:Array.isArray(selectedIntolerances) ? [...selectedIntolerances] : [],
        };
        console.log("🚀 Sending payload:", JSON.stringify(payload));
          const response = await fetch("http://localhost:3001/routes/api/intolerance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: username.trim(),
              intolerance:Array.isArray(selectedIntolerances) ? [...selectedIntolerances] : [],
            }), 
          });
          const data = await response.json();
          if(response.ok) {
            router.push('/HomePage');
          }
          else {
            console.error('Data error: ', data)
          }
        }
        catch (error) {
          console.error('❌ Error during Intolerances:', error);
        }
    
    
        //console.log('Selected Cuisines:', selectedCuisines);
        
      };
    

  return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.heading}>Almost done. Select your food intolerances</Text>
    
          {/* body flexes to fill, centres grid vertically */}
          <View style={styles.body}>
            <FlatList
              data={INTOLERANCES}
              numColumns={3}
              keyExtractor={(item) => item}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const selected = selectedIntolerances.includes(item);
                return (
                  <TouchableOpacity
                    style={[styles.pill, selected && styles.pillSelected]}
                    onPress={() => toggleIntoleranceSelection(item)}
                  >
                    <Text style={[styles.pillText, selected && styles.pillTextSel]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
    
          {/* fixed near bottom */}
          <TouchableOpacity style={styles.continue} onPress={handleContinue}>
            <Text style={styles.continueTxt}>Continue</Text>
          </TouchableOpacity>
        </SafeAreaView>
    );
};

const createStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? "#721121" : "#FFCF99",
      paddingTop: 10,
    },
    heading: {
      fontFamily: "Inter-SemiBold",
      fontSize: 24,
      textAlign: "center",
      color: dark ? "#FFF" : "#000",
      marginTop: 25,
      marginBottom: 4,
    },

    /* centre grid vertically */
    body: { 
      flex: 1, 
      justifyContent: "flex-start", 
      marginTop: 50,
    },
    listContent: { 
      flexGrow: 1, 
      justifyContent: "flex-start",
    },
    row: { justifyContent: "space-evenly" },

    pill: {
      flex: 1,
      flexBasis: "30%",
      margin: 8,
      paddingVertical: 10,
      borderRadius: 20,
      backgroundColor: dark ? "#FFCF99" : "#721121",
      alignItems: "center",
    },
    pillSelected: {
      backgroundColor: dark ? "#FFC074" : "#A5402D",
    },
    pillText: {
      fontFamily: "Inter-Regular",
      fontSize: 12,
      color: dark ? "#721121" : "#FFCF99",
      textAlign: "center",
    },
    pillTextSel: { fontWeight: "600" },

    continue: {
      marginHorizontal: 20,
      marginBottom: 24, /* leaves space for home‑indicator */
      padding: 15,
      borderRadius: 8,
      backgroundColor: dark ? "#FFCF99" : "#721121",
    },
    continueTxt: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      color: dark ? "#721121" : "#FFFFFF",
      textAlign: "center",
    },
  });

export default IntolerancePreferences;
