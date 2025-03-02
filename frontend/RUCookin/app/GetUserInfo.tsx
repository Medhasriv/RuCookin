import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

const colorScheme = useColorScheme();
const isDarkMode = colorScheme === 'dark';
const styles = createStyles(isDarkMode);
const router = useRouter();

const GetUserInfo = () => {
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
        <Text>THIS IS THE GET USER INFORMATION PAGE!!!</Text>
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

export default GetUserInfo;
