import { Link, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, TextInput, useColorScheme,View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRef, useState } from "react";
import { Divider } from "../components/Divider";
import React from 'react';

const colorScheme = useColorScheme(); // Handling color scheme
const isDarkMode = colorScheme === 'dark'; // Checks if dark mode
const styles = createStyles(isDarkMode);

const HomePage = () => {
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
        </SafeAreaView>
        {/* Content! */}
        <SafeAreaView style={styles.contentContainer}>
            <Text>
                Content!!!
            </Text>
        </SafeAreaView>
    </View>

    //settings gear icon to the right
  );
};

function createStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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
  });
}

export default HomePage