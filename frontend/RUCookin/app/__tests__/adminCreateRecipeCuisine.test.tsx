// app/__tests__/adminCreateRecipeCuisine.test.tsx
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

// Constants so API_BASE === 'http://localhost:3001'
jest.mock('expo-constants', () => ({
  manifest:   { extra: { apiUrl: 'http://localhost:3001' } },
  expoConfig: { extra: { apiUrl: 'http://localhost:3001' } },
}));
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminCreateRecipeCuisine from '../adminCreateRecipeCuisine';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useLocalSearchParams: () => ({ recipeTitle: 'MyRecipe' }),
}));

jest.mock('../../utils/authChecker', () => ({
  checkAuth: () => {},
  checkAdmin: () => {},
}));

(global.fetch as jest.Mock) = jest.fn();

describe('AdminCreateRecipeCuisine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it('navigates on Continue press', async () => {
    const { getByText } = render(<AdminCreateRecipeCuisine />);

    fireEvent.press(getByText('Italian'));
    fireEvent.press(getByText('Continue'));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/adminCreateRecipeDiet',
        params: { recipeTitle: 'MyRecipe' },
      })
    );
  });
});
