import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';
import { View, StyleSheet, SafeAreaView, useColorScheme, Pressable, Alert } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const LoginPage: React.FC = () => {
  const theme = useColorScheme();
  const inputStyle = theme === 'dark' ? styles.DarkStyle : styles.LightStyle;
  const viewStyle = theme === 'dark' ? styles.darkView : styles.lightView;
  const buttonStyle = theme === 'dark' ? styles.darkButton : styles.lightButton;

  const [text, onChangeText] = React.useState('Username');

  return (
    <ThemedView style={[styles.viewContainer, viewStyle]}>
      <ThemedText style={[styles.pagetitle]}>RUCookin!</ThemedText>

      <ThemedText style={[styles.subtitle]}>Login Here!</ThemedText>
      <SafeAreaView>
        <TextInput
          style={[styles.input, inputStyle]}
          onChangeText={onChangeText}
          value={"Username"}
        />
        <TextInput
          style={[styles.input, inputStyle]}
          onChangeText={onChangeText}
          value={"Password"}
        />
        <Pressable style={[styles.button, buttonStyle]}
            onPress={() => Alert.alert('Button pressed')}>
          <ThemedText style={styles.subtitle}>Continue</ThemedText>
        </Pressable>
        </SafeAreaView>

        <ThemedText style={[styles.subtitle]}>or create an account!</ThemedText>
        <SafeAreaView>
          <TextInput
            style={[styles.input, inputStyle]}
            onChangeText={onChangeText}
            value={"Enter your email"}
          />

        <Pressable style={[styles.button, buttonStyle]}
            onPress={() => Alert.alert('Button pressed')}>
          <ThemedText style={styles.subtitle}>Create an account!</ThemedText>
        </Pressable>
        </SafeAreaView>

    </ThemedView>
  );
};
const styles = StyleSheet.create({

  viewContainer: {
    flex: 1,
    padding: 20, 
  },
  darkView: {
    backgroundColor: 'black',
    color: '#5C374C', //TODO: FOR SOME REASON THE TEXT IS NOT PURPLE ON DARK MODE!!
  },
  lightView: {
    backgroundColor: '#FAA275',
    color: 'black',
  },

  pagetitle: {
    textAlign: "center",
    fontWeight: "bold",
    paddingTop: 30,
    paddingBottom: 60,
    fontSize: 50,
  },
  subtitle: {
    padding: 20,
    textAlign: "center",
    fontSize: 20,
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
    color: '#5C374C',
    borderColor: '#5C374C',
  },
  LightStyle: {
    backgroundColor: 'white',
    color: 'black',
    borderColor: 'black'
  },

  button: {
    borderRadius: 10,
    paddingHorizontal: -5, // #TODO: BUTTON SIZE SMALLER
  },

  darkButton:{
    backgroundColor: '#5C374C',
  },
  
  lightButton:{
    backgroundColor: 'white',
  },
});

export default LoginPage;

