import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from "react";
import { checkAuth } from "./authChecker"; 

const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';
const styles = createStyles(isDarkMode);
const router = useRouter();

const HomePage = () => {

  useEffect(() => {
    checkAuth(router);
  }, []);
  
  return (
    <View style={styles.container}>
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

      {/* Content! */}
      <SafeAreaView style={styles.contentContainer}>
        <Text>Content!!!</Text>
      </SafeAreaView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/SearchRecipe')}>
          <Text style={styles.navButtonText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/HomePage')}>
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/Pantry')}>
          <Text style={styles.navButtonText}>My Pantry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/Profile')}>
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
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
      flex: 1,
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
    bottomNavContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
      paddingVertical: 10,
    },
    navButton: {
      padding: 10,
    },
    navButtonText: {
      color: isDarkMode ? '#FFCF99' : '#721121',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
}

export default HomePage;
