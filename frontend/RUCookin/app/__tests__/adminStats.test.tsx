// app/__tests__/adminStats.test.tsx
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
import { render, waitFor } from '@testing-library/react-native';
import AdminStats from '../adminStats';

jest.mock('../../utils/authChecker', () => ({
  checkAuth: () => {},
  checkAdmin: () => {},
  getToken: () => Promise.resolve('token'),
}));

(global.fetch as jest.Mock) = jest.fn();

describe('AdminStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders analytics sections after fetch', async () => {
    // first call: favorite recipes
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ _id: 'A', count: 10 }]),
      })
      // second call: other stats
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ totalUsers: 5 }),
      });

    const { getByText } = render(<AdminStats />);

    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2)
    );
    expect(getByText('Admin Analytics')).toBeTruthy();
    expect(getByText('Favorite Recipes')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
  });
});
