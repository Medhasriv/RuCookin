// app/__tests__/adminCreateRecipeDiet.test.tsx
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
import AdminCreateRecipeDiet from '../adminCreateRecipeDiet';

// single shared push mock
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useLocalSearchParams: () => ({ recipeTitle: 'MyRecipe' }),
}));

// stub out authChecker so checkAuth/checkAdmin don't block rendering
jest.mock('../../utils/authChecker', () => ({
  checkAuth: () => {},
  checkAdmin: () => {},
  getTokenData: jest.fn().mockResolvedValue('user'),
}));

// mock fetch once and cast it to jest.Mock
(global.fetch as jest.Mock) = jest.fn();

describe('AdminCreateRecipeDiet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (global.fetch as jest.Mock).mockClear();
    // default stub for any fetch
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it('navigates on Continue press', async () => {
    const { getByText } = render(<AdminCreateRecipeDiet />);

    // select a diet then press Create
    fireEvent.press(getByText('Vegan'));
    fireEvent.press(getByText('Create Recipe'));

    // wait for the async nav call
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith('/adminHomePage')
    );
  });
});
