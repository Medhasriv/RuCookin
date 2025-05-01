// app/__tests__/Login.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Mock out native modules ────────────────────────────────────────────────

// AsyncStorage stub
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn(),
  setItem:    jest.fn(),
  removeItem: jest.fn(),
}));

// SafeAreaView stub
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Constants so API_BASE === 'http://localhost:3001'
jest.mock('expo-constants', () => ({
  manifest:   { extra: { apiUrl: 'http://localhost:3001' } },
  expoConfig: { extra: { apiUrl: 'http://localhost:3001' } },
}));

// Your Divider component—just render nothing
jest.mock('../../components/Divider', () => () => null);

// Stub out expo-router: both Link and useRouter
const mockRouter = { push: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    useRouter: () => mockRouter,
    Link: ({ children }: any) =>
      React.createElement(Text, { onPress: () => {} }, children),
  };
});

// jwt-decode stub
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

// Finally, a global fetch stub
global.fetch = jest.fn();

describe('Login screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation errors when fields are empty', () => {
    const { getByText } = render(<Login />);
    fireEvent.press(getByText('Login'));
    expect(getByText('Username is required.')).toBeTruthy();
    expect(getByText('Password is required.')).toBeTruthy();
  });

  it('logs in a normal user and navigates to HomePage', async () => {
    // Mock successful fetch
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve({ token: 'AAA.BBB.CCC' }),
    });
    // Mock jwtDecode to indicate non-admin
    require('jwt-decode').jwtDecode.mockReturnValue({ accountType: ['user'], name: 'Jane' });

    const { getByPlaceholderText, getByText } = render(<Login />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'jane');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      // 1) right endpoint & payload
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/routes/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'jane', password: 'password' }),
        })
      );
      // 2) token + UserInfo stored
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'AAA.BBB.CCC');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'UserInfo',
        JSON.stringify({ accountType: ['user'], name: 'Jane' })
      );
      // 3) navigates to HomePage
      expect(mockRouter.push).toHaveBeenCalledWith('/HomePage');
    });
  });

  it('logs in an admin user and navigates to adminHomePage', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok:   true,
      json: () => Promise.resolve({ token: 'XXX.YYY.ZZZ' }),
    });
    require('jwt-decode').jwtDecode.mockReturnValue({ accountType: ['admin'] });

    const { getByPlaceholderText, getByText } = render(<Login />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'boss');
    fireEvent.changeText(getByPlaceholderText('Password'), 'topsecret');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/adminHomePage');
    });
  });

  it('shows server error message on login failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok:   false,
      json: () => Promise.resolve({ message: 'Bad credentials' }),
    });

    const { getByPlaceholderText, getByText, findByText } = render(<Login />);
    fireEvent.changeText(getByPlaceholderText('Username'), 'jane');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
    fireEvent.press(getByText('Login'));

    // wait for the error message to appear
    expect(await findByText('Bad credentials')).toBeTruthy();
  });
});
