// mock for SafeAreaContext
jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    return {
      SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
      ),
      useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
  });

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

// import statements below above mocks because of rendering issues
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import SavedRecipes from '../../app/SavedRecipes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTokenData, getToken } from '../../utils/authChecker';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// mock for AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

// mock for authChecker to not require logins for tests
jest.mock('../../utils/authChecker', () => ({
  getTokenData: jest.fn(),
  getToken: jest.fn(),
  checkAuth: jest.fn(),
}));

// mock for favorite star icon
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }: { name: string }) => (
      <Text testID={`icon-${name}`}>{name}</Text>
    ),
  };
});

// mock for expo-router
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn() }),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

describe('SavedRecipes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // case for when no saved recipes are found
  it('shows empty message when no saved recipes', async () => {
    // no stored theme
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    // auth
    (getTokenData as jest.Mock).mockResolvedValue('user');
    (getToken as jest.Mock).mockResolvedValue('tok');
    // first fetch: GET favorites → []
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    // display results in SafeAreaProvider
    const { getByText } = render(
      <SafeAreaProvider>
        <SavedRecipes />
      </SafeAreaProvider>
    );
    await waitFor(() => {
      expect(
        getByText("You haven’t saved any recipes yet.")
      ).toBeTruthy();
    });
  });

  // case for when saved recipes are found
  it('loads and displays saved recipes when API returns data', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');
    (getTokenData as jest.Mock).mockResolvedValue('alice');
    (getToken as jest.Mock).mockResolvedValue('tok');

    // mock fetch sequence:
    // 1) GET favoriteRecipe → [42]
    // 2) GET informationBulk → [{ id, title, image, readyInMinutes, servings, summary }]
    const fakeRecipe = {
      id: 42,
      title: "Test Recipe",
      image: "https://img",
      readyInMinutes: 15,
      servings: 2,
      summary: "<p>ABC</p>"
    };
    (global.fetch as jest.Mock) = jest
      .fn()
      .mockImplementation((url: string) => {
        if (url.includes('/routes/api/favoriteRecipe')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([42]),
          });
        }
        if (url.includes('informationBulk')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([fakeRecipe]),
          });
        }
        return Promise.reject(new Error("unexpected fetch: " + url));
      });
      
    // display results in SafeAreaProvider
    const { getByText } = render(
      <SafeAreaProvider>
        <SavedRecipes />
      </SafeAreaProvider>
    );
    await waitFor(() => {
      expect(getByText("Test Recipe")).toBeTruthy();
    });
  });
});
