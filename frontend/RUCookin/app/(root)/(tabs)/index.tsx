import { Link, useRouter } from "expo-router";
import { Button, Platform, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider, SafeAreaInsetsContext, useSafeAreaInsets, } from 'react-native-safe-area-context';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "@/app/Login";
import SignUp from "@/app/Login";
export default function Index() {
  const router = useRouter();
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
        adjustsFontSizeToFit={Platform.OS !== 'web'} // Only works on native
      >
        RUCookin
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFCF99',
  },
  iosLogoText: {
    width: 200,
    fontSize: 32,
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
});
