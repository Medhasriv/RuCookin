import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from "react";
import { checkAuth } from "./authChecker"; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';
const styles = createStyles(isDarkMode);
const router = useRouter();

const HomePage = () => {
  const deviceScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<string | null>(null);
  
  useEffect(() => {
    // Try to load user theme preference
    AsyncStorage.getItem('userTheme').then((value) => {
      if (value) setUserTheme(value);
    });
    checkAuth(router);
  }, []);
  
  // If user is logged in and has set a theme, use it; otherwise, use device theme.
  const effectiveTheme = userTheme ? userTheme : deviceScheme;
  const isDarkMode = effectiveTheme === 'dark';
  
  const styles = createStyles(isDarkMode);
  
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

      {/* Content! */}
      <SafeAreaView style={styles.contentContainer}>
        <Text>Content!!!</Text>
      </SafeAreaView>
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

export default HomePage;
