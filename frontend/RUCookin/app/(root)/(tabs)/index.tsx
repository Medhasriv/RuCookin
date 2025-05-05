// app/(root)/(tabs)/index.tsx
/**
 * @summary: index.tsx
 * This file represents the landing page of the app.
 * It is the first screen that users see when they open the app.
 * It contains the app's logo and two buttons: one for logging in and one for signing up.
 * The buttons are styled to match the app's color scheme and are accessible for users with different color vision deficiencies.
 * The app's logo is displayed in the center of the screen.
 * The buttons are displayed below the logo.
 * Nothing too fancy or complicated, just a simple and clean design. 
 * 
 * @requirement: U017 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The landing page of the app.
 */

import { Redirect, Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
// DEV TOOLS
// const DEV_START_SCREEN = "/adminCreateRecipeCuisine"; // CHANGE THIS TO THE SCREEN YOU WANT TO START ON
export default function Index() {
  // DEV TOOLS TO SKIP THE LANDING PAGE WHEN WE'RE RUNNING EXPO START
  // if (__DEV__ && DEV_START_SCREEN) {
  //   return <Redirect href={DEV_START_SCREEN} />;
  // }
  // END DEV TOOLS

  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const styles = createStyles(isDarkMode);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* RUCookin Logo/Name */}
      <Text
        style={Platform.select({
          ios: styles.iosLogoText,
          android: styles.iosLogoText, // have not tested
          web: styles.webLogoText,
        })}
        numberOfLines={1}
        adjustsFontSizeToFit={Platform.OS !== 'web'}
      >
        RUCookin'
      </Text>
      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/Login')}>
        <Link href="/Login" style={styles.buttonText}>
          Login
        </Link>
      </TouchableOpacity>
      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/SignUp')}>
        <Link href="/SignUp" style={styles.buttonText}>
          Sign Up
        </Link>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? "#721121" : "#FFCF99",
    },
    iosLogoText: {
      width: 200,
      fontSize: 48,
      fontFamily: 'InknutAntiqua-SemiBold',
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    webLogoText: {
      fontSize: 48,
      fontFamily: 'InknutAntiqua-SemiBold',
      color: isDarkMode ? "#FFCF99" : "#721121",
    },
    button: {
      alignContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      margin:10,
      padding: 14,
      borderRadius: 8,
      width: 327,
    },
    buttonText: {
      alignContent: 'center',
      color: isDarkMode ? "#721121" : "#FFC074",
      fontFamily:'Inter-SemiBold',
      fontSize: 16,
    },
  });
}