// mock for SafeAreaContext
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: jest.fn(({ children }) => children),
  SafeAreaView: jest.fn(({ children }) => children),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

// mock for gesture handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    ScrollView: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    Gesture: {},
  };
});

// mock for constants to avoid problems with Jest and our Cloud Deployment
jest.mock('expo-constants', () => ({
  manifest: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
  // fallback field name in newer Expo SDKs:
  expoConfig: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
}));

// import statements below above mocks because of rendering issues
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import HomePage from '../../app/HomePage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// mocking AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// mock for authChecker to not require logins for tests
jest.mock('../../utils/authChecker', () => ({
  checkAuth: jest.fn(),
}));

// mock for favorite star icon
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => (
      <Text testID={`icon-${name}`}>{name}</Text> // identify by testID
    ),
  };
});

// mock for expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));


describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // new mock between tests
  });

  it('greets and shows time‐of‐day recipes', async () => {
    // force afternoon (15 = 3 PM)
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(15);
    // no theme stored for sake of test
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    // mock fetch for time‐of‐day
    const fake = {
      id: 200,
      title: 'Lunch Test',
      image: 'url',
      readyInMinutes: 20,
      servings: 3,
      summary: '<p>X</p>',
    };
    (global.fetch as jest.Mock) = jest.fn((url: string) => {
      if (url.includes('type=lunch')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [fake] }),
        });
      }
      return Promise.reject('unexpected');
    });

    // Home page rendered inside SafeAreaProvider to avoid errors
    const { getByText } = render(
      <SafeAreaProvider>
        <HomePage />
      </SafeAreaProvider>
    );

    // "Good ___!" greeting and recipe picks for time of day - UI component
    await waitFor(() => {
      expect(getByText('Good Afternoon!')).toBeTruthy();
      expect(
        getByText('Your Recipe Picks for the Afternoon!')
      ).toBeTruthy();
      expect(getByText('Lunch Test')).toBeTruthy();
    });
  });
});
  