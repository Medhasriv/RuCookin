// app/__tests__/adminModifyAccount.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminModifyAccount from '../adminModifyAccount';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// ── FlatList mock ───────────────────────────────────────────────────────────
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  const { View } = require('react-native');
  return (props: any) => (
    <View>
      {props.ListHeaderComponent}
      {props.data.map((item: any, index: number) =>
        props.renderItem({ item, index })
      )}
    </View>
  );
});

// ── Expo Constants ───────────────────────────────────────────────────────────
jest.mock('expo-constants', () => ({
  manifest:   { extra: { apiUrl: 'http://localhost:3001' } },
  expoConfig: { extra: { apiUrl: 'http://localhost:3001' } },
}));

// ── Router stub ──────────────────────────────────────────────────────────────
const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));

// ── AuthChecker stub ─────────────────────────────────────────────────────────
jest.mock('../../utils/authChecker', () => ({
  checkAuth:  jest.fn(),
  checkAdmin: jest.fn(),
  getToken:   jest.fn(() => Promise.resolve('fake-token')),
}));

// ── SafeAreaContext stub ─────────────────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider:  ({ children }: any) => children,
  SafeAreaView:      ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// ── BottomNavBar stub ────────────────────────────────────────────────────────
jest.mock('../../components/adminBottomNavBar', () => () => null);

// ── NavigationContainer stub ─────────────────────────────────────────────────
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));

// ── AsyncStorage stub ────────────────────────────────────────────────────────
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn(),
  setItem:    jest.fn(),
  removeItem: jest.fn(),
}));

// ── Global fetch stub ────────────────────────────────────────────────────────
global.fetch = jest.fn();

describe('AdminModifyAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches users, displays “A B”, lets you edit u1→u1new, and issues a PUT', async () => {
    // 1) initial GET returns one user
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { _id: '1', username: 'u1', firstName: 'A', lastName: 'B', AccountType: [] },
          ]),
      })
      // 2) stub the PUT call
      .mockResolvedValueOnce({ ok: true })
      // 3) stub the re‐fetch after save
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            { _id: '1', username: 'u1new', firstName: 'A', lastName: 'B', AccountType: [] },
          ]),
      });

    const screen = render(
      <NavigationContainer>
        <SafeAreaProvider>
          <AdminModifyAccount />
        </SafeAreaProvider>
      </NavigationContainer>
    );

    // wait until the name "A B" appears
    await screen.findByText('A B');
    expect(screen.getByText('Modify Accounts')).toBeTruthy();
    expect(screen.getByText('A B')).toBeTruthy();

    // tap the username to enter edit mode
    fireEvent.press(screen.getByText('u1'));
    const input = screen.getByDisplayValue('u1');
    fireEvent.changeText(input, 'u1new');

    // press Save
    fireEvent.press(screen.getByText('Save'));

    // assert the 2nd fetch call was the PUT
    await waitFor(() => {
      const calls = (fetch as jest.Mock).mock.calls;
      const [url, opts] = calls[1];
      expect(url).toBe('http://localhost:3001/routes/api/adminMaintain');
      expect(opts.method).toBe('PUT');
      expect(JSON.parse(opts.body)).toEqual({
        userId: '1',
        username: 'u1new',
      });
    });
  });
});
