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
  const [firstName, setFirstName] = useState(""); // Handling first name input
  const [lastName, setLastName] = useState(""); // Handling last name input
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Password visibility toggle
  const [errors, setErrors] = useState<{ 
    firstName?: string;
    lastName?: string;
    username?: string;
    password?: string;
    email?: string;
    general?: string;
  }>({}); // Handling errors
  const usernameRef = useRef<TextInput>(null); // Handling lazy username input
  const passwordRef = useRef<TextInput>(null); // Handling lazy password input
  const colorScheme = useColorScheme(); // Handling color scheme
  const isDarkMode = colorScheme === 'dark'; // Checks if dark mode
  const styles = createStyles(isDarkMode); // Changes based on system color scheme
  // Error Handling - Empty Fields
  const validateForm = () => {
    let errors: { firstName?: string; lastName?: string; username?: string; password?: string; email?: string } = {};
    if (!firstName) { errors.firstName = "First name is required."; }
    if (!lastName) { errors.lastName = "Last name is required."; } 
    if (!username) { errors.username = "Username is required."; }
    if (!password) { errors.password = "Password is required."; }
    if (!email) { errors.email = "Email is required."; }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Backend Login Submit Handling - CHANGE LATER
  const handleSignUpSubmit = async () => {
    if (!validateForm()) return;
  
    try {
      const response = await fetch('http://localhost:3001/routes/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, username, password, email }), 
      });
  
      const data = await response.json();
  
      if (response.ok && data.token) {
        console.log('✅ Signup successful:', data);
        console.log("Received token:", data.token);
        localStorage.setItem("token", data.token);
        setErrors({}); // Clear errors
        router.push('/CuisineLikes'); // Redirect CuisineLikes (get to know user)
      } else {
        console.error('❌ Signup failed:', data);
        setErrors({ general: data.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      console.error('❌ Error during signup:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    }
  };
  // Backend Login via Google Handling - CHANGE LATER
  const handleGoogleSignUpSubmit = () => {
    console.log("Google Sign Up"); // debug for now
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
      { errors.general && <Text style={styles.errorStyle}>{errors.general}</Text> }
      
      {/* First Name Input */}
      <TextInput 
        style={styles.inputBoxes} 
        value={firstName}
        onChangeText={setFirstName} 
        placeholder="First Name"
        placeholderTextColor={isDarkMode ? "#7211219A" : "#FFCF999A"}
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {/* Last Name Input */}
      <TextInput 
        style={styles.inputBoxes} 
        value={lastName}
        onChangeText={setLastName} 
        placeholder="Last Name"
        placeholderTextColor={isDarkMode ? "#7211219A" : "#FFCF999A"}
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType="next"
      />

      {/* Email Input */}
      <TextInput 
        style={styles.inputBoxes} 
        value={email} // Password stored here
        onChangeText={setEmail} 
        placeholder="Email"
        placeholderTextColor= {isDarkMode ? "#7211219A" : "#FFCF999A"}
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
        placeholderTextColor= {isDarkMode ? "#7211219A" : "#FFCF999A"}
        keyboardAppearance="default"
        keyboardType="default"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="next"
        ref={usernameRef}
        onSubmitEditing={() => passwordRef.current?.focus()} // i am lazy and like to click enter
      />
      
      {/* Password Input */}
      <View style={styles.passwordContainer}>
        <TextInput 
          style={styles.passwordInput} 
          value={password} 
          onChangeText={setPassword} 
          placeholder="Password"
          placeholderTextColor={isDarkMode ? "#7211219A" : "#FFCF999A"}
          secureTextEntry={!isPasswordVisible} // Hide password when not visible
          keyboardAppearance="default"
          keyboardType="default"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          ref={passwordRef}
          onSubmitEditing={handleSignUpSubmit}
        />
        {/* Show/Hide Button */}
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
          <Text>{isPasswordVisible ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

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
    passwordContainer: {
      flexDirection: 'row',  // Arrange elements in a row
      alignItems: 'center',  // Align text input and button vertically
      width: 327,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 10,
      backgroundColor: isDarkMode ? "#FFCF99" : "#721121",
      margin: 12,
    },
    passwordInput: {
      flex: 1,  // Takes up all available space except for the button
      color: isDarkMode ? "#721121" : "#FFCF99",
      height: 50,
      fontSize: 20,
      fontFamily: 'Inter-Regular',
    },  
    eyeIcon: {
      padding: 10,
      color: isDarkMode ? "#721121" : "#FFCF99",
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },    
  });
}