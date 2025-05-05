// app/Login.tsx
/**
 * @summary: Login.tsx
 * This is the login page for the RUCookin' app. Users can log in to their account using their username and password.
 * If the user does not have an account, they can get redirected to the Sign Up page.
 * 
 * It's your standard login page with our text logo, username and password input fields, and a login button.
 * Password visibility toggle is also available, so users can "hide" or "show" your password as you type it in.
 * 
 * Passwords are stored in the backend database using bcrypt hashing, and the user is authenticated using JWT tokens.
 * This page handles the login process and redirects the user to the HomePage after successful login.
 * 
 * @requirement: U001 - Account Creation: The system shall allow users to create an account with their first and last name, username, password, and email. 
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The login page for the RUCookin' app.
 */

import { Link, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput, useColorScheme, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from "react";
import { Divider } from "../components/Divider";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run. This is part of requirement U018 - Database Connectivity w/ Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

export default function Index() {
  // Global Variable Declarations
  const router = useRouter(); // Routing through the different screens
  const [username, setUsername] = useState(""); // Handling username input
  const [password, setPassword] = useState(""); // Handling password input
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const passwordRef = useRef<TextInput>(null); // For focusing password input
  const colorScheme = useColorScheme(); // Handling color scheme
  const isDarkMode = colorScheme === 'dark'; // Checks if dark mode
  const styles = createStyles(isDarkMode); // Styles based on system color scheme
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Password visibility toggle

  // Error Handling - Empty Fields
  const validateForm = () => {
    let errors: { username?: string; password?: string } = {};
    if (!username) { errors.username = "Username is required."; }
    if (!password) { errors.password = "Password is required."; }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Backend Login Submit Handling
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_BASE}/routes/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        console.log('Login successful:', data);
        await AsyncStorage.setItem("token", data.token);
        // Decode the token to extract user details
        const jwtDecodeFn = require("jwt-decode").jwtDecode;
        const decoded = jwtDecodeFn(data.token);
        console.log("Decoded token:", decoded);
        const isAdmin = decoded.accountType?.includes("admin");
        console.log(isAdmin)
        // Store the decoded user details in AsyncStorage under "UserInfo"
        await AsyncStorage.setItem("UserInfo", JSON.stringify(decoded));
        setErrors({});
        if (!isAdmin) {
          router.push('/HomePage'); // Navigate to HomePage after login
        }
        else if (isAdmin) {
          router.push('/adminHomePage'); // Navigate to AdminHomePage after login
        }
      } else {
        console.error('Login failed:', data);
        setErrors({ general: data.message || 'Invalid username or password.' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    }
  };

  // Backend Login via Google Handling (debug)
  // const handleGoogleSubmit = () => {
  //   console.log("Google Login");
  // };

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Login Text */}
      <Text style={styles.headingText}>Log In</Text>

      {/* Error Messages */}
      {errors.general && <Text style={styles.errorStyle}>{errors.general}</Text>}
      {errors.username && <Text style={styles.errorStyle}>{errors.username}</Text>}
      {errors.password && <Text style={styles.errorStyle}>{errors.password}</Text>}

      {/* Username Input */}
      <TextInput
        style={styles.inputBoxes}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor={isDarkMode ? "#7211219A" : "#FFCF999A"}
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      {/* Password Input with Show/Hide Button */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? "#7211219A" : "#FFCF999A"}
          secureTextEntry={!isPasswordVisible}
          keyboardAppearance="default"
          keyboardType="default"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          ref={passwordRef}
          onSubmitEditing={handleSubmit}
        />
        {/* Toggle Password Visibility */}
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
          <Text>{isPasswordVisible ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign Up Page Link */}
      <Link href="/SignUp" style={styles.SignInText}>
        Don't have an account? Sign up here
      </Link>
    </SafeAreaView>
  );
}
/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
    },
    headingText: {
      fontFamily: 'Inter-SemiBold',
      fontSize: 24,
      color: isDarkMode ? "#FFFFFF" : "#000000",
      textAlign: 'center',
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
      margin: 10,
      padding: 14,
      borderRadius: 8,
      width: 327,
    },
    buttonText: {
      alignContent: 'center',
      color: isDarkMode ? "#721121" : "#FFFFFF",
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
    },
    SignInText: {
      alignContent: 'center',
      color: isDarkMode ? "#FFC074" : "#A5402D",
      fontFamily: 'Inter-SemiBold',
      fontSize: 16,
      marginTop: 10,
    },
    inputBoxes: {
      color: isDarkMode ? "#721121" : "#FFCF99",
      height: 50,
      margin: 12,
      borderWidth: 1.5,
      padding: 10,
      borderRadius: 10,
      fontSize: 20,
      fontFamily: 'Inter-Regular',
      width: 327,
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
    },
    errorStyle: {
      color: '#F15156',
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      marginTop: 10,
    },
    googleButton: {
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      padding: 14,
      borderRadius: 8,
      width: 327,
      marginTop: 10,
      borderWidth: 1,
      borderColor: isDarkMode ? "#FFC074" : "#A5402D",
    },
    googleButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    googleIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
    },
    googleButtonText: {
      fontFamily: "Inter-SemiBold",
      fontSize: 16,
      color: isDarkMode ? "#721121" : "#FFFFFF",
    },
    eyeIcon: {
      padding: 10,
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: 327,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 10,
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      margin: 12,
    },
    passwordInput: {
      flex: 1,
      color: isDarkMode ? "#721121" : "#FFCF99",
      height: 50,
      fontSize: 20,
      fontFamily: 'Inter-Regular',
    },
  });
}