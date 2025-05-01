// app/__tests__/adminCreateRecipes.test.tsx
// 1) stub expo-constants so Constants.manifest.extra.apiUrl exists:
jest.mock('expo-constants', () => ({
manifest:  { extra: { apiUrl: 'http://localhost:3001' } },
expoConfig: { extra: { apiUrl: 'http://localhost:3001' } },
}));

// 2) stub router so it never tries to use real EventEmitter:
jest.mock('expo-router', () => ({
useRouter: () => ({ push: jest.fn() }),
}));

// 3) stub SafeAreaContext to bypass native
jest.mock('react-native-safe-area-context', () => ({
SafeAreaProvider:  jest.fn(({ children }) => children),
SafeAreaView:      jest.fn(({ children }) => children),
useSafeAreaInsets: jest.fn(() => ({ top:0, right:0, bottom:0, left:0 })),
}));

// 4) stub your AdminBottomNavBar so it doesn’t pull in native code:
jest.mock('../../components/adminBottomNavBar', () => () => null);

// SafeAreaContext mocks
jest.mock('react-native-safe-area-context', () => ({
SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
SafeAreaView:     ({ children }: { children: React.ReactNode }) => children,
useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// NavigationContainer mock
jest.mock('@react-navigation/native', () => ({
NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
// if you ever call hooks:
useNavigation: () => ({ navigate: jest.fn(), push: jest.fn() }),
useRoute: () => ({ params: {} }),
}));

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminCreateRecipes from '../adminCreateRecipes';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('../../utils/authChecker', () => ({ checkAuth: () => {}, checkAdmin: () => {} }));

(global.fetch as jest.Mock) = jest.fn();

describe('AdminCreateRecipes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it('renders form fields and button', () => {
    const { getByPlaceholderText, getByText } = render(<AdminCreateRecipes />);
    expect(getByPlaceholderText('Title *')).toBeTruthy();
    expect(getByPlaceholderText('Instructions *')).toBeTruthy();
    expect(
      getByPlaceholderText('Ingredients (comma-separated) *')
    ).toBeTruthy();
    expect(getByText('Continue Making the Recipe')).toBeTruthy();
  });

  it('submits payload and navigates', async () => {
    const { getByPlaceholderText, getByText } = render(<AdminCreateRecipes />);

    fireEvent.changeText(getByPlaceholderText('Title *'), 'Test');
    fireEvent.changeText(
      getByPlaceholderText('Instructions *'),
      'Do it'
    );
    fireEvent.changeText(
      getByPlaceholderText('Ingredients (comma-separated) *'),
      'a,b'
    );
    fireEvent.press(getByText('Continue Making the Recipe'));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/adminCreateRecipeCuisine',
        params: { recipeTitle: 'Test' },
      })
    );
  });
});
