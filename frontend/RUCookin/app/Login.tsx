import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from "react";
export default function Index() {
  // Global Variable Declarations
  const router = useRouter(); // Routing through the different screens
  const [username, setUsername] = useState(""); // Handling username input
  const [password, setPassword] = useState(""); // Handling password input
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({}); // Handling errors
  const passwordRef = useRef<TextInput>(null); // Handling lazy password input

  // Error Handling - Empty Fields
  const validateForm = () => {
    let errors: { username?: string; password?: string } = {};
    if (!username) { errors.username = "Username is required."; }
    if (!password) { errors.password = "Password is required."; }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Backend Error Handling - CHANGE LATER
  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Submitted", username, password); // debug for now
      setUsername("");
      setPassword("");
      setErrors({});
      router.push('/TempHome'); // This function will go to the home page. For now, it is going to temp home page.
    }
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
      
      {/* Login Text */}
      <Text style={styles.headingText}>
        Log In
      </Text>
      
      {/* Error Message */}
      { errors.username && <Text style={styles.errorStyle}>{errors.username}</Text> }
      { errors.password && <Text style={styles.errorStyle}>{errors.password}</Text> }
      
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
        onSubmitEditing={handleSubmit} // enter go happy
      />

      {/* Login Button */} 
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      
      {/* Sign In Page Link */}
      <Link href="/SignUp" style={styles.SignInText}>
        Already have an account? Sign in here
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFCF99',
  },
  headingText:{
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#000000',
    textAlign: 'center',

  },
  iosLogoText: {
    width: 200,
    fontSize: 48,
    fontFamily: 'InknutAntiqua-SemiBold',
    color: '#721121',
  },
  webLogoText: {
    fontSize: 48,
    fontFamily: 'InknutAntiqua-SemiBold',
    color: '#721121',
  },
  button: {
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: '#721121',
    margin:10,
    padding: 14,
    borderRadius: 8,
    width: 327,
  },
  buttonText: {
    alignContent: 'center',
    color: '#FFFFFF',
    fontFamily:'Inter-SemiBold',
    fontSize: 16,
  },
  SignInText: {
    alignContent: 'center',
    color: '#A5402D',
    fontFamily:'Inter-SemiBold',
    fontSize: 16,
  },
  inputBoxes:{
    color: 'black', // text color
    height: 50,
    margin: 12,
    borderWidth: 1.5,
    padding: 10,
    borderRadius: 10,
    fontSize: 20,
    fontFamily: 'Inter-Regular',
    width: 327,
    backgroundColor: '#FFFFFF',
  },
  errorStyle: {
    color: '#F15156',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 10,
  },
});
