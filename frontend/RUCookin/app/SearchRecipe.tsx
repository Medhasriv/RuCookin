import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Modal, Text, TextInput, TouchableOpacity, useColorScheme, View, Image, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, {useState, useEffect} from 'react';
import RecipeDisplay from "@/components/RecipeDisplay";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton, Checkbox } from 'react-native-paper';


const router = useRouter();

const SearchRecipe = () => {

  const deviceScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string[]>([]);
  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedIntolerance, setSelectedIntolerance] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('userTheme').then((value) => {
      if (value) setUserTheme(value);
    });
  }, []);
  
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === 'dark';
  const styles = createStyles(isDarkMode);

  const [searchRecipe, setSearchRecipe] = useState("");
  const [result, setResult] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);

  const CuisineList = () => {
    return [
      { label: 'African', value: 'African' },
      { label: 'Asian', value: 'Asian' },
      { label: 'American', value: 'American' },
      { label: 'British', value: 'British' },
      { label: 'Cajun', value: 'Cajun' },
      { label: 'Caribbean', value: 'Caribbean' },
      { label: 'Chinese', value: 'Chinese' },
      { label: 'Eastern European', value: 'Eastern European' },
      { label: 'European', value: 'European' },
      { label: 'French', value: 'French' },
      { label: 'German', value: 'German' },
      { label: 'Greek', value: 'Greek' },
      { label: 'Indian', value: 'Indian' },
      { label: 'Irish', value: 'Irish' },
      { label: 'Italian', value: 'Italian' },
      { label: 'Japanese', value: 'Japanese' },
      { label: 'Jewish', value: 'Jewish' },
      { label: 'Korean', value: 'Korean' },
      { label: 'Latin American', value: 'Latin American' },
      { label: 'Mediterranean', value: 'Mediterranean' },
      { label: 'Mexican', value: 'Mexican' },
      { label: 'Middle Eastern', value: 'Middle Eastern' },
      { label: 'Nordic', value: 'Nordic' },
      { label: 'Southern', value: 'Southern' },
      { label: 'Spanish', value: 'Spanish' },
      { label: 'Thai', value: 'Thai' },
      { label: 'Vietnamese', value: 'Vietnamese' }
    ]; 
  };
  const IntoleranceList = () => {
    return [
      { label: 'Dairy', value: 'Dairy' },
      { label: 'Egg', value: 'Egg' },
      { label: 'Gluten', value: 'Gluten' },
      { label: 'Grain', value: 'Grain' },
      { label: 'Peanut', value: 'Peanut' },
      { label: 'Seafood', value: 'Seafood' },
      { label: 'Sesame', value: 'Sesame' },
      { label: 'Shellfish', value: 'Shellfish' },
      { label: 'Soy', value: 'Soy' },
      { label: 'Sulfite', value: 'Sulfite' },
      { label: 'Tree Nut', value: 'Tree Nut' },
      { label: 'Wheat', value: 'Wheat' }
    ]; 
  };
  const DietList = () => {
    return [
      { label: 'Gluten Free', value: 'Gluten Free' },
      { label: 'Ketogenic', value: 'Ketogenic' },
      { label: 'Vegetarian', value: 'Vegetarian' },
      { label: 'Lacto-Vegetarian', value: 'Lacto-Vegetarian' },
      { label: 'Ovo-Vegetarian', value: 'Ovo-Vegetarian' },
      { label: 'Vegan', value: 'Vegan' },
      { label: 'Pescetarian', value: 'Pescetarian' },
      { label: 'Paleo', value: 'Paleo' },
      { label: 'Primal', value: 'Primal' },
      { label: 'Low FODMAP', value: 'Low FODMAP' },
      { label: 'Whole30', value: 'Whole30' },

    ]; 
  };
  const cuisines = CuisineList();
  const intolerances = IntoleranceList();
  const diets = DietList();

  const handleSearch = async () => { //pass in the filtering params if needed
    // if (searchRecipe.length <= 0) return;
    console.log(searchRecipe);
    
    //joining together the selected options to pass to API
    const selectedCuisinesString = selectedCuisine.join(', ') || '';
    const selectedIntolerancesString = selectedIntolerance.join(', ') || '';

    try {
      const response = await fetch('https://api.spoonacular.com/recipes/complexSearch?query=' + searchRecipe + '&cuisine=' + selectedCuisinesString + '&intolerances=' + selectedIntolerancesString + '&diet=' + selectedDiet +  '&apiKey=7f61e8b31aeb48c8b49e9d4004d77fba', {
        method: 'GET'
      });
      console.log(selectedCuisinesString);
      const data = await response.json();
      if (response.ok) {
        console.log('Search successful:', data);
        console.log('https://api.spoonacular.com/recipes/complexSearch?query=' + searchRecipe + '&cuisine=' + selectedCuisinesString + '&intolerances=' + selectedIntolerancesString + '&diet=' + selectedDiet +  '&apiKey');
        setResult(data.results);
        
      } else {
        console.error('Search failed:', data);
      } }
    catch (error) {
      console.error('Error during search!:', error);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    setList((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
  };
  
  const handleFilter = async () => {
    //close the filter modal
    setModalVisible(!isModalVisible);

    //call on the searchrecipe with the filters!
    handleSearch();
    console.log("searching with filters!");

    if (searchRecipe !== null) {
      console.log('Selected value:', searchRecipe);
    } else {
      console.log('Please select a radio button');
    }
    
  }

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
        onSubmitEditing={handleSearch}
        />
        </View>

        {/* Filter Button */} 

        {/* when the button is pressed, should show the filtering options in the function */}
        <TouchableOpacity style={styles.button} onPress={toggleModal}>
          <Text style={styles.buttonText}>FILTER</Text>
        </TouchableOpacity>

        <Modal visible={isModalVisible}>
            <Text style={styles.buttonText}>Cuisine</Text>
            <ScrollView>
            {cuisines.map((item) => (
              <View key={item.value} style={styles.radioButtonContainer}>
                <Checkbox
                  status={selectedCuisine.includes(item.value) ? 'checked' : 'unchecked'}
                  onPress={() => toggleFilter(selectedCuisine, setSelectedCuisine, item.value)}
                />
                <Text>{item.label}</Text>
              </View>
            ))}
            </ScrollView>
          
            <Text style={styles.buttonText}>Diet</Text>
            <ScrollView style={styles.radioButtonContainer}>
              {diets.map((diet) => (
                <View key={diet.value} style={styles.radioButtonContainer}>
                  <RadioButton
                    value={diet.value}
                    status={selectedDiet === diet.value ? 'checked' : 'unchecked'}
                    onPress={() => setSelectedDiet(diet.value)}
                  />
                  <Text style={styles.radioLabel}>{diet.label}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.buttonText}>Intolerance</Text>
            <ScrollView>
            {intolerances.map((item) => (
              <View key={item.value} style={styles.radioButtonContainer}>
                <Checkbox
                  status={selectedIntolerance.includes(item.value) ? 'checked' : 'unchecked'}
                  onPress={() => toggleFilter(selectedIntolerance, setSelectedIntolerance, item.value)}/>
                <Text>{item.label}</Text>
              </View>
            ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.button} onPress={handleFilter}>
              {/* call on resetting the filtering */}
              <Text style={styles.buttonText}>close</Text>
            </TouchableOpacity>
        </Modal>

        <ScrollView>
            <RecipeDisplay recipes={result} />
        </ScrollView>
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
    },
    button: {

    },
    buttonText: {
      fontSize: 20,
    },

    radioButtonContainer: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    radioLabel: {
      fontSize: 16,
      marginLeft: 8,
    },
  });
}

export default SearchRecipe;
