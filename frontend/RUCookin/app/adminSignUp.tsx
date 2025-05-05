// app/adminSignUp.tsx
/**
 * @summary: adminSignUp.tsx
 * This is the screen where admins can create other admin accounts.
 * This file is part of the set of screens that are only accessible to admin users once they are logged in.
 * 
 * @requirement: U001 - Account Creation: The system shall allow users to create an account with their first and last name, username, password, and email.
 * @requirement: UO17 - User Experience/User Design: The system shall have a UI/UX design that is easy for any user to navigate, boosting user engagement.
 * @requirement: U018 - Database Connectivity w/ Google Cloud Run: The system shall connect to the database using Google Cloud Run, ensuring that calls are returned promptly.
 * @requirement: U019 - Cross-Platform Accessibility: The system shall be able to run on a web browser, an iOS application, and an Android application. The system shall be developed using React Native, allowing for simultaneous development.
 * 
 * @author: Team SWEG
 * @returns: The Admin Sign Up screen, where admins can create other admin accounts.
 */

import React, { useRef, useState } from "react";
import { Link, useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Divider } from "../components/Divider";
import AdminBottomNavBar from "../components/adminBottomNavBar";
import { LogBox } from "react-native";
import Constants from 'expo-constants';

// Connect to the backend API hosted on Google Cloud Run. This is part of requirement U018 - Database Connectivity w/ Google Cloud Run
const API_BASE = Constants.manifest?.extra?.apiUrl ?? (Constants.expoConfig as any).expo.extra.apiUrl;

// ignore warning about nested scroll views. this is an intentional design choice, not a bug.
LogBox.ignoreLogs([
  "VirtualizedLists should never be nested inside plain ScrollViews"
]);

export default function AdminSignUp() {
  const router = useRouter(); // Navigation router
  const insets = useSafeAreaInsets(); // Safe area insets for padding
  const isDarkMode = useColorScheme() === "dark"; // Boolean for dark mode
  const styles = createStyles(isDarkMode, insets.top); // Dynamic styles based on theme and safe area insets

  const [firstName, setFirstName] = useState(""); // State to hold first name
  const [lastName, setLastName] = useState(""); // State to hold last name
  const [email, setEmail] = useState(""); // State to hold email
  const [username, setUsername] = useState(""); // State to hold username
  const [password, setPassword] = useState(""); // State to hold password
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State to toggle password visibility
  const [errors, setErrors] = useState<Record<string,string>>({});  // State to hold validation errors

  const lastNameRef = useRef<TextInput>(null); // Ref for last name input
  const emailRef    = useRef<TextInput>(null); // Ref for email input
  const usernameRef = useRef<TextInput>(null); // Ref for username input
  const passwordRef = useRef<TextInput>(null); // Ref for password input

  const validateForm = () => {
    const errs: Record<string,string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required."; // Validate first name is in the form
    if (!lastName.trim())  errs.lastName  = "Last name is required."; // Validate last name is in the form
    if (!email.trim())     errs.email     = "Email is required."; // Validate email is in the form
    if (!username.trim())  errs.username  = "Username is required."; // Validate username is in the form
    if (!password)         errs.password  = "Password is required."; // Validate password is in the form
    setErrors(errs);
    return Object.keys(errs).length === 0; // Return true if no errors
  };

  const handleSignUpSubmit = async () => { // Handle form submission
    if (!validateForm()) return;
    try {
      const res = await fetch(`${API_BASE}/routes/auth/adminCreateAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        await AsyncStorage.setItem("token", data.token);
        router.push("/adminHomePage");
      } else {
        setErrors({ general: data.message || "Signup failed. Try again." });
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: "Something went wrong. Please try again." });
    }
  };

  // Render component
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header/Screen Title */}
          <Text style={styles.title}>Make Admin Account</Text>

          {errors.general && <Text style={styles.error}>{errors.general}</Text>}
          {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}
          {errors.lastName &&  <Text style={styles.error}>{errors.lastName}</Text>}
          {errors.email &&     <Text style={styles.error}>{errors.email}</Text>}
          {errors.username &&  <Text style={styles.error}>{errors.username}</Text>}
          {errors.password &&  <Text style={styles.error}>{errors.password}</Text>}

          {/* Form Inputs */}

          {/* First Name */}
          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={styles.placeholder.color}
            value={firstName}
            onChangeText={setFirstName}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
          />
          {/* Last Name */}
          <TextInput
            ref={lastNameRef}
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor={styles.placeholder.color}
            value={lastName}
            onChangeText={setLastName}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
          {/* Email */}
          <TextInput
            ref={emailRef}
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={styles.placeholder.color}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            returnKeyType="next"
            onSubmitEditing={() => usernameRef.current?.focus()}
          />
          {/* Username */}
          <TextInput
            ref={usernameRef}
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={styles.placeholder.color}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          {/* Password */}
          <View style={styles.passwordContainer}>
            <TextInput
              ref={passwordRef}
              style={styles.inputFlex}
              placeholder="Password"
              placeholderTextColor={styles.placeholder.color}
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleSignUpSubmit}
            />
            {/* Toggle Password Visibility */}
            <TouchableOpacity
              onPress={() => setIsPasswordVisible((v) => !v)}
              style={styles.toggle}
            >
              <Text style={styles.toggleText}>
                {isPasswordVisible ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Submit Button */}
          <TouchableOpacity style={styles.button} onPress={handleSignUpSubmit}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <AdminBottomNavBar activeTab="new_admin" isDarkMode={isDarkMode} />
    </View>
  );
}

/* ---------- styles ---------- */
// Function to generate styles based on theme (dark or light)
const createStyles = (isDarkMode: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
      paddingTop: Platform.OS === "android" ? topInset : 0,
    },
    inner: { flex: 1 },
    content: {
      padding: 20,
      paddingBottom: 100,
      alignItems: "center",
    },
    logo: {
      fontSize: 36,
      fontWeight: "700",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginVertical: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      color: isDarkMode ? "#FFCF99" : "#721121",
      marginBottom: 24,
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      color: isDarkMode ? "#fff" : "#000",
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    placeholder: {
      color: isDarkMode ? "#777" : "#999",
    },

    // ← UPDATED: box style restored here
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? "#666" : "#ccc",
      backgroundColor: isDarkMode ? "#1e1e1e" : "#f9f9f9",
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    inputFlex: {
      flex: 1,
      color: isDarkMode ? "#fff" : "#000",
      paddingVertical: 12,
    },
    toggle: {
      padding: 12,
    },
    toggleText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontWeight: "600",
    },

    button: {
      width: "100%",
      backgroundColor: isDarkMode ? "#721121" : "#ffc074",
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 24,
    },
    buttonText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontSize: 16,
      fontWeight: "600",
    },
    divider: {
      width: "80%",
      marginVertical: 16,
    },
    googleButton: {
      width: "100%",
      borderWidth: 1,
      borderColor: isDarkMode ? "#ffc074" : "#721121",
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 24,
    },
    googleContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    googleIcon: {
      width: 20,
      height: 20,
      marginRight: 8,
    },
    googleText: {
      color: isDarkMode ? "#fff" : "#721121",
      fontSize: 16,
      fontWeight: "600",
    },
    linkText: {
      color: isDarkMode ? "#ffc074" : "#721121",
      fontSize: 14,
      marginBottom: 16,
    },
    error: {
      color: "#F15156",
      marginBottom: 8,
      width: "100%",
      textAlign: "left",
    },
  });
