import React, { useRef, useState } from "react";
import { Link, useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Divider } from "../components/Divider";
import AdminBottomNavBar from "../components/adminBottomNavBar";

export default function AdminSignUp() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === "dark";
  const styles = createStyles(isDarkMode, insets.top);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  // --- ADD THESE REFS ---
  const lastNameRef = useRef<TextInput>(null);
  const emailRef    = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const validateForm = () => {
    const errs: Record<string,string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim())  errs.lastName  = "Last name is required.";
    if (!email.trim())     errs.email     = "Email is required.";
    if (!username.trim())  errs.username  = "Username is required.";
    if (!password)         errs.password  = "Password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUpSubmit = async () => {
    if (!validateForm()) return;
    try {
      const res = await fetch("http://localhost:3001/routes/auth/adminSignUp", {
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

  const handleGoogleSignUp = () => console.log("Google signup");

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Create an Admin Account</Text>

          {errors.general && <Text style={styles.error}>{errors.general}</Text>}
          {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}
          {errors.lastName &&  <Text style={styles.error}>{errors.lastName}</Text>}
          {errors.email &&     <Text style={styles.error}>{errors.email}</Text>}
          {errors.username &&  <Text style={styles.error}>{errors.username}</Text>}
          {errors.password &&  <Text style={styles.error}>{errors.password}</Text>}

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor={styles.placeholder.color}
            value={firstName}
            onChangeText={setFirstName}
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
          />

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
            <TouchableOpacity
              onPress={() => setIsPasswordVisible((v) => !v)}
              style={styles.toggle}
            >
              <Text style={styles.toggleText}>
                {isPasswordVisible ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUpSubmit}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <AdminBottomNavBar activeTab="new_admin" isDarkMode={isDarkMode} />
    </View>
  );
}

// …rest of imports and component above remain the same…

const createStyles = (isDarkMode: boolean, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#000" : "#fff",
      paddingTop: Platform.OS === "android" ? topInset : 0,
    },
    inner: { flex: 1 },
    content: {
      paddingHorizontal: 20,
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
