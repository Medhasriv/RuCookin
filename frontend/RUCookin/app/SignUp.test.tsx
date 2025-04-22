import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignUp from './SignUp';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('SignUp Component', () => {
  let routerPushMock: jest.Mock<void, [string]>; // Explicitly typed mock function

  beforeEach(() => {
    routerPushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPushMock,
    });

    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Reset the mocks to avoid cross-test contamination
    jest.resetAllMocks();
  });

  test('renders the SignUp screen correctly', () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    expect(screen.getByText("RUCookin'")).toBeTruthy();
    expect(screen.getByText("Create an Account")).toBeTruthy();
    expect(screen.getByPlaceholderText('First Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Last Name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
    expect(screen.getByText('Sign Up with Google')).toBeTruthy();
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

  test('toggles password visibility', () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    const passwordInput = screen.getByPlaceholderText('Password');
    const eyeIcon = screen.getByText('Show');

    expect(passwordInput.props.secureTextEntry).toBe(true);

    fireEvent.press(eyeIcon);

    expect(passwordInput.props.secureTextEntry).toBe(false);
    expect(screen.getByText('Hide')).toBeTruthy();
  });

  test('navigates to login page when link is pressed', async () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    fireEvent.press(screen.getByText('Already have an account? Log in here'));

    await waitFor(() => {
      expect(routerPushMock).toHaveBeenCalledWith('/Login');
    });
  });

  test('renders error message for invalid email format', async () => {
    render(
      <NavigationContainer>
        <SignUp />
      </NavigationContainer>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'invalid-email');
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email format.')).toBeTruthy();
    });
  });
});
