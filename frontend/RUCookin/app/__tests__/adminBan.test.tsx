// app/__tests__/adminBan.test.tsx
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
import AdminBan from '../adminBan';

jest.mock('../../utils/authChecker', () => ({
  checkAuth: () => {},
  checkAdmin: () => {},
  getToken: () => Promise.resolve('fake-token'),
}));

(global.fetch as jest.Mock) = jest.fn();

describe('AdminBan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders header and shows no ban words when empty', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // ban words
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }); // violations

    const { getByText } = render(<AdminBan />);
    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2)
    );
    expect(getByText('Manage Ban Words')).toBeTruthy();
    expect(getByText('No ban words yet.')).toBeTruthy();
    expect(getByText('No violations found.')).toBeTruthy();
  });

  it('adds a new ban word when "Add" is pressed', async () => {
    // initial fetches
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    const { getByPlaceholderText, getByText } = render(<AdminBan />);
    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2)
    );

    // POST-add + two refetches
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })          // add
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ word: 'spoiler' }]) }) // refetch words
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });         // refetch violations

    fireEvent.changeText(
      getByPlaceholderText('Add new ban word'),
      'spoiler'
    );
    fireEvent.press(getByText('Add'));

    await waitFor(() =>
      expect((global.fetch as jest.Mock).mock.calls.length).toBe(2 + 3)
    );
    expect(getByText('• spoiler')).toBeTruthy();
  });
});
