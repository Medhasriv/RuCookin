// import { View, Text } from 'react-native'
// import React from 'react'

// const SignIn = () => {
//   return (
//     <View>
//       <Text>Sign Up!</Text>
//     </View>
//   )
// }

// export default SignIn

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { View, StyleSheet, SafeAreaView, useColorScheme, Pressable, Alert, Platform, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Link, useRouter } from "expo-router";
import {  } from "react-native";

const LoginPage: React.FC = () => {
  const theme = useColorScheme();
  const inputStyle = theme === 'dark' ? styles.DarkStyle : styles.LightStyle;
  const viewStyle = theme === 'dark' ? styles.darkView : styles.lightView;
  const buttonStyle = theme === 'dark' ? styles.darkButton : styles.lightButton;

  const [text, onChangeText] = React.useState('Username');

  return (
    <ThemedView style={[styles.viewContainer, viewStyle]}>
      <Text
        style={Platform.select({
          ios: styles.iosLogoText,
          android: styles.iosLogoText, // have not tested
          web: styles.webLogoText,
        })}
        adjustsFontSizeToFit={Platform.OS !== 'web'}
      >
        RUCookin
      </Text>

      <ThemedText style={[styles.subtitle]}>Sign up!</ThemedText>
      <SafeAreaView>
        <TextInput
          style={[styles.input, inputStyle]}
          onChangeText={onChangeText}
          value={"Enter your email"}
        />
        <TextInput
          style={[styles.input, inputStyle]}
          onChangeText={onChangeText}
          value={"Enter a username"}
        />
        <TextInput
          style={[styles.input, inputStyle]}
          onChangeText={onChangeText}
          value={"Enter a password"}
        />
        <Pressable style={[styles.button, buttonStyle]}
            onPress={() => Alert.alert('Button pressed')}>
          <ThemedText style={styles.buttonText}>Continue</ThemedText>
        </Pressable>
        </SafeAreaView>

    </ThemedView>
  );
};
const styles = StyleSheet.create({

  viewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkView: {
    backgroundColor: 'black',
  },
  lightView: {
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

  subtitle: {
    padding: 10,
    textAlign: "center",
    fontSize: 20,
    fontFamily: 'InknutAntiqua-SemiBold',
    color: '#721121',
  },

  input: {
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 20,
  },
  DarkStyle: {
    backgroundColor: 'black',
    color: '#FFCF99',
    borderColor: '#FFCF99',
  },
  LightStyle: {
    backgroundColor: 'white',
    color: 'black',
    borderColor: 'black'
  },

  button: {
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#721121',
    margin:10,
    padding: 15,
    width: 330,
  },
  buttonText:{
    color: 'black',
    fontFamily:'Inter-SemiBold',
  },
  darkButton:{
    backgroundColor: '#FFCF99',
  },
  lightButton:{
    backgroundColor: '#721121',
  },

});

export default LoginPage;

