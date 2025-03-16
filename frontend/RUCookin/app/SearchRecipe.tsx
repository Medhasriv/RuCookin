import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useState, useEffect} from 'react';
import RecipeDisplay from "@/components/RecipeDisplay";

const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';
const styles = createStyles(isDarkMode);
const router = useRouter();

const SearchRecipe = () => {
  const [searchRecipe, setSearchRecipe] = useState("");
  const [result, setResult] = useState([]);
  const handleChange = async () => {
    // if (searchRecipe.length <= 0) return;
    console.log(searchRecipe);
    try {
      const response = await fetch('https://api.spoonacular.com/recipes/complexSearch?query=' + searchRecipe + '&apiKey=9c396355ebfb4dd08de141e25dd55182', {
        method: 'GET'
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Search successful:', data);
        setResult(data.results);
      } else {
        console.error('Search failed:', data);
      } }
    catch (error) {
      console.error('Error during search!:', error);
    }
  };

  useEffect(() => {
    console.log('Updated result:', result); // This will log when the result state changes
  }, [result]); // This effect runs when result changes
  
  return (
    <View>
      <SafeAreaView style={styles.titleContainer}>
        {/* RUCookin Logo/Name */}
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
        {/* Settings Gear Icon */}
        <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/Settings')}>
          <Image 
            source={require('../assets/icons/settings.png')}
            style={styles.icon} // Apply styling to adjust the size
          />
        </TouchableOpacity>
      </SafeAreaView>

      <View>
      {/*Search bar*/}
      <TextInput 
        value={searchRecipe} 
        onChangeText={setSearchRecipe} 
        placeholder="Search..."
        placeholderTextColor= {isDarkMode ? "#7211219A" : "#FFCF999A"}
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={handleChange}
        />
        </View>

        <View>
        <div>
            <RecipeDisplay recipes={result} />
        </div>
        </View>
        
    </View>
  );
};

function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
    },
    contentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
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
      width: 30, // Adjust width and height as per your design
      height: 30,
    }
  });
}

export default SearchRecipe;
