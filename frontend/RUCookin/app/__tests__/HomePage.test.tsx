// __tests__/HomePage.test.tsx

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    return {
      SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
      useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
  });
  
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
  
  import React from 'react';
  import { render, waitFor } from '@testing-library/react-native';
  import HomePage from '../../app/HomePage';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { SafeAreaProvider } from 'react-native-safe-area-context';
  
  // mocks
  jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn(),
  }));
  jest.mock('../../utils/authChecker', () => ({
    checkAuth: jest.fn(),
  }));
  jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return {
      Ionicons: ({ name }: { name: string }) => (
        <Text testID={`icon-${name}`}>{name}</Text>
      ),
    };
  });
  jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn() }),
  }));
  
  describe('HomePage', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    it('greets and shows time‐of‐day recipes', async () => {
      // force afternoon
      jest.spyOn(Date.prototype, 'getHours').mockReturnValue(15);
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
  
      const { getByText } = render(
        <SafeAreaProvider>
          <HomePage />
        </SafeAreaProvider>
      );
  
      // greeting and content
      await waitFor(() => {
        expect(getByText('Good Afternoon!')).toBeTruthy();
        expect(
          getByText('Your Recipe Picks for the Afternoon!')
        ).toBeTruthy();
        expect(getByText('Lunch Test')).toBeTruthy();
      });
    });
  });
  