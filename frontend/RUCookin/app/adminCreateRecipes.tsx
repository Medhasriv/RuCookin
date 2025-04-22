import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';



const AdminCreateRecipe = () => {
  const router = useRouter();
  const isDarkMode = useColorScheme() === 'dark';
  const styles = createStyles(isDarkMode);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [readyInMin, setReadyInMin] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [diets, setDiets] = useState('');
  const [cuisines, setCuisines] = useState('');

  const handleSubmit = async () => {
    if (!title || !instructions || !ingredients) {
      Alert.alert('Missing required fields', 'Please fill in title, instructions, and ingredients.');
      return;
    }

    const payload = {
      title,
      summary,
      readyInMin: readyInMin ? parseInt(readyInMin) : undefined,
      instructions,
      ingredients: ingredients.split(',').map(i => i.trim()),
      diets: diets ? diets.split(',').map(d => d.trim()) : [],
      cuisines: cuisines ? cuisines.split(',').map(c => c.trim()) : [],
    };

    try {
      const response = await fetch('http://localhost:3001/routes/api/adminCreateRecipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Success', 'Recipe created successfully.');
        router.push('/adminHomePage');
      } else {
        console.log('Error', data.message || 'Failed to create recipe.');
      }
    } catch (error) {
      console.error('Error:', error);
      console.log('Error', 'Something went wrong.');
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Recipe</Text>

      <TextInput style={styles.input} placeholder="Title *" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Summary" value={summary} onChangeText={setSummary} />
      <TextInput style={styles.input} placeholder="Ready In Minutes" value={readyInMin} onChangeText={setReadyInMin} keyboardType="numeric" />
      <TextInput style={styles.textArea} placeholder="Instructions *" value={instructions} onChangeText={setInstructions} multiline />
      <TextInput style={styles.input} placeholder="Ingredients (use commas) *" value={ingredients} onChangeText={setIngredients} />
      <TextInput style={styles.input} placeholder="Diets (use commas)" value={diets} onChangeText={setDiets} />
      <TextInput style={styles.input} placeholder="Cuisines (use commas)" value={cuisines} onChangeText={setCuisines} />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Recipe</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
const createStyles = (isDarkMode: boolean) => StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: isDarkMode ? '#111' : '#fff',
      flexGrow: 1,
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 20,
      color: isDarkMode ? '#fff' : '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: '#aaa',
      padding: 10,
      borderRadius: 10,
      marginBottom: 15,
      backgroundColor: isDarkMode ? '#222' : '#f9f9f9',
      color: isDarkMode ? '#fff' : '#000',
    },
    textArea: {
      height: 100,
      borderWidth: 1,
      borderColor: '#aaa',
      padding: 10,
      borderRadius: 10,
      marginBottom: 15,
      backgroundColor: isDarkMode ? '#222' : '#f9f9f9',
      color: isDarkMode ? '#fff' : '#000',
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: '#007aff',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    }
  });

export default AdminCreateRecipe;
