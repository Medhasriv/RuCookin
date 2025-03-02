import { Link, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
export default function Index() {
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