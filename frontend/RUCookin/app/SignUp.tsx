import { Link, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput, useColorScheme,View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from "react";
import { Divider } from "../components/Divider";
export default function Index() {
  // Global Variable Declarations
  const router = useRouter(); // Routing through the different screens
  const [username, setUsername] = useState(""); // Handling username input
  const [password, setPassword] = useState(""); // Handling password input
  const [email, setEmail] = useState(""); // Handling email input
  const [errors, setErrors] = useState<{ username?: string; password?: string; email?: string }>({}); // Handling errors
  const usernameRef = useRef<TextInput>(null); // Handling lazy username input
  const passwordRef = useRef<TextInput>(null); // Handling lazy password input
  const colorScheme = useColorScheme(); // Handling color scheme
  const isDarkMode = colorScheme === 'dark'; // Checks if dark mode
  const styles = createStyles(isDarkMode); // Changes based on system color scheme
  // Error Handling - Empty Fields
  const validateForm = () => {
    let errors: { username?: string; password?: string; email?: string } = {};
    if (!username) { errors.username = "Username is required."; }
    if (!password) { errors.password = "Password is required."; }
    if (!email) { errors.email = "Email is required."; }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Backend Login Submit Handling - CHANGE LATER
  const handleSignUpSubmit = () => {
    if (validateForm()) {
      console.log("Submitted", username, password); // debug for now
      setUsername("");
      setPassword("");
      setEmail("");
      setErrors({});
      router.push('/HomePage'); // This function will go to the preferences page. For now, it is going to temp home page.
    }
  };
  // Backend Signup via Google Handling - CHANGE LATER
  const handleGoogleSignUpSubmit = () => {
    console.log("Google Login"); // debug for now
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* RUCookin Logo/Name */}
      <Text
        style={Platform.select({
          ios: styles.iosLogoText,
          android: styles.iosLogoText, // this works, android sucks though
          web: styles.webLogoText,
        })}
        numberOfLines={1}
        adjustsFontSizeToFit={Platform.OS !== 'web'}
      >
        RUCookin'
      </Text>
      
      {/* Create an Account Text */}
      <Text style={styles.headingText}>
        Create an Account
      </Text>
      
      {/* Error Message */}
      { errors.username && <Text style={styles.errorStyle}>{errors.username}</Text> }
      { errors.password && <Text style={styles.errorStyle}>{errors.password}</Text> }
      { errors.email && <Text style={styles.errorStyle}>{errors.email}</Text> }
      
      {/* Email Input */}
      <TextInput 
        style={styles.inputBoxes} 
        value={email} // Password stored here
        onChangeText={setEmail} 
        placeholder="Email"
        placeholderTextColor="#828282" 
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="next"
        onSubmitEditing={() => usernameRef.current?.focus()} // enter go happy
      />

      {/* Username Input */}
      <TextInput 
        style={styles.inputBoxes} 
        value={username} // Username stored here
        onChangeText={setUsername} 
        placeholder="Username"
        placeholderTextColor="#828282"
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="next"
        ref={usernameRef}
        onSubmitEditing={() => passwordRef.current?.focus()} // i am lazy and like to click enter
      />
      
      {/* Password Input */}
      <TextInput 
        style={styles.inputBoxes} 
        value={password} // Password stored here
        onChangeText={setPassword} 
        placeholder="Password"
        placeholderTextColor="#828282"
        secureTextEntry 
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="done"
        ref={passwordRef}
        onSubmitEditing={handleSignUpSubmit} // enter go happy
      />

      {/* Continue Button */} 
      <TouchableOpacity style={styles.button} onPress={handleSignUpSubmit}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Divider for Alternative Log In Options */}
      <Divider isDarkMode={isDarkMode}/>

      {/* Google Login Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUpSubmit}>
        <View style={styles.googleButtonContent}>
          <Image
            source={require('../assets/icons/google.png')}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Sign Up with Google</Text>
        </View>
      </TouchableOpacity>
      
      {/* Sign In Page Link */}
      <Link href="/Login" style={styles.SignInText}>
        Already have an account? Log in here
      </Link>
    </SafeAreaView>
  );
}
function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
      container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#721121' : '#FFCF99',
    },
    headingText:{
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
      margin:10,
      padding: 14,
      borderRadius: 8,
      width: 327,
    },
    buttonText: {
      alignContent: 'center',
      color: isDarkMode ? "#721121" : "#FFFFFF",
      fontFamily:'Inter-SemiBold',
      fontSize: 16,
    },
    SignInText: {
      alignContent: 'center',
      color: isDarkMode ? "#FFC074" : "#A5402D",
      fontFamily:'Inter-SemiBold',
      fontSize: 16,
      marginTop: 10,
    },
    inputBoxes:{
      color: isDarkMode ? "#FFFFFF" : "#000000",
      height: 50,
      margin: 12,
      borderWidth: 1.5,
      padding: 10,
      borderRadius: 10,
      fontSize: 20,
      fontFamily: 'Inter-Regular',
      width: 327,
      backgroundColor: isDarkMode ? "#000000" : "#FFFFFF",
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
  });
}