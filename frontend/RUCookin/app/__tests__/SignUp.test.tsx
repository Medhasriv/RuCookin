// mock for constants to avoid problems with Jest and our Cloud Deployment
jest.mock('expo-constants', () => ({
  manifest: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
  // fallback field name in newer Expo SDKs:
  expoConfig: { extra: { apiUrl: 'http://localhost:3001', spoonacularApiKey: 'fake-key' } },
}));

import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from '../SignUp';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

//performing the mocking before testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));

describe('SignUp Component', () => {
  let routerPushMock: jest.Mock<void, [string]>;

  beforeEach(() => {
    routerPushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    });

    global.fetch = jest.fn();
  });

    afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks(); 
    global.fetch = undefined as any; 
    });

    //checking if signup is rendered
  test('renders the SignUp screen', () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    //checking if these each show up for the sign up screen
    expect(screen.getByText("RUCookin'")).toBeTruthy();
    expect(screen.getByText("Create an Account")).toBeTruthy();
    expect(screen.getByPlaceholderText('First Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Last Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
    // expect(screen.getByText('Sign Up with Google')).toBeTruthy();
  });

  test('displays error messages for empty fields on form submission', async () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('First name is required.')).toBeTruthy();
      expect(screen.getByText('Last name is required.')).toBeTruthy();
      expect(screen.getByText('Username is required.')).toBeTruthy();
      expect(screen.getByText('Password is required.')).toBeTruthy();
      expect(screen.getByText('Email is required.')).toBeTruthy();
    });
  });

  test('submitting valid form should call the API and navigate', async () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'johndoe');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');

    const mockApiResponse = {
      token: 'mockToken',
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockApiResponse),
    });

    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/routes/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            password: 'password123',
            email: 'john@example.com',
          }),
        })
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'mockToken');
      expect(routerPushMock).toHaveBeenCalledWith('/CuisineLikes');
    });
  });

  test('shows general error message on failed sign up', async () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    fireEvent.changeText(screen.getByPlaceholderText('First Name'), 'John');
    fireEvent.changeText(screen.getByPlaceholderText('Last Name'), 'Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'john@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'johndoe');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Signup failed' }),
    });

    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Signup failed')).toBeTruthy();
    });
  });
});
