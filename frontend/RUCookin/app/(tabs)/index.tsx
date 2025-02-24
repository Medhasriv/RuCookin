import React, { useEffect, useState } from 'react';
import { Image, Text, StyleSheet, Platform, ActivityIndicator, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import LoginPage from './LoginPage'; // importing Login Page

export default function HomeScreen() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessageFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to determine the correct backend URL
  // Adjust this to match your environment.
  // If you're testing on Android emulator, use '10.0.2.2'.
  // If you're on iOS simulator or web, 'localhost' often works.
  // If you're on a real device, use your LAN IP (e.g., 192.168.x.x).
  function getBackendURL() {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/';
    }
    return 'http://localhost:3001/';
  }

  async function fetchMessageFromBackend() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getBackendURL());
      if (!response.ok) {
        throw new Error(`Server error! Status: ${response.status}`);
      }
      const text = await response.text(); // or response.json() if your endpoint returns JSON
      setMessage(text);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  // If the data is loading, show a spinner
  if (loading) {
    return (
      <ThemedView style={[styles.centerContainer]}>
        <ActivityIndicator size="large" color="#666" />
        <ThemedText>Loading data from backend...</ThemedText>
      </ThemedView>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <ThemedView style={[styles.centerContainer]}>
        <ThemedText type="subtitle" style={{ color: 'red' }}>
          {`Error: ${error}`}
        </ThemedText>
      </ThemedView>
    );
  }

  // Otherwise, render the homepage!
  return (

    <ThemedView >
      <LoginPage />
      <ThemedText >{message ? `Message: ${message}` : 'No message received yet'}</ThemedText>
    </ThemedView>

      /* Original instructions */
      /* <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
        </ThemedText>
      </ThemedView> */

      /* ...the other original steps remain unchanged... */
      /* <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>Tap the Explore tab to learn more about this starter app.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>.
        </ThemedText>
      </ThemedView> 

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4: Backend Data</ThemedText>
        <ThemedText>Message from backend:</ThemedText>
        <ThemedText type="defaultSemiBold">{message || 'No message received yet.'}</ThemedText>
      </ThemedView>
      */
  );
}

// Styles
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
